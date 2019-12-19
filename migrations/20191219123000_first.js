'use strict';
const {sql, createPool} = require('slonik');

const pool = createPool(
	`postgres://postgres@${process.env.POSTGRES_HOST || 'localhost'}/immigration_postgres`
);

exports.up = () =>
	pool.query(sql`
	CREATE TABLE immigration_postgres (
		value varchar(100)
	);
`);

exports.down = () => {};
