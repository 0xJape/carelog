import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { verify } from '@node-rs/argon2';
import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		return redirect(302, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		console.log('Login attempt started');
		try {
			const { request } = event;
			const form = await request.formData();
			const email = String(form.get('email') || '')
				.trim()
				.toLowerCase();
			const password = String(form.get('password') || '');

			console.log('Login attempt for:', email);

			if (!email || !password) {
				console.log('Missing email or password');
				return fail(400, { error: 'Email and password are required.' });
			}

			// Find user by email
			const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
			if (!user || !user.isActive) {
				console.log('User not found or inactive');
				return fail(401, { error: 'Invalid email or password.' });
			}

			console.log('User found:', user.email);

			// Check password
			const valid = await verify(user.passwordHash, password);
			if (!valid) {
				console.log('Invalid password');
				return fail(401, { error: 'Invalid email or password.' });
			}

			console.log('Password valid');

			// Update last login time
			await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

			// Create session using Lucia auth
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, user.id);
			console.log('Session created:', session.id);

			setSessionTokenCookie(event, sessionToken, session.expiresAt);
			console.log('Cookie set, redirecting to /');

			return redirect(303, '/');
		} catch (err) {
			if (isRedirect(err)) {
				console.log('Redirect caught, rethrowing');
				throw err;
			}
			console.error('Login error:', err);

			return redirect(302, '/login');
		}
	}
};
