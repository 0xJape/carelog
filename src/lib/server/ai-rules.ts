/**
 * ai-rules.ts — Offline rule-based pre-diagnosis fallback for CLINIQAI
 *
 * Used when the Gemini API is unavailable or returns an error.
 * Maps symptom keywords in reason/details to conditions, first aid, and medications.
 * Designed for school clinic use in the Philippines.
 */

import type { DiagnosisResult } from './ai-diagnosis.js';

const DISCLAIMER =
	'This is a rule-based offline pre-diagnosis to support the school nurse. ' +
	'It is not a medical diagnosis. Always rely on professional clinical judgment.';

interface Rule {
	keywords: string[];
	conditions: DiagnosisResult['possibleConditions'];
	severity: DiagnosisResult['assessedSeverity'];
	summary: string;
	remedies: string[];
	medications: DiagnosisResult['suggestedMedications'];
	firstAid: string[];
	redFlags: string[];
	referral: boolean;
	referralReason?: string;
}

const RULES: Rule[] = [
	{
		keywords: ['fever', 'temperature', 'hot', 'malamig', 'lagnat'],
		conditions: [
			{ name: 'Fever (viral)', likelihood: 'high', explanation: 'Common viral illness causing elevated body temperature.' },
			{ name: 'Dengue (early)', likelihood: 'low', explanation: 'Consider if fever persists >2 days with rash or body pain.' }
		],
		severity: 'moderate',
		summary: 'Student has fever. Monitor temperature and keep hydrated.',
		remedies: ['Rest in clinic bed', 'Hydrate with water or ORS', 'Remove excess clothing', 'Apply cool damp cloth to forehead'],
		medications: [{ name: 'Paracetamol', purpose: 'Reduce fever and discomfort', dosageNote: '500mg every 4-6 hrs' }],
		firstAid: ['Take temperature reading', 'Give paracetamol if ≥38°C', 'Offer water or ORS', 'Monitor every 30 mins'],
		redFlags: ['Temperature >40°C', 'Seizures', 'Rash with fever', 'Unresponsive or confused'],
		referral: false
	},
	{
		keywords: ['headache', 'sakit ng ulo', 'head pain', 'migraine'],
		conditions: [
			{ name: 'Tension headache', likelihood: 'high', explanation: 'Common stress or dehydration-related headache.' },
			{ name: 'Dehydration', likelihood: 'moderate', explanation: 'Insufficient fluid intake can cause headache.' }
		],
		severity: 'low',
		summary: 'Student complains of headache. Likely tension or dehydration-related.',
		remedies: ['Rest in quiet area', 'Offer water', 'Dim lighting if available'],
		medications: [{ name: 'Paracetamol', purpose: 'Pain relief', dosageNote: '500mg once' }],
		firstAid: ['Have student rest', 'Offer water', 'Give paracetamol if pain is significant', 'Check for fever'],
		redFlags: ['Sudden severe headache', 'Headache with vomiting', 'Vision changes', 'Neck stiffness'],
		referral: false
	},
	{
		keywords: ['stomachache', 'stomach pain', 'abdominal', 'sakit ng tiyan', 'tummy', 'nausea', 'vomiting', 'diarrhea', 'LBM'],
		conditions: [
			{ name: 'Gastroenteritis', likelihood: 'high', explanation: 'Stomach flu — nausea, vomiting, or loose stools.' },
			{ name: 'Indigestion', likelihood: 'moderate', explanation: 'Discomfort from food or stress.' }
		],
		severity: 'low',
		summary: 'Student reports stomach discomfort. Likely gastroenteritis or indigestion.',
		remedies: ['Rest', 'Offer ORS or water in small sips', 'Avoid food until nausea subsides'],
		medications: [{ name: 'Oral Rehydration Salts (ORS)', purpose: 'Rehydration', dosageNote: '1 sachet in 250ml water' }],
		firstAid: ['Have student rest', 'Give ORS in small sips', 'Monitor for worsening pain', 'Check for fever'],
		redFlags: ['Severe cramping', 'Blood in stool or vomit', 'Signs of dehydration', 'Pain localized to lower right abdomen'],
		referral: false
	},
	{
		keywords: ['dislocation', 'dislocated', 'displaced', 'shoulder', 'elbow', 'joint out'],
		conditions: [
			{ name: 'Joint dislocation', likelihood: 'high', explanation: 'Bone displaced from joint, common in shoulder/elbow from sports.' }
		],
		severity: 'high',
		summary: 'Suspected joint dislocation. Immobilize and refer immediately — do not attempt reduction.',
		remedies: ['Immobilize in current position using sling or splint', 'Apply ice wrapped in cloth (20 min on/off)', 'Keep student calm and still'],
		medications: [{ name: 'Paracetamol', purpose: 'Pain relief while awaiting referral', dosageNote: '500mg once', caution: 'Pain relief only — do not delay referral' }],
		firstAid: ['Do NOT attempt to reduce the joint', 'Support arm in position found', 'Apply ice pack wrapped in cloth', 'Immobilize with sling', 'Arrange transport to clinic/hospital'],
		redFlags: ['Numbness or tingling in limb', 'No pulse below injury', 'Open wound near joint', 'Severe swelling'],
		referral: true,
		referralReason: 'Dislocation requires physician reduction under proper conditions.'
	},
	{
		keywords: ['fracture', 'broken', 'nabali', 'crack', 'bone'],
		conditions: [
			{ name: 'Suspected fracture', likelihood: 'high', explanation: 'Possible bone break from impact or fall.' }
		],
		severity: 'high',
		summary: 'Suspected fracture. Immobilize and refer for X-ray.',
		remedies: ['Immobilize limb with splint or rolled magazine', 'Apply ice wrapped in cloth', 'Elevate if possible'],
		medications: [{ name: 'Paracetamol', purpose: 'Pain relief', dosageNote: '500mg once', caution: 'Do not give NSAIDs before confirmed diagnosis' }],
		firstAid: ['Do NOT straighten the limb', 'Splint in position found', 'Apply ice pack', 'Elevate if no spinal injury suspected', 'Arrange transport to hospital'],
		redFlags: ['Bone visible through skin (open fracture)', 'Loss of sensation below injury', 'Severe swelling/deformity', 'Suspected spinal injury'],
		referral: true,
		referralReason: 'Fracture requires X-ray and physician management.'
	},
	{
		keywords: ['sprain', 'twist', 'ankle', 'wrist', 'pisi', 'napilay'],
		conditions: [
			{ name: 'Sprain', likelihood: 'high', explanation: 'Ligament injury from twisting, common in ankle/wrist.' }
		],
		severity: 'low',
		summary: 'Likely sprain. Apply RICE protocol.',
		remedies: ['Rest — no weight bearing', 'Ice — 20 min on/off', 'Compression — elastic bandage', 'Elevation — raise limb above heart level'],
		medications: [{ name: 'Paracetamol', purpose: 'Pain relief', dosageNote: '500mg every 4-6 hrs' }],
		firstAid: ['Rest the injured limb', 'Apply ice pack wrapped in cloth for 20 mins', 'Wrap with compression bandage', 'Elevate above heart level'],
		redFlags: ['Cannot bear weight after 20 mins rest', 'Severe deformity', 'Numbness or cold limb', 'Suspected fracture'],
		referral: false
	},
	{
		keywords: ['cut', 'wound', 'bleeding', 'laceration', 'sugat', 'blood', 'dugo'],
		conditions: [
			{ name: 'Laceration / wound', likelihood: 'high', explanation: 'Open wound requiring cleaning and dressing.' }
		],
		severity: 'moderate',
		summary: 'Open wound. Clean, dress, and assess for sutures.',
		remedies: ['Clean with running water or saline', 'Apply antiseptic', 'Cover with sterile dressing'],
		medications: [{ name: 'Povidone-iodine', purpose: 'Wound antiseptic', dosageNote: 'Apply topically once cleaned' }],
		firstAid: ['Apply direct pressure with clean cloth to stop bleeding', 'Clean wound with water for 5 mins', 'Apply antiseptic', 'Cover with sterile dressing', 'Check tetanus status if deep'],
		redFlags: ['Bleeding not controlled after 10 mins pressure', 'Deep or gaping wound needing sutures', 'Signs of infection (pus, redness, heat)', 'Wound from animal bite'],
		referral: false
	},
	{
		keywords: ['asthma', 'difficulty breathing', 'shortness of breath', 'hirap huminga', 'wheezing', 'inhaler'],
		conditions: [
			{ name: 'Asthma attack', likelihood: 'high', explanation: 'Airway constriction causing wheezing and difficulty breathing.' }
		],
		severity: 'high',
		summary: 'Possible asthma attack. Assist with inhaler and monitor closely.',
		remedies: ['Sit upright — do not lay down', 'Stay calm', 'Assist with rescue inhaler if available'],
		medications: [{ name: 'Salbutamol inhaler', purpose: 'Bronchodilator', dosageNote: '2 puffs, may repeat after 20 mins', caution: 'Use only if prescribed and available' }],
		firstAid: ['Sit student upright, leaning slightly forward', 'Assist with prescribed inhaler', 'Loosen tight clothing', 'Stay calm and reassure student', 'Call emergency if no improvement in 15 mins'],
		redFlags: ['No improvement after 2 inhaler doses', 'Cannot speak in full sentences', 'Blue lips or fingertips', 'Loss of consciousness'],
		referral: true,
		referralReason: 'Severe asthma attack requires emergency medical care.'
	},
	{
		keywords: ['allergy', 'rash', 'hives', 'itching', 'allergic', 'swelling', 'pamamaga', 'pantal'],
		conditions: [
			{ name: 'Allergic reaction', likelihood: 'high', explanation: 'Immune response to allergen causing rash or swelling.' },
			{ name: 'Urticaria (hives)', likelihood: 'moderate', explanation: 'Raised itchy welts on skin from allergic trigger.' }
		],
		severity: 'moderate',
		summary: 'Allergic reaction suspected. Identify trigger and monitor for anaphylaxis.',
		remedies: ['Remove suspected allergen', 'Keep student calm', 'Cool compress on rash area'],
		medications: [{ name: 'Antihistamine (Cetirizine)', purpose: 'Reduce allergic response', dosageNote: '10mg once', caution: 'May cause drowsiness' }],
		firstAid: ['Remove or stop exposure to suspected allergen', 'Give antihistamine if available', 'Apply cool compress to affected area', 'Monitor breathing closely'],
		redFlags: ['Throat swelling or difficulty swallowing', 'Difficulty breathing', 'Rapid pulse', 'Dizziness or fainting — possible anaphylaxis'],
		referral: false
	},
	{
		keywords: ['faint', 'dizzy', 'dizziness', 'lightheaded', 'nahilo', 'syncope', 'collapsed', 'unconscious'],
		conditions: [
			{ name: 'Vasovagal syncope', likelihood: 'high', explanation: 'Fainting from standing too long, heat, or stress.' },
			{ name: 'Dehydration / low blood sugar', likelihood: 'moderate', explanation: 'Insufficient fluids or food causing lightheadedness.' }
		],
		severity: 'moderate',
		summary: 'Student feels faint or dizzy. Lay down and assess for underlying cause.',
		remedies: ['Lay flat with legs elevated', 'Offer water or juice', 'Loosen tight clothing'],
		medications: [],
		firstAid: ['Lay student flat, legs elevated 15–30cm', 'Loosen collar/belt', 'Offer water or ORS when conscious', 'Check blood sugar if diabetic', 'Do not give food/drink if unconscious'],
		redFlags: ['Unconscious and unresponsive', 'Irregular heartbeat', 'Seizure activity', 'Chest pain with dizziness'],
		referral: false
	}
];

