import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_TEXT_LENGTH = 6000;
const requests = new Map<string, { count: number; resetAt: number }>();

function rateLimited(address: string): boolean {
	const now = Date.now();
	const current = requests.get(address);
	if (!current || current.resetAt <= now) {
		requests.set(address, { count: 1, resetAt: now + 60_000 });
		return false;
	}
	current.count++;
	return current.count > 12;
}

export const POST: RequestHandler = async ({ request, fetch, getClientAddress }) => {
	if (rateLimited(getClientAddress())) error(429, 'Too many requests');
	const { text } = await request.json().catch(() => ({}));
	if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT_LENGTH) {
		error(400, 'Text is required and must be under 6,000 characters');
	}
	if (!env.GROQ_API_KEY) error(500, 'GROQ_API_KEY is not configured');

	const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.GROQ_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'canopylabs/orpheus-v1-english',
			voice: 'diana',
			input: text.trim(),
			response_format: 'wav'
		})
	});
	if (!response.ok) error(502, 'Speech generation failed');

	return new Response(response.body, {
		headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' }
	});
};