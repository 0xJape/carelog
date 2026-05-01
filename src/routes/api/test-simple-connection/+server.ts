import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';

export const GET: RequestHandler = async () => {
	const result = {
		connection_test: 'starting',
		error: null as string | null,
		success: false
	};

	try {
		// Try to connect with minimal config
		const sql = postgres(DATABASE_URL, {
			ssl: { rejectUnauthorized: false },
			max: 1,
			connect_timeout: 10
		});

		// Try a simple query
		const testResult = await sql`SELECT 1 as test`;
		result.connection_test = 'connected';
		result.success = true;
		
		await sql.end();
	} catch (err: any) {
		result.error = err.message || String(err);
		result.connection_test = 'failed';
	}

	return json(result);
};