function normalize(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function matchScore(rule: Rule, input: string): number {
	const normalized = normalize(input);
	return rule.keywords.filter((kw) => normalized.includes(kw.toLowerCase())).length;
}

export function ruleBasedDiagnosis(
	reason: string,
	details: string = '',
	visitType?: string
): DiagnosisResult {
	const input = `${reason} ${details} ${visitType ?? ''}`;

	// Score all rules and pick the best match
	const scored = RULES.map((rule) => ({ rule, score: matchScore(rule, input) }))
		.filter((r) => r.score > 0)
		.sort((a, b) => b.score - a.score);

	if (scored.length === 0) {
		// Generic fallback when nothing matches
		return {
			summary: 'Unable to identify a specific condition from the information provided. Please assess the student directly.',
			assessedSeverity: 'low',
			possibleConditions: [],
			recommendedRemedies: ['Have student rest', 'Monitor symptoms', 'Offer water'],
			suggestedMedications: [],
			firstAidSteps: ['Assess student for visible signs of distress', 'Take vital signs if possible', 'Contact parent/guardian if symptoms worsen'],
			redFlags: ['Worsening symptoms', 'Loss of consciousness', 'Difficulty breathing'],
			referralRecommended: false,
			disclaimer: DISCLAIMER
		};
	}

	const best = scored[0].rule;

	// Include secondary condition from second-best match if different
	const secondaryConditions =
		scored.length > 1 && scored[1].score > 0
			? scored[1].rule.conditions.slice(0, 1).map((c) => ({ ...c, likelihood: 'low' as const }))
			: [];

	return {
		summary: best.summary,
		assessedSeverity: best.severity,
		possibleConditions: [...best.conditions, ...secondaryConditions].slice(0, 4),
		recommendedRemedies: best.remedies,
		suggestedMedications: best.medications,
		firstAidSteps: best.firstAid,
		redFlags: best.redFlags,
		referralRecommended: best.referral,
		referralReason: best.referralReason,
		disclaimer: DISCLAIMER + ' (Offline mode — AI unavailable)'
	};
}
