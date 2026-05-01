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
	ssl: { rejectUnauthorized: false }, // More permissive SSL for Supabase
	max: 1, // Limit connections for serverless
	idle_timeout: 20,
	connect_timeout: 10,
	prepare: false // Disable prepared statements for better compatibility
});

export const db = drizzle(client, { schema });
