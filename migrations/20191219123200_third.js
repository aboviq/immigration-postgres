'use strict';
const {Pool} = require('pg');

const pool = new Pool();

exports.up = async () => {
	const {rows} = await pool.query(`
		SELECT * FROM immigration_postgres;
	`);
	if (rows[0].value !== 'second') {
		throw new Error('Wrong db content!');
	}
};

exports.down = () => {};
