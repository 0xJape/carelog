import { generateDiagnosis } from '$lib/server/ai-diagnosis.js';
import { ruleBasedDiagnosis } from '$lib/server/ai-rules.js';
import { db } from '$lib/server/db/index.js';
import { students } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function calcAge(dob: Date): number {
	const now = new Date();
	let age = now.getFullYear() - dob.getFullYear();
	const m = now.getMonth() - dob.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
	return age;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require an authenticated session
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let payload: {
		studentId?: string;
		reason?: string;
		details?: string;
		visitType?: string;
		severity?: string;
	};

	try {
		payload = await request.json();
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { studentId, reason, details, visitType, severity } = payload;

	if (!studentId || !reason?.trim()) {
		return json({ error: 'Student and reason for visit are required' }, { status: 400 });
	}

	// Fetch the student's medical context server-side (never trust client data)
	const [student] = await db
		.select({
			firstName: students.firstName,
			lastName: students.lastName,
			dateOfBirth: students.dateOfBirth,
			gender: students.gender,
			chronicHealthConditions: students.chronicHealthConditions,
			currentMedications: students.currentMedications,
			healthHistory: students.healthHistory
		})
		.from(students)
		.where(eq(students.id, studentId))
		.limit(1);

	if (!student) {
		return json({ error: 'Student not found' }, { status: 404 });
	}

	try {
		const result = await generateDiagnosis({
			reason: reason.trim(),
			details: details?.trim(),
			visitType,
			severity,
			student: {
				firstName: student.firstName,
				lastName: student.lastName,
				age: student.dateOfBirth ? calcAge(new Date(student.dateOfBirth)) : null,
				gender: student.gender,
				chronicHealthConditions: student.chronicHealthConditions ?? [],
				currentMedications: student.currentMedications ?? [],
				healthHistory: student.healthHistory
			}
		});

		return json({ result, source: 'ai' });
	} catch (err) {
		console.error('AI diagnosis error — falling back to rule engine:', err);
		// Offline fallback: rule-based engine
		const result = ruleBasedDiagnosis(reason.trim(), details?.trim(), visitType);
		return json({ result, source: 'rules' });
	}
};
