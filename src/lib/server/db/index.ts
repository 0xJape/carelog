import { drizzle } from 'drizzle-orm/postgres-js';
import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

// Configure postgres client with SSL for Supabase
// Vercel serverless functions need connection pooling
export const client = postgres(connectionString, {
	ssl: 'require',
	max: 1, // Limit connections for serverless
	idle_timeout: 20,
	connect_timeout: 10
});

export const db = drizzle(client, { schema });
