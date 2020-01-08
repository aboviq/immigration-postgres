'use strict';
const {Pool} = require('pg');

const pool = new Pool();

exports.up = async () => {
	await pool.query(`
		DROP TABLE immigration_postgres;
	`);
	const {rows} = await pool.query(`SELECT * FROM migrations`);
	console.log(
		rows.map(row => `${row.name} - ${row.status} - ${row.date.toISOString()}`).join('\n')
	);
};

exports.down = () => {};
