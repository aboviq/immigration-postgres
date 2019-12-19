'use strict';
const {sql, createPool} = require('slonik');

const pool = createPool(
	`postgres://postgres@${process.env.POSTGRES_HOST || 'localhost'}/immigration_postgres`
);

exports.up = () =>
	pool.one(sql`
	SELECT * FROM immigration_postgres;
`);

exports.down = () => {};
