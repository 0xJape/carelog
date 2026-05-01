import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import { generateSessionToken, createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();
		
		const results = {
			step1_input: { email, password: password ? '***' : 'missing' },
			step2_db_query: null as any,
			step3_user_found: false,
			step4_password_valid: false,
			step5_session_created: false,
			step6_cookie_set: false,
			errors: [] as string[]
		};

		// Step 2: Query database
		try {
			const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
			results.step2_db_query = 'success';
			
			if (user) {
				results.step3_user_found = true;
				results.step2_db_query = {
					email: user.email,
					role: user.role,
					isActive: user.isActive,
					hasPasswordHash: !!user.passwordHash
				};

				// Step 4: Verify password
				try {
					const valid = await verify(user.passwordHash, password);
					results.step4_password_valid = valid;

					if (valid) {
						// Step 5: Create session
						try {
							const sessionToken = generateSessionToken();
							const session = await createSession(sessionToken, user.id);
							results.step5_session_created = true;

							// Step 6: Set cookie
							try {
								cookies.set('auth-session', sessionToken, {
									expires: session.expiresAt,
									path: '/',
									httpOnly: true,
									secure: true,
									sameSite: 'lax'
								});
								results.step6_cookie_set = true;
							} catch (err: any) {
								results.errors.push(`Cookie error: ${err.message}`);
							}
						} catch (err: any) {
							results.errors.push(`Session creation error: ${err.message}`);
						}
					}
				} catch (err: any) {
					results.errors.push(`Password verification error: ${err.message}`);
				}
			} else {
				results.errors.push('User not found');
			}
		} catch (err: any) {
			results.errors.push(`Database error: ${err.message}`);
		}

		return json(results);
	} catch (err: any) {
		return json({ error: err.message, stack: err.stack }, { status: 500 });
	}
};
