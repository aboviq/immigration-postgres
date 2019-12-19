'use strict';
const {resolve} = require('path');
const {sql, createPool} = require('slonik');

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

	const {table, connectionUri, clientConfiguration} = options;
	if (typeof table !== 'string') {
		throw new TypeError('Expected "table" to exist in configuration options');
	}

	if (typeof connectionUri !== 'string') {
		throw new TypeError('Expected "connectionUri" to exist in configuration options');
	}

	console.log(connectionUri);

	const pool = createPool(connectionUri, clientConfiguration);

	const prepare = mem(async () => {
		const exists = await pool.oneFirst(sql`
			SELECT EXISTS (
				SELECT 1 as exists
				FROM
					information_schema.tables
				WHERE
					table_schema = 'public'
					AND table_name = ${table}
			)`);
		if (exists) {
			return;
		}

		await pool.query(sql`
			CREATE TABLE ${sql.identifier([table])} (
				name varchar(255) not null primary key,
				status varchar(32),
				date timestamptz not null
			)
		`);
	});

	const log = (name, status, date) => {
		return prepare().then(() =>
			pool.query(sql`
				INSERT INTO ${sql.identifier([table])} (name, status, date)
				VALUES (${name}, ${status}, to_timestamp(${date instanceof Date ? date.getTime() : date}))
				ON CONFLICT (name) DO UPDATE
				SET
					status = excluded.status,
					date = excluded.date;
			`)
		);
	};

	const unlog = name => {
		return prepare().then(() =>
			pool.query(sql`DELETE FROM ${sql.identifier([table])} WHERE name = ${name};`)
		);
	};

	const lock = () => {
		return prepare()
			.then(() =>
				pool.query(sql`
				INSERT INTO ${sql.identifier([table])} (name, date)
				VALUES (${LOCK_ID}, to_timestamp(${Date.now()}))
			`)
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
		return prepare().then(() =>
			pool.oneFirst(sql`SELECT 1 AS exist FROM ${sql.identifier([table])} WHERE name = ${LOCK_ID};`)
		);
	};

	const executed = () => {
		return prepare()
			.then(() => pool.any(sql`SELECT * FROM ${sql.identifier([table])} WHERE name <> ${LOCK_ID};`))
			.then(rows =>
				rows.map(row => {
					if (typeof row.date === 'number') {
						row.date = new Date(row.date);
					}
					return row;
				})
			);
	};

	return {log, unlog, lock, unlock, isLocked, executed};
};
