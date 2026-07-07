/**
 * ai-diagnosis.ts — AI pre-diagnosis assistant for CLINIQAI
 *
 * Uses Google Gemini (gemini-2.5-flash) to give the school nurse an
 * evidence-flavored pre-diagnosis: possible causes, severity, suggested
 * remedies / OTC medications, first-aid steps, red flags, and referral advice.
 *
 * IMPORTANT: This is a DECISION-SUPPORT tool. It assists the school nurse's
 * triage — it never replaces professional medical judgment.
 */

import { env } from '$env/dynamic/private';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface StudentMedicalContext {
	firstName: string;
	lastName: string;
	age?: number | null;
	gender?: string | null;
	chronicHealthConditions?: string[];
	currentMedications?: string[];
	healthHistory?: string | null;
}

export interface DiagnosisInput {
	reason: string;
	details?: string;
	visitType?: string;
	severity?: string;
	student: StudentMedicalContext;
}

export interface PossibleCondition {
	name: string;
	likelihood: 'high' | 'moderate' | 'low';
	explanation: string;
}

export interface SuggestedMedication {
	name: string;
	purpose: string;
	dosageNote: string;
	caution?: string;
}

export interface DiagnosisResult {
	summary: string;
	assessedSeverity: 'low' | 'moderate' | 'high' | 'critical';
	possibleConditions: PossibleCondition[];
	recommendedRemedies: string[];
	suggestedMedications: SuggestedMedication[];
	firstAidSteps: string[];
	redFlags: string[];
	referralRecommended: boolean;
	referralReason?: string;
	disclaimer: string;
}

const DISCLAIMER =
	'This is an AI-generated pre-diagnosis to support the school nurse. It is not a medical diagnosis. ' +
	'Always rely on professional clinical judgment and seek a licensed physician for anything beyond basic first aid.';

/**
 * JSON schema Gemini must follow (structured output).
 */
const RESPONSE_SCHEMA = {
	type: 'object',
	properties: {
		summary: { type: 'string' },
		assessedSeverity: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
		possibleConditions: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					likelihood: { type: 'string', enum: ['high', 'moderate', 'low'] },
					explanation: { type: 'string' }
				},
				required: ['name', 'likelihood', 'explanation']
			}
		},
		recommendedRemedies: { type: 'array', items: { type: 'string' } },
		suggestedMedications: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					purpose: { type: 'string' },
					dosageNote: { type: 'string' },
					caution: { type: 'string' }
				},
				required: ['name', 'purpose', 'dosageNote']
			}
		},
		firstAidSteps: { type: 'array', items: { type: 'string' } },
		redFlags: { type: 'array', items: { type: 'string' } },
		referralRecommended: { type: 'boolean' },
		referralReason: { type: 'string' }
	},
	required: [
		'summary',
		'assessedSeverity',
		'possibleConditions',
		'recommendedRemedies',
		'suggestedMedications',
		'firstAidSteps',
		'redFlags',
		'referralRecommended'
	]
};

function buildPrompt(input: DiagnosisInput): string {
	const s = input.student;
	const conditions = s.chronicHealthConditions?.length
		? s.chronicHealthConditions.join(', ')
		: 'None on record';
	const meds = s.currentMedications?.length
		? s.currentMedications.join(', ')
		: 'None on record';
	const history = s.healthHistory?.trim() || 'None on record';

	return `You are an experienced school clinic triage assistant supporting a school nurse in the Philippines. A student has come to the clinic. Analyze the case and produce a careful, practical pre-diagnosis.

STUDENT PROFILE
- Name: ${s.firstName} ${s.lastName}
- Age: ${s.age ?? 'unknown'}
- Gender: ${s.gender ?? 'unknown'}
- Known chronic conditions: ${conditions}
- Current medications: ${meds}
- Health history / allergies: ${history}

PRESENTING CASE
- Reason for visit: ${input.reason}
- Details / symptoms: ${input.details?.trim() || 'Not specified'}
- Nurse-selected visit type: ${input.visitType ?? 'other'}
- Nurse-selected severity: ${input.severity ?? 'low'}

INSTRUCTIONS
1. Give a short plain-language "summary" of what is likely going on.
2. Set "assessedSeverity" using your own clinical reasoning (do not just copy the nurse's guess).
3. List 2-4 "possibleConditions", most likely first, each with a likelihood and a one-sentence explanation.
4. Suggest simple "recommendedRemedies" appropriate for a school clinic (rest, hydration, ice pack, elevation, etc.).
5. Suggest "suggestedMedications" — only common, school-clinic-appropriate OTC options (e.g., paracetamol, oral rehydration salts, antihistamine). For each give purpose and a general dosageNote, plus a caution if relevant. CRITICAL: If the student's allergies or current medications create a risk, warn about it in the caution field, and never suggest something they are allergic to.
6. Give clear step-by-step "firstAidSteps" the nurse can follow now.
7. List "redFlags" — warning signs that mean the student needs urgent escalation.
8. Set "referralRecommended" true if this likely needs a doctor/hospital, and explain in "referralReason".

Be cautious and safety-first. When symptoms are vague or severe, lean toward recommending referral. Keep language clear and concise for a busy nurse.`;
}

export async function generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
	const apiKey = env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}

	const body = {
		contents: [
			{
				role: 'user',
				parts: [{ text: buildPrompt(input) }]
			}
		],
		generationConfig: {
			temperature: 0.4,
			responseMimeType: 'application/json',
			responseSchema: RESPONSE_SCHEMA
		}
	};

	const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errText = await res.text().catch(() => '');
		throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 300)}`);
	}

	const data = await res.json();
	const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

	if (!text) {
		throw new Error('Gemini returned an empty response');
	}

	let parsed: Omit<DiagnosisResult, 'disclaimer'>;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error('Failed to parse AI response');
	}

	return {
		...parsed,
		possibleConditions: parsed.possibleConditions ?? [],
		recommendedRemedies: parsed.recommendedRemedies ?? [],
		suggestedMedications: parsed.suggestedMedications ?? [],
		firstAidSteps: parsed.firstAidSteps ?? [],
		redFlags: parsed.redFlags ?? [],
		disclaimer: DISCLAIMER
	};
}
