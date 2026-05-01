import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export const GET: RequestHandler = async (event) => {
	const sessionToken = event.cookies.get('auth-session');

	if (sessionToken) {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
		await invalidateSession(sessionId);
	}

	deleteSessionTokenCookie(event);

	throw redirect(302, '/login');
};
