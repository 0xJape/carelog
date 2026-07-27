import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const formData = await request.formData();
	const audio = formData.get('audio');
	if (!(audio instanceof File) || !audio.size) {
		return json({ error: 'Audio recording is required' }, { status: 400 });
	}
	if (audio.size > MAX_AUDIO_BYTES || !audio.type.startsWith('audio/')) {
		return json({ error: 'Use an audio recording under 10 MB' }, { status: 400 });
	}
	if (!env.GROQ_API_KEY) return json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });

	const groqForm = new FormData();
	groqForm.set('file', audio, audio.name || 'visit-note.webm');
	groqForm.set('model', 'whisper-large-v3-turbo');
	groqForm.set('response_format', 'json');

	const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
		body: groqForm
	});
	if (!response.ok) {
		return json({ error: 'Transcription failed' }, { status: 502 });
	}

	const result = await response.json();
	return json({ transcript: result.text ?? '' });
};