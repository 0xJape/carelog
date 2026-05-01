import { drizzle } from 'drizzle-orm/postgres-js';
import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
