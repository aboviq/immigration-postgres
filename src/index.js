'use strict';
const {resolve} = require('path');
const {Pool} = require('pg');

const LOCK_ID = '***LOCK***';

const mem = fn => {
	let result;
	return () => {
		if (!result) {
			result = fn();
		}

		return result;
	};
};

exports.init = function({config, ...options} = {}, dir) {
	if (config) {
		try {
			Object.assign(options, require(resolve(dir, config)));
		} catch (error) {
			error.message = `Unable to load configuration file.\n${error.message}`;
			throw error;
		}
	}

	const {table, ...connectionOpts} = options;
	if (typeof table !== 'string') {
		throw new TypeError('Expected "table" to exist in configuration options');
	}

	if (/[^a-z_0-9]/.test(table)) {
		throw new TypeError(
			'Only alphanumeric characters and underscores are allowed in the table name'
		);
	}

	const pool = new Pool(connectionOpts);

	const prepare = mem(async () => {
		const {rows} = await pool.query({
			text: `
				SELECT 1 as exists
				FROM
					information_schema.tables
				WHERE
					table_schema = 'public'
					AND table_name = $1
			`,
			values: [table]
		});

		if (rows[0] && rows[0].exists) {
			return;
		}

		await pool.query(`
			CREATE TABLE ${table} (
				name varchar(255) not null primary key,
				status varchar(32),
				date timestamptz not null
			)
		`);
	});

	const log = (name, status, date) => {
		return prepare().then(() =>
			pool.query({
				text: `
					INSERT INTO ${table} (name, status, date)
					VALUES ($1, $2, $3)
					ON CONFLICT (name) DO UPDATE
					SET
						status = excluded.status,
						date = excluded.date;
				`,
				values: [name, status, date],
				name: 'log'
			})
		);
	};

	const unlog = name => {
		return prepare().then(() => pool.query(`DELETE FROM ${table} WHERE name = $1;`, [name]));
	};

	const lock = () => {
		return prepare()
			.then(() =>
				pool.query({
					text: `
						INSERT INTO ${table} (name, date)
						VALUES ($1, $2)
					`,
					values: [LOCK_ID, new Date()],
					name: 'lock'
				})
			)
			.catch(error => {
				error.message = `Failed to acquire migration lock\nCaused by: ${error.message}`;

				throw error;
			});
	};

	const unlock = () => {
		return unlog(LOCK_ID);
	};

	const isLocked = () => {
		return prepare()
			.then(() => pool.query(`SELECT 1 AS exist FROM ${table} WHERE name = $1;`, [LOCK_ID]))
			.then(({rows}) => rows[0] && rows[0].exist);
	};

	const executed = () => {
		return prepare()
			.then(() => pool.query(`SELECT * FROM ${table} WHERE name <> $1;`, [LOCK_ID]))
			.then(({rows}) => rows);
	};

	return {log, unlog, lock, unlock, isLocked, executed};
};
