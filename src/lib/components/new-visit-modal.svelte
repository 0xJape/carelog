<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { NurseComboboxOption } from '$lib/types/nurse.js';
	import { cn } from '$lib/utils.js';
	import {
		Activity,
		AlertTriangle,
		Check,
		ChevronsUpDown,
		HeartPulse,
		ListChecks,
		Loader2,
		Pill,
		Plus,
		Sparkles,
		Square,
		Stethoscope,
		Volume2
	} from '@lucide/svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onDestroy, tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	// AI pre-diagnosis result shape (mirrors DiagnosisResult on the server)
	interface AiDiagnosis {
		summary: string;
		assessedSeverity: 'low' | 'moderate' | 'high' | 'critical';
		possibleConditions: { name: string; likelihood: 'high' | 'moderate' | 'low'; explanation: string }[];
		recommendedRemedies: string[];
		suggestedMedications: { name: string; purpose: string; dosageNote: string; caution?: string }[];
		firstAidSteps: string[];
		redFlags: string[];
		referralRecommended: boolean;
		referralReason?: string;
		disclaimer: string;
	}

	// Types
	interface Student {
		id: string;
		firstName: string;
		lastName: string;
		studentId: string;
		grade: string;
		section?: string | null;
	}

	// Props
	let {
		open = $bindable(false),
		student,
		availableNurses = []
	}: {
		open: boolean;
		student: Student;
		availableNurses: NurseComboboxOption[];
	} = $props();

	// Form state
	let submitting = $state(false);
	let form: HTMLFormElement | undefined = $state();

	// Form data
	let formData = $state({
		nurseId: '',
		reason: '',
		details: '',
		medicationsGiven: '',
		visitType: 'other',
		severity: 'low',
		isEmergency: false
	});

	// Nurse combobox state
	let nurseComboboxOpen = $state(false);
	let nurseTriggerRef = $state<HTMLButtonElement>(null!);

	const selectedNurse = $derived(
		availableNurses.find((nurse) => nurse.id === formData.nurseId)?.name
	);

	// Close combobox and refocus trigger
	function closeNurseComboboxAndFocusTrigger() {
		nurseComboboxOpen = false;
		tick().then(() => {
			nurseTriggerRef.focus();
		});
	} // Available options
	const visitTypeOptions = [
		{ value: 'emergency', label: 'Emergency' },
		{ value: 'illness', label: 'Illness' },
		{ value: 'injury', label: 'Injury' },
		{ value: 'medication', label: 'Medication' },
		{ value: 'checkup', label: 'Checkup' },
		{ value: 'mental_health', label: 'Mental Health' },
		{ value: 'other', label: 'Other' }
	];

	const severityOptions = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
		{ value: 'critical', label: 'Critical' }
	];

	// Form submission
	const submitForm: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success('Visit created successfully!', {
					description: `Clinic visit for ${student.firstName} ${student.lastName} has been recorded.`
				});
				// Close modal and refresh data
				open = false;
				resetForm();
				await invalidateAll();
			} else if (result.type === 'failure') {
				const errorMessage = result.data?.error || 'Failed to create visit. Please try again.';
				toast.error('Failed to create visit', {
					description: errorMessage
				});
			} else if (result.type === 'error') {
				toast.error('Visit creation failed', {
					description: 'An unexpected error occurred. Please try again.'
				});
			}
			await update();
		};
	};

	// AI pre-diagnosis state
	let aiLoading = $state(false);
	let aiResult = $state<AiDiagnosis | null>(null);
	let aiError = $state<string | null>(null);
	let aiStep = $state(0);
	let speaking = $state(false);
	let aiStepTimer: ReturnType<typeof setInterval> | undefined;
	let speaking = $state(false);

	const aiSteps = [
		'Reading medical history & allergies…',
		'Analyzing reported symptoms…',
		'Matching possible conditions…',
		'Preparing remedies & first-aid steps…',
		'Finalizing assessment…'
	];

	function startAiStepCycle() {
		aiStep = 0;
		clearInterval(aiStepTimer);
		aiStepTimer = setInterval(() => {
			if (aiStep < aiSteps.length - 1) aiStep++;
		}, 1400);
	}

	function stopAiStepCycle() {
		clearInterval(aiStepTimer);
		aiStepTimer = undefined;
	}

	function buildSpeechText(r: AiDiagnosis): string {
		const parts: string[] = [];
		parts.push(`AI Pre-Diagnosis Summary. ${r.summary}`);
		parts.push(`Assessed severity: ${r.assessedSeverity}.`);
		if (r.referralRecommended) {
			parts.push(`Referral recommended. ${r.referralReason ?? ''}`);
		}
		if (r.possibleConditions.length) {
			parts.push('Possible causes:');
			r.possibleConditions.forEach((c) =>
				parts.push(`${c.name}, ${c.likelihood} likelihood. ${c.explanation}`)
			);
		}
		if (r.suggestedMedications.length) {
			parts.push('Suggested medications:');
			r.suggestedMedications.forEach((m) =>
				parts.push(`${m.name}. ${m.purpose}. Dosage: ${m.dosageNote}.${m.caution ? ' Caution: ' + m.caution : ''}`)
			);
		}
		if (r.recommendedRemedies.length) {
			parts.push('Care recommendations: ' + r.recommendedRemedies.join('. '));
		}
		if (r.firstAidSteps.length) {
			parts.push('First aid steps:');
			r.firstAidSteps.forEach((s, i) => parts.push(`Step ${i + 1}: ${s}`));
		}
		if (r.redFlags.length) {
			parts.push('Watch for these warning signs and escalate if present:');
			r.redFlags.forEach((f) => parts.push(f));
		}
		return parts.join(' ');
	}

	function speakResult() {
		if (!aiResult || typeof window === 'undefined') return;
		if (speaking) {
			speechSynthesis.cancel();
			speaking = false;
			return;
		}
		const utt = new SpeechSynthesisUtterance(buildSpeechText(aiResult));
		utt.rate = 0.95;
		utt.pitch = 1;
		utt.lang = 'en-US';
		utt.onstart = () => (speaking = true);
		utt.onend = () => (speaking = false);
		utt.onerror = () => (speaking = false);
		speechSynthesis.speak(utt);
	}

	// Stop speech when modal closes
	$effect(() => {
		if (!open && typeof window !== 'undefined') {
			speechSynthesis.cancel();
			speaking = false;
		}
	});

	onDestroy(() => {
		clearInterval(aiStepTimer);
		if (typeof window !== 'undefined') speechSynthesis.cancel();
	});

	async function runAiDiagnosis() {
		if (!formData.reason.trim()) {
			toast.error('Enter a reason for the visit first');
			return;
		}
		aiLoading = true;
		aiError = null;
		aiResult = null;
		startAiStepCycle();
		try {
			const res = await fetch('/api/ai-diagnosis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					studentId: student.id,
					reason: formData.reason,
					details: formData.details,
					visitType: formData.visitType,
					severity: formData.severity
				})
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || 'Failed to generate pre-diagnosis');
			}
			aiResult = data.result as AiDiagnosis;
			// Adopt the AI-assessed severity into the form (nurse can still change it)
			const sevMap: Record<string, string> = {
				low: 'low',
				moderate: 'medium',
				high: 'high',
				critical: 'critical'
			};
			if (aiResult.assessedSeverity && sevMap[aiResult.assessedSeverity]) {
				formData.severity = sevMap[aiResult.assessedSeverity];
			}
		} catch (err) {
			aiError = err instanceof Error ? err.message : 'Something went wrong';
			toast.error('AI pre-diagnosis failed', { description: aiError });
		} finally {
			aiLoading = false;
			stopAiStepCycle();
		}
	}

	// Copy the AI findings into the visit details field so they get saved
	function applyAiToDetails() {
		if (!aiResult) return;
		const lines: string[] = [];
		lines.push(`AI PRE-DIAGNOSIS SUMMARY: ${aiResult.summary}`);
		if (aiResult.possibleConditions.length) {
			lines.push(
				'Possible causes: ' +
					aiResult.possibleConditions.map((c) => `${c.name} (${c.likelihood})`).join(', ')
			);
		}
		if (aiResult.suggestedMedications.length) {
			lines.push(
				'Suggested medications: ' +
					aiResult.suggestedMedications.map((m) => `${m.name} — ${m.dosageNote}`).join('; ')
			);
		}
		if (aiResult.referralRecommended) {
			lines.push(`Referral recommended: ${aiResult.referralReason ?? 'Yes'}`);
		}
		const block = lines.join('\n');
		formData.details = formData.details.trim()
			? `${formData.details.trim()}\n\n${block}`
			: block;
		toast.success('AI findings added to visit details');
	}

	// Text-to-speech state
	let speaking = $state(false);

	function buildSpeechText(r: AiDiagnosis): string {
		const parts: string[] = [];
		parts.push(`AI Pre-Diagnosis Summary. ${r.summary}`);
		parts.push(`Assessed severity: ${r.assessedSeverity}.`);
		if (r.referralRecommended) {
			parts.push(`Referral recommended. ${r.referralReason ?? ''}`);
		}
		if (r.possibleConditions.length) {
			parts.push('Possible causes:');
			r.possibleConditions.forEach((c) =>
				parts.push(`${c.name}, ${c.likelihood} likelihood. ${c.explanation}`)
			);
		}
		if (r.suggestedMedications.length) {
			parts.push('Suggested medications:');
			r.suggestedMedications.forEach((m) =>
				parts.push(`${m.name}. ${m.purpose}. Dosage: ${m.dosageNote}.${m.caution ? ' Caution: ' + m.caution : ''}`)
			);
		}
		if (r.recommendedRemedies.length) {
			parts.push('Care recommendations: ' + r.recommendedRemedies.join('. '));
		}
		if (r.firstAidSteps.length) {
			parts.push('First aid steps:');
			r.firstAidSteps.forEach((s, i) => parts.push(`Step ${i + 1}: ${s}`));
		}
		if (r.redFlags.length) {
			parts.push('Watch for these warning signs and escalate if present:');
			r.redFlags.forEach((f) => parts.push(f));
		}
		return parts.join(' ');
	}

	function speakResult() {
		if (!aiResult || typeof window === 'undefined') return;
		if (speaking) {
			speechSynthesis.cancel();
			speaking = false;
			return;
		}
		const utt = new SpeechSynthesisUtterance(buildSpeechText(aiResult));
		utt.rate = 0.95;
		utt.pitch = 1;
		utt.lang = 'en-US';
		utt.onstart = () => (speaking = true);
		utt.onend = () => (speaking = false);
		utt.onerror = () => (speaking = false);
		speechSynthesis.speak(utt);
	}

	// Stop speech when modal closes or component is destroyed
	$effect(() => {
		if (!open && typeof window !== 'undefined') {
			speechSynthesis.cancel();
			speaking = false;
		}
	});

	const likelihoodStyle: Record<string, string> = {
		high: 'bg-red-500/15 text-red-600 dark:text-red-400',
		moderate: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
		low: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
	};

	const severityStyle: Record<string, string> = {
		low: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
		moderate: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
		high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
		critical: 'bg-red-500/15 text-red-600 dark:text-red-400'
	};

	// Reset form
	function resetForm() {
		formData = {
			nurseId: '',
			reason: '',
			details: '',
			medicationsGiven: '',
			visitType: 'other',
			severity: 'low',
			isEmergency: false
		};
		aiResult = null;
		aiError = null;
		aiLoading = false;
	}

	// Close dialog when clicking outside or escape
	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			resetForm();
		}
	}

	// Update formData when visit type changes to emergency
	$effect(() => {
		if (formData.visitType === 'emergency') {
			formData.isEmergency = true;
			formData.severity = 'high';
		} else {
			formData.isEmergency = false;
		}
	});

	// Update formData when severity changes
	$effect(() => {
		if (formData.severity === 'critical') {
			formData.isEmergency = true;
		}
	});

	// Computed student display name
	let studentDisplayName = $derived(`${student.firstName} ${student.lastName}`);
	let studentInfo = $derived(
		`${student.studentId} - ${student.grade}${student.section ? ` (${student.section})` : ''}`
	);
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="flex max-h-[90vh] max-w-2xl! flex-col overflow-hidden">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Stethoscope class="size-5" />
				New Clinic Visit
			</Dialog.Title>
			<Dialog.Description>
				Record a new clinic visit for {studentDisplayName}.
			</Dialog.Description>
		</Dialog.Header>

		<!-- Patient Info Card -->
		<div class="rounded-lg bg-muted/30 p-4">
			<div class="flex items-center gap-3">
				<div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
					<span class="text-sm font-semibold text-primary">
						{student.firstName[0]}{student.lastName[0]}
					</span>
				</div>
				<div>
					<h3 class="font-medium text-foreground">{studentDisplayName}</h3>
					<p class="text-sm text-muted-foreground">{studentInfo}</p>
				</div>
			</div>
		</div>

		<!-- Form -->
		<form
			bind:this={form}
			method="POST"
			action="?/createVisit"
			use:enhance={submitForm}
			class="flex flex-1 flex-col gap-4 overflow-y-auto"
		>
			<!-- Hidden field for student ID -->
			<input type="hidden" name="studentId" value={student.id} />

			<!-- Nurse Name -->
			<div class="space-y-2">
				<Label for="nurseId">Nurse *</Label>
				<Popover.Root bind:open={nurseComboboxOpen}>
					<Popover.Trigger bind:ref={nurseTriggerRef} id="nurseId" class="w-full">
						{#snippet child({ props })}
							<Button
								variant="outline"
								class="w-full"
								{...props}
								role="combobox"
								aria-expanded={nurseComboboxOpen}
							>
								{selectedNurse || 'Select a nurse...'}
								<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-full p-0">
						<Command.Root>
							<Command.Input placeholder="Search nurse..." />
							<Command.List>
								<Command.Empty>No nurse found.</Command.Empty>
								<Command.Group>
									{#each availableNurses as nurse}
										<Command.Item
											class="cursor-pointer"
											value={nurse.id}
											onSelect={() => {
												formData.nurseId = nurse.id;
												closeNurseComboboxAndFocusTrigger();
											}}
										>
											<Check
												class={cn(
													'mr-2 size-4',
													formData.nurseId !== nurse.id && 'text-transparent'
												)}
											/>
											{nurse.name}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<input type="hidden" name="nurseId" bind:value={formData.nurseId} />
			</div>

			<!-- Visit Type and Severity -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="visitType">Visit Type</Label>
					<Select.Root bind:value={formData.visitType} type="single">
						<Select.Trigger class="w-full" id="visitType">
							{formData.visitType
								? (visitTypeOptions.find((opt) => opt.value === formData.visitType)?.label ??
									'Other')
								: 'Select type'}
						</Select.Trigger>
						<Select.Content>
							{#each visitTypeOptions as option}
								<Select.Item value={option.value} class="cursor-pointer">
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="visitType" bind:value={formData.visitType} />
				</div>

				<div class="space-y-2">
					<Label for="severity">Severity</Label>
					<Select.Root bind:value={formData.severity} type="single">
						<Select.Trigger class="w-full" id="severity">
							{formData.severity
								? (severityOptions.find((opt) => opt.value === formData.severity)?.label ?? 'Low')
								: 'Select severity'}
						</Select.Trigger>
						<Select.Content>
							{#each severityOptions as option}
								<Select.Item
									value={option.value}
									class={cn(
										'cursor-pointer',
										option.value === 'critical' && 'text-destructive',
										option.value === 'high' && 'text-orange-600',
										option.value === 'medium' && 'text-yellow-600'
									)}
								>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="severity" bind:value={formData.severity} />
				</div>
			</div>

			<!-- Emergency flag (hidden input) -->
			<input type="hidden" name="isEmergency" value={formData.isEmergency.toString()} />

			<!-- Reason -->
			<div class="space-y-2">
				<Label for="reason">Reason for Visit *</Label>
				<Input
					id="reason"
					name="reason"
					placeholder="e.g., Headache, Stomach pain, Injury..."
					bind:value={formData.reason}
					required
					class="w-full"
				/>
			</div>

			<!-- Details -->
			<div class="space-y-2">
				<Label for="details">Details</Label>
				<Textarea
					id="details"
					name="details"
					placeholder="Describe symptoms, when they started, severity, etc."
					bind:value={formData.details}
					rows={3}
					class="min-h-20"
				/>
			</div>

			<!-- AI Pre-Diagnosis -->
			<div class="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
				<!-- Header -->
				<div class="flex items-start justify-between gap-3 p-4 pb-3">
					<div class="flex items-start gap-2.5">
						<div class="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
							<Sparkles class="size-4.5 text-white" />
							{#if aiLoading}
								<span class="absolute -inset-0.5 animate-ping rounded-lg bg-blue-500/40"></span>
							{/if}
						</div>
						<div>
							<p class="flex items-center gap-1.5 text-sm font-semibold text-foreground">
								AI Pre-Diagnosis
								<span class="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-primary">Beta</span>
							</p>
							<p class="text-xs text-muted-foreground">
								Symptoms + medical history → likely causes, remedies & first aid.
							</p>
						</div>
					</div>
					<Button
						type="button"
						size="sm"
						class="shrink-0 gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
						onclick={runAiDiagnosis}
						disabled={aiLoading || !formData.reason.trim()}
					>
						{#if aiLoading}
							<Loader2 class="size-3.5 animate-spin" />
							Analyzing
						{:else}
							<Sparkles class="size-3.5" />
							{aiResult ? 'Re-analyze' : 'Analyze'}
						{/if}
					</Button>
				</div>

				<!-- Loading state -->
				{#if aiLoading}
					<div class="border-t border-primary/10 p-4">
						<!-- Animated status line -->
						<div class="mb-4 flex items-center gap-2.5">
							<span class="relative flex size-2.5">
								<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60"></span>
								<span class="relative inline-flex size-2.5 rounded-full bg-blue-600"></span>
							</span>
							<p class="text-sm font-medium text-foreground transition-all">{aiSteps[aiStep]}</p>
						</div>

						<!-- Progress bar -->
						<div class="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
							<div
								class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out"
								style="width: {((aiStep + 1) / aiSteps.length) * 100}%"
							></div>
						</div>

						<!-- Skeleton preview -->
						<div class="space-y-2.5">
							<div class="h-3 w-3/4 animate-pulse rounded bg-primary/10"></div>
							<div class="h-3 w-full animate-pulse rounded bg-primary/10"></div>
							<div class="grid grid-cols-2 gap-2 pt-1">
								<div class="h-14 animate-pulse rounded-lg bg-primary/10"></div>
								<div class="h-14 animate-pulse rounded-lg bg-primary/10"></div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Error state -->
				{#if aiError && !aiLoading}
					<div class="border-t border-primary/10 p-4">
						<div class="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
							<AlertTriangle class="size-4 shrink-0" />
							{aiError}
						</div>
					</div>
				{/if}

				<!-- Result -->
				{#if aiResult && !aiLoading}
					<div class="space-y-4 border-t border-primary/10 p-4">
						<!-- Summary hero -->
						<div class="rounded-lg border border-border/50 bg-background/80 p-3.5 shadow-sm">
							<div class="mb-2 flex items-center justify-between gap-2">
								<span class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									<Stethoscope class="size-3.5" /> Assessment
								</span>
								<span
									class={cn(
										'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
										severityStyle[aiResult.assessedSeverity]
									)}
								>
									{aiResult.assessedSeverity} severity
								</span>
							</div>
							<p class="text-sm leading-relaxed text-foreground">{aiResult.summary}</p>
						</div>

						<!-- Referral banner -->
						{#if aiResult.referralRecommended}
							<div class="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-3">
								<div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500/20">
									<AlertTriangle class="size-4 text-red-600 dark:text-red-400" />
								</div>
								<div>
									<p class="text-xs font-bold text-red-600 dark:text-red-400">Referral Recommended</p>
									<p class="mt-0.5 text-xs text-red-700/90 dark:text-red-300/90">{aiResult.referralReason ?? 'This case may need a doctor or hospital.'}</p>
								</div>
							</div>
						{/if}

						<!-- Possible conditions -->
						{#if aiResult.possibleConditions.length}
							<div class="space-y-2">
								<p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
									<Activity class="size-3.5" /> Possible Causes
								</p>
								<div class="space-y-2">
									{#each aiResult.possibleConditions as c}
										<div class="rounded-lg border border-border/50 bg-background/80 p-3">
											<div class="flex items-center justify-between gap-2">
												<span class="text-sm font-semibold text-foreground">{c.name}</span>
												<span class={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', likelihoodStyle[c.likelihood])}>
													<span class="size-1.5 rounded-full bg-current"></span>
													{c.likelihood}
												</span>
											</div>
											<p class="mt-1 text-xs leading-relaxed text-muted-foreground">{c.explanation}</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Suggested medications -->
						{#if aiResult.suggestedMedications.length}
							<div class="space-y-2">
								<p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
									<Pill class="size-3.5" /> Suggested Medications & Remedies
								</p>
								<div class="space-y-2">
									{#each aiResult.suggestedMedications as m}
										<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
											<div class="flex items-start gap-2.5">
												<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
													<Pill class="size-4 text-emerald-600 dark:text-emerald-400" />
												</div>
												<div class="min-w-0 flex-1">
													<p class="text-sm font-semibold text-foreground">{m.name}</p>
													<p class="text-xs text-muted-foreground">{m.purpose}</p>
													<p class="mt-1 inline-block rounded bg-background/80 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
														{m.dosageNote}
													</p>
													{#if m.caution}
														<p class="mt-1.5 flex items-start gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-400">
															<AlertTriangle class="mt-0.5 size-3 shrink-0" />
															{m.caution}
														</p>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Two-column: remedies + first aid -->
						<div class="grid gap-3 sm:grid-cols-2">
							{#if aiResult.recommendedRemedies.length}
								<div class="rounded-lg border border-border/50 bg-background/80 p-3">
									<p class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
										<HeartPulse class="size-3.5" /> Care Tips
									</p>
									<ul class="space-y-1.5 text-xs text-muted-foreground">
										{#each aiResult.recommendedRemedies as r}
											<li class="flex items-start gap-1.5">
												<Check class="mt-0.5 size-3 shrink-0 text-emerald-500" />
												{r}
											</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if aiResult.firstAidSteps.length}
								<div class="rounded-lg border border-border/50 bg-background/80 p-3">
									<p class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
										<ListChecks class="size-3.5" /> First Aid Steps
									</p>
									<ol class="space-y-1.5 text-xs text-muted-foreground">
										{#each aiResult.firstAidSteps as step, i}
											<li class="flex items-start gap-2">
												<span class="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">{i + 1}</span>
												{step}
											</li>
										{/each}
									</ol>
								</div>
							{/if}
						</div>

						<!-- Red flags -->
						{#if aiResult.redFlags.length}
							<div class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
								<p class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
									<AlertTriangle class="size-3.5" /> Watch For — Escalate If Present
								</p>
								<ul class="grid gap-1.5 text-xs text-amber-700/90 dark:text-amber-300/90 sm:grid-cols-2">
									{#each aiResult.redFlags as flag}
										<li class="flex items-start gap-1.5">
											<span class="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500"></span>
											{flag}
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Footer -->
						<div class="flex flex-col gap-2 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
							<p class="flex items-start gap-1 text-[10px] italic leading-tight text-muted-foreground">
								<Sparkles class="mt-0.5 size-3 shrink-0" />
								{aiResult.disclaimer}
							</p>
							<div class="flex shrink-0 gap-2">
								<Button
									type="button"
									variant={speaking ? 'destructive' : 'outline'}
									size="sm"
									class="gap-1.5"
									onclick={speakResult}
								>
									{#if speaking}
										<Square class="size-3.5 fill-current" />
										Stop
									{:else}
										<Volume2 class="size-3.5" />
										Read aloud
									{/if}
								</Button>
								<Button type="button" variant="secondary" size="sm" class="gap-1.5" onclick={applyAiToDetails}>
									<Plus class="size-3.5" />
									Add to details
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Medications Given -->
			<div class="space-y-2">
				<Label for="medicationsGiven">Medications Given</Label>
				<Textarea
					id="medicationsGiven"
					name="medicationsGiven"
					placeholder="List any medications, dosages, and times administered..."
					bind:value={formData.medicationsGiven}
					rows={2}
				/>
			</div>

			<!-- Form Actions -->
			<div class="flex justify-end gap-3 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting || !formData.reason.trim() || !formData.nurseId}>
					{#if submitting}
						<Loader2 class="mr-2 size-4 animate-spin" />
						Creating Visit...
					{:else}
						<Plus class="mr-2 size-4" />
						Create Visit
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
