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
		AlertTriangle,
		Check,
		ChevronsUpDown,
		Loader2,
		Pill,
		Plus,
		Sparkles,
		Stethoscope
	} from '@lucide/svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { tick } from 'svelte';
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
	let activeTab = $state('causes');

	async function runAiDiagnosis() {
		if (!formData.reason.trim()) {
			toast.error('Enter a reason for the visit first');
			return;
		}
		aiLoading = true;
		aiError = null;
		aiResult = null;
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
		}
	}

	// Copy the AI findings into the visit details field so they get saved
	function applyAiToDetails() {
		if (!aiResult) return;
		const lines: string[] = [];

		// Top conditions (max 2, no alarming language)
		if (aiResult.possibleConditions.length) {
			const top = aiResult.possibleConditions.slice(0, 2).map((c) => c.name).join(', ');
			lines.push(`Possible: ${top}`);
		}

		// First aid / remedies (max 2 steps)
		if (aiResult.firstAidSteps.length) {
			lines.push(`Care: ${aiResult.firstAidSteps.slice(0, 2).join('; ')}`);
		}

		// Medications (names + dosage only, max 2)
		if (aiResult.suggestedMedications.length) {
			const meds = aiResult.suggestedMedications
				.slice(0, 2)
				.map((m) => `${m.name} (${m.dosageNote})`)
				.join(', ');
			lines.push(`Meds: ${meds}`);
		}

		// Referral — keep it neutral
		if (aiResult.referralRecommended) {
			lines.push('Follow-up with physician recommended.');
		}

		const block = lines.join('\n');
		formData.details = formData.details.trim()
			? `${formData.details.trim()}\n\n${block}`
			: block;
		toast.success('AI findings added to visit details');
	}

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
		activeTab = 'causes';
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
			<div class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
				<!-- Header row -->
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<div class="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
							<Sparkles class="size-3.5 text-white" />
						</div>
						<span class="text-sm font-semibold text-foreground">AI Pre-Diagnosis</span>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="h-7 shrink-0 gap-1.5 text-xs"
						onclick={runAiDiagnosis}
						disabled={aiLoading || !formData.reason.trim()}
					>
						{#if aiLoading}
							<Loader2 class="size-3 animate-spin" />
							Analyzing...
						{:else}
							<Sparkles class="size-3" />
							{aiResult ? 'Re-analyze' : 'Analyze'}
						{/if}
					</Button>
				</div>

				{#if aiError}
					<div class="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
						<AlertTriangle class="size-3.5 shrink-0" />
						{aiError}
					</div>
				{/if}

				{#if aiLoading}
					<div class="rounded-lg border border-blue-500/20 bg-background/60 p-4 space-y-3">
						<!-- Pulsing brain icon -->
						<div class="flex flex-col items-center gap-3 py-2">
							<div class="relative flex size-12 items-center justify-center">
								<div class="absolute inset-0 animate-ping rounded-full bg-blue-500/20"></div>
								<div class="absolute inset-1 animate-pulse rounded-full bg-blue-500/10"></div>
								<div class="relative flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
									<Sparkles class="size-5 text-white" />
								</div>
							</div>
							<div class="text-center">
								<p class="text-sm font-semibold text-foreground">Analyzing symptoms...</p>
								<p class="text-xs text-muted-foreground">Reviewing medical history & conditions</p>
							</div>
						</div>

						<!-- Animated steps -->
						<div class="space-y-2">
							{#each [
								{ label: 'Reading student medical profile', delay: '0ms' },
								{ label: 'Matching symptoms to conditions', delay: '400ms' },
								{ label: 'Evaluating medications & allergies', delay: '800ms' },
								{ label: 'Generating first aid guidance', delay: '1200ms' }
							] as step}
								<div class="flex items-center gap-2.5" style="animation: fadeSlideIn 0.4s ease both; animation-delay: {step.delay}">
									<div class="size-1.5 shrink-0 animate-pulse rounded-full bg-blue-500" style="animation-delay: {step.delay}"></div>
									<p class="text-xs text-muted-foreground">{step.label}</p>
									<div class="ml-auto h-1.5 w-12 overflow-hidden rounded-full bg-muted">
										<div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-progress-fill" style="animation-delay: {step.delay}"></div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if !aiResult && !aiLoading && !aiError}
					<p class="text-xs text-muted-foreground">Fill in the reason above, then click Analyze to get AI-assisted triage.</p>
				{/if}

				{#if aiResult}
					<!-- Top summary bar -->
					<div class="flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2 border border-border/40">
						<span class={cn(
							'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
							severityStyle[aiResult.assessedSeverity]
						)}>{aiResult.assessedSeverity}</span>
						<p class="text-xs text-foreground leading-snug line-clamp-2">{aiResult.summary}</p>
						{#if aiResult.referralRecommended}
							<span class="ml-auto shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">Refer</span>
						{/if}
					</div>

					<!-- Referral reason (only if recommended) -->
					{#if aiResult.referralRecommended && aiResult.referralReason}
						<div class="flex items-start gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-xs text-red-600 dark:text-red-400">
							<AlertTriangle class="mt-0.5 size-3.5 shrink-0" />
							{aiResult.referralReason}
						</div>
					{/if}

					<!-- Tab buttons -->
					<div class="flex gap-1 rounded-lg bg-muted/50 p-1">
						{#each [
							{ id: 'causes', label: 'Causes' },
							{ id: 'treatment', label: 'Treatment' },
							{ id: 'firstaid', label: 'First Aid' },
							{ id: 'flags', label: 'Red Flags' }
						] as tab}
							<button
								type="button"
								onclick={() => activeTab = tab.id}
								class={cn(
									'flex-1 rounded-md py-1 text-[11px] font-medium transition-colors',
									activeTab === tab.id
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								)}
							>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Tab panels -->
					<div class="min-h-[80px]">
						{#if activeTab === 'causes'}
							<div class="space-y-1.5">
								{#each aiResult.possibleConditions as c}
									<div class="flex items-start gap-2 rounded-lg bg-background/60 border border-border/40 px-3 py-2">
										<span class={cn('mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', likelihoodStyle[c.likelihood])}>
											{c.likelihood}
										</span>
										<div>
											<p class="text-xs font-semibold text-foreground">{c.name}</p>
											<p class="text-[11px] text-muted-foreground">{c.explanation}</p>
										</div>
									</div>
								{/each}
							</div>

						{:else if activeTab === 'treatment'}
							<div class="space-y-2">
								{#if aiResult.recommendedRemedies.length}
									<div class="flex flex-wrap gap-1.5">
										{#each aiResult.recommendedRemedies as r}
											<span class="rounded-full border border-border/50 bg-background/60 px-2.5 py-1 text-[11px] text-foreground">{r}</span>
										{/each}
									</div>
								{/if}
								{#if aiResult.suggestedMedications.length}
									<p class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
										<Pill class="size-3" /> Medications
									</p>
									{#each aiResult.suggestedMedications as m}
										<div class="rounded-lg bg-background/60 border border-border/40 px-3 py-2">
											<div class="flex items-center justify-between gap-2">
												<p class="text-xs font-semibold text-foreground">{m.name}</p>
												<span class="text-[10px] text-muted-foreground">{m.dosageNote}</span>
											</div>
											<p class="text-[11px] text-muted-foreground">{m.purpose}</p>
											{#if m.caution}
												<p class="mt-1 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
													<AlertTriangle class="size-3 shrink-0" />{m.caution}
												</p>
											{/if}
										</div>
									{/each}
								{/if}
							</div>

						{:else if activeTab === 'firstaid'}
							<ol class="space-y-1.5">
								{#each aiResult.firstAidSteps as step, i}
									<li class="flex items-start gap-2.5">
										<span class="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[9px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">{i + 1}</span>
										<p class="text-xs text-foreground">{step}</p>
									</li>
								{/each}
							</ol>

						{:else if activeTab === 'flags'}
							<div class="space-y-1.5">
								{#each aiResult.redFlags as flag}
									<div class="flex items-start gap-2 text-xs">
										<AlertTriangle class="mt-0.5 size-3.5 shrink-0 text-amber-500" />
										<p class="text-foreground">{flag}</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Footer -->
					<div class="flex items-center justify-between gap-2 border-t border-border/30 pt-2">
						<p class="text-[9px] italic text-muted-foreground/70">AI assist only — not a medical diagnosis.</p>
						<Button type="button" variant="secondary" size="sm" class="h-6 shrink-0 gap-1 text-[11px]" onclick={applyAiToDetails}>
							<Plus class="size-3" /> Add to details
						</Button>
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
