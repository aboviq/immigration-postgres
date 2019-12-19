# immigration-postgres

[![Build status][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![XO code style][codestyle-image]][codestyle-url]

> Postgres adapter for [Immigration](https://github.com/blakeembrey/node-immigration)

## Installation

Install `immigration-postgres` and it's peers: `immigration` using [npm](https://www.npmjs.com/):

```bash
npm install --save immigration immigration-postgres
```

## Usage

The adapter will automatically create the given `table` on first run (if it doesn't exist already).

```bash
immigration --use [ immigration-postgres --table migrations --config ./src/a-postgres-config-file ] up --new
```

## Options

| Name                | Type                      | Description                                                                                               | Required |
| ------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| table               | `String`                  | The table name for migrations to be persisted (created automatically)                                     | yes      |
| config              | `String`                  | A path to a module or json exporting/containing options (I.e. `require(options.config)`)                  | no       |
| connectionUri       | `String`                  | A PostgreSQL Connection URI for [Slonik's `createPool`](https://github.com/gajus/slonik#slonik-usage-api) | no       |
| clientConfiguration | `ClientConfigurationType` | The client configuration for [Slonik's `createPool`](https://github.com/gajus/slonik#slonik-usage-api)    | no       |

## License

MIT © [Aboviq AB](https://www.aboviq.com)

[npm-url]: https://npmjs.org/package/immigration-postgres
[npm-image]: https://badge.fury.io/js/immigration-postgres.svg
[travis-url]: https://travis-ci.org/joakimbeng/immigration-postgres
[travis-image]: https://travis-ci.org/joakimbeng/immigration-postgres.svg?branch=master
[codestyle-url]: https://github.com/sindresorhus/xo
[codestyle-image]: https://img.shields.io/badge/code%20style-XO-5ed9c7.svg?style=flat
