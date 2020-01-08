'use strict';
const {Pool} = require('pg');

const pool = new Pool();

exports.up = () =>
	pool.query(`
		INSERT INTO immigration_postgres (value) VALUES ('second');
	`);

exports.down = () => {};
