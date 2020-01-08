'use strict';
const {Pool} = require('pg');

const pool = new Pool();

exports.up = () =>
	pool.query(`
		CREATE TABLE immigration_postgres (
			value varchar(100)
		);
	`);

exports.down = () => {};
