import dotenv from 'dotenv';
import knex from 'knex';
dotenv.config();

const DB_PATH = process.env.DB_PATH;

export const db = knex({
    client: 'better-sqlite3',
    connection: {
        filename: DB_PATH
    },
    useNullAsDefault: true
});

