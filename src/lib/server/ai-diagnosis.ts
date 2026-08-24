/**
 * ai-diagnosis.ts — AI pre-diagnosis assistant for CLINIQAI
 *
 * Uses Groq (openai/gpt-oss-120b) to give the school nurse an
 * evidence-flavored pre-diagnosis: possible causes, severity, suggested
 * remedies / OTC medications, first-aid steps, red flags, and referral advice.
 *
 * IMPORTANT: This is a DECISION-SUPPORT tool. It assists the school nurse's
 * triage — it never replaces professional medical judgment.
 */

import { env } from '$env/dynamic/private';

const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
1. Give a short plain-language "summary" (2 sentences max) of what is likely going on.
2. Set "assessedSeverity" using your own clinical reasoning (do not just copy the nurse's guess).
3. List 2-4 "possibleConditions", most likely first, each with a likelihood and a one-sentence explanation.
4. Suggest simple "recommendedRemedies" appropriate for a school clinic (rest, hydration, ice pack, immobilization, elevation, etc.). For musculoskeletal injuries (dislocation, fracture, sprain), ALWAYS lead with immobilization and DO NOT attempt reduction.
5. Suggest "suggestedMedications" — only common, school-clinic-appropriate OTC options (e.g., paracetamol, oral rehydration salts, antihistamine). Rules:
	- Do not default to paracetamol or oral rehydration salts. Recommend each only when the reported symptoms specifically indicate pain, fever, vomiting, diarrhea, or dehydration.
	- Tailor medication choices to the likely condition. Examples: antihistamine for a mild allergic reaction, oral rehydration salts for fluid loss, and no medication for cases best managed with first aid or observation.
	- Never invent variety. If medication is unnecessary or the available history is insufficient to dose safely, return an empty array and emphasize non-drug care.
	- Consider age, known conditions, allergies, current medication, contraindications, and the school's medication policy before suggesting any option.
   - For structural injuries (dislocation, fracture, severe sprain), only suggest pain relief medication if the student is in pain AND referral is recommended — do not suggest medications as the primary treatment.
	- Do not give a fixed adult dose unless age and weight make it clearly appropriate. Prefer "Use label or standing-order age/weight dose" when weight is unavailable.
	- Keep "dosageNote" short. No pharmacology lectures.
   - CRITICAL: If the student's allergies or current medications create a risk, warn in the caution field and never suggest something they are allergic to.
   - If no medication is appropriate, return an empty array.
6. Give clear step-by-step "firstAidSteps" the nurse can follow RIGHT NOW. Keep each step to one short sentence.
7. List "redFlags" — specific warning signs that mean the student needs urgent escalation. Keep each to one short phrase.
8. Set "referralRecommended" true if this likely needs a doctor/hospital, and explain "referralReason" in one sentence.

Be cautious and safety-first. For injuries, immobilization and referral always come before medication. Keep ALL text short and scannable — this is read by a busy nurse during an emergency.`;
}

export async function generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
	const apiKey = env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error('GROQ_API_KEY is not configured');
	}

	const body = {
		model: GROQ_MODEL,
		temperature: 0.2,
		max_tokens: 1400,
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content:
					'Return valid JSON only. Match requested fields and allowed enum values exactly. Do not include markdown.'
			},
			{
				role: 'user',
				content: `${buildPrompt(input)}\n\nReturn JSON with this schema: ${JSON.stringify(RESPONSE_SCHEMA)}`
			}
		]
	};

	const res = await fetch(GROQ_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errText = await res.text().catch(() => '');
		throw new Error(`Groq API error (${res.status}): ${errText.slice(0, 300)}`);
	}

	const data = await res.json();
	const text: string | undefined = data?.choices?.[0]?.message?.content;

	if (!text) {
		throw new Error('Groq returned an empty response');
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
