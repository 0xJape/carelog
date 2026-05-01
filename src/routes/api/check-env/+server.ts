import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DATABASE_URL } from '$env/static/private';

export const GET: RequestHandler = async () => {
	return json({
		has_database_url: !!DATABASE_URL,
		database_url_length: DATABASE_URL?.length || 0,
		database_url_preview: DATABASE_URL?.substring(0, 50) || 'NOT SET',
		contains_pooler: DATABASE_URL?.includes('pooler.supabase.com') || false,
		contains_old_host: DATABASE_URL?.includes('db.lyrznprrddndfkxbolyj.supabase.co') || false,
		port: DATABASE_URL?.includes(':6543') ? '6543 (pooler)' : DATABASE_URL?.includes(':5432') ? '5432 (direct)' : 'unknown'
	});
};
