import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DATABASE_URL } from '$env/static/private';

export const GET: RequestHandler = async () => {
	const result = {
		database_url_exists: !!DATABASE_URL,
		database_url_length: DATABASE_URL?.length || 0,
		database_url_starts_with: DATABASE_URL?.substring(0, 20) || 'NOT SET',
		database_url_contains_supabase: DATABASE_URL?.includes('supabase.co') || false,
		database_url_port: DATABASE_URL?.includes(':5432') ? '5432' : 'unknown',
		timestamp: new Date().toISOString()
	};

	return json(result);
};
