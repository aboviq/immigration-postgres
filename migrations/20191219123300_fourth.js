'use strict';
const {Pool} = require('pg');

const pool = new Pool();

exports.up = async () => {
	await pool.query(`
		DROP TABLE immigration_postgres;
	`);
};

exports.down = () => {};
