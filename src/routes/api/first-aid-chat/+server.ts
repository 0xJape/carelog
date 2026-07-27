import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `You are CLINIQAI First Aid, a concise first-aid guide for school and home incidents.
Only answer first-aid questions. Refuse diagnosis, prescriptions, dosage decisions, unrelated topics, and instructions beyond basic immediate care.
Give calm, numbered, practical steps. Start with scene safety when relevant. Include what not to do.
Frame every response as temporary immediate care. End by telling the student to bring their classmate to the school clinic if safely possible, or immediately tell a teacher or other responsible adult so the classmate can receive the best available care.
For breathing trouble, unconsciousness, severe bleeding, seizure over 5 minutes, suspected spinal injury, anaphylaxis, poisoning, or other danger signs, tell the user to call local emergency services now and seek an adult or trained professional.
Ask one short clarifying question when essential. Never claim certainty. End with a brief escalation warning when appropriate.`;

const requests = new Map<string, { count: number; resetAt: number }>();

function rateLimited(address: string): boolean {
	const now = Date.now();
	const current = requests.get(address);
	if (!current || current.resetAt <= now) {
		requests.set(address, { count: 1, resetAt: now + 60_000 });
		return false;
	}
	current.count++;
	return current.count > 10;
}

export const POST: RequestHandler = async ({ request, fetch, getClientAddress }) => {
	if (rateLimited(getClientAddress())) return json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
	if (!env.GROQ_API_KEY) return json({ error: 'Assistant unavailable' }, { status: 503 });

	const body = await request.json().catch(() => null);
	const messages = body?.messages;
	if (!Array.isArray(messages) || messages.length < 1 || messages.length > 10) {
		return json({ error: 'Provide 1 to 10 messages' }, { status: 400 });
	}

	const safeMessages: ChatMessage[] = [];
	for (const message of messages) {
		if (
			!message ||
			!['user', 'assistant'].includes(message.role) ||
			typeof message.content !== 'string' ||
			!message.content.trim() ||
			message.content.length > 1000
		) {
			return json({ error: 'Invalid message' }, { status: 400 });
		}
		safeMessages.push({ role: message.role, content: message.content.trim() });
	}

	const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.GROQ_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'llama-3.1-8b-instant',
			temperature: 0.2,
			max_tokens: 500,
			messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages]
		})
	});
	if (!response.ok) return json({ error: 'Assistant unavailable' }, { status: 502 });

	const data = await response.json();
	const reply = data?.choices?.[0]?.message?.content?.trim();
	return reply ? json({ reply }) : json({ error: 'Empty response' }, { status: 502 });
};