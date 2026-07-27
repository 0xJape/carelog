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
		Activity,
		Check,
		ChevronsUpDown,
		Loader2,
		Mic,
		Pill,
		Plus,
		ShieldAlert,
		Sparkles,
		Square,
		Stethoscope,
		Volume2,
		WandSparkles
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
		isEmergency: false,
		// Vitals (optional)
		temperature: '',
		bloodPressureSystolic: '',
		bloodPressureDiastolic: '',
		pulse: ''
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
	let aiSource = $state<'ai' | 'rules' | null>(null);
	let activeTab = $state('causes');

	// TTS state
	let ttsPlaying = $state(false);
	let audioPlayer = $state<HTMLAudioElement | null>(null);
	let audioUrl = $state<string | null>(null);
	let recording = $state(false);
	let transcribing = $state(false);
	let mediaRecorder = $state<MediaRecorder | null>(null);
	let mediaStream = $state<MediaStream | null>(null);

	function buildTtsScript(result: AiDiagnosis): string {
		const firstStep = result.firstAidSteps[0] ? ` First step: ${result.firstAidSteps[0]}` : '';
		return `Severity ${result.assessedSeverity}. ${result.summary}${firstStep}`
			.replace(/[•*_#~`|<>\[\]{}]/g, ' ')
			.replace(/[–—-]+/g, ', ')
			.replace(/\b(\d+)\s*mg\b/gi, '$1 milligrams')
			.replace(/\b(\d+)\s*ml\b/gi, '$1 milliliters')
			.replace(/\bhrs?\b/gi, 'hours')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 190);
	}

	async function prepareSpeech(result: AiDiagnosis): Promise<void> {
		stopTts();
		const response = await fetch('/api/speak', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: buildTtsScript(result) })
		});
		if (!response.ok) {
			const message = await response.text();
			throw new Error(message || 'Speech generation failed');
		}
		audioUrl = URL.createObjectURL(await response.blob());
		audioPlayer = new Audio(audioUrl);
		audioPlayer.onplay = () => (ttsPlaying = true);
		audioPlayer.onended = () => (ttsPlaying = false);
		audioPlayer.onerror = () => (ttsPlaying = false);
	}

	async function speakResult(result: AiDiagnosis) {
		try {
			if (!audioPlayer) await prepareSpeech(result);
			await audioPlayer?.play();
		} catch (err) {
			toast.error('Voice guidance failed', { description: err instanceof Error ? err.message : 'Try again' });
		}
	}

	function stopTts() {
		audioPlayer?.pause();
		audioPlayer = null;
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		audioUrl = null;
		ttsPlaying = false;
	}

	async function startRecording() {
		try {
			mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const chunks: BlobPart[] = [];
			mediaRecorder = new MediaRecorder(mediaStream);
			mediaRecorder.ondataavailable = ({ data }) => data.size && chunks.push(data);
			mediaRecorder.onstop = async () => {
				mediaStream?.getTracks().forEach((track) => track.stop());
				mediaStream = null;
				recording = false;
				transcribing = true;
				try {
					const body = new FormData();
					body.set('audio', new File(chunks, 'visit-note.webm', { type: mediaRecorder?.mimeType || 'audio/webm' }));
					const response = await fetch('/api/transcribe', { method: 'POST', body });
					const data = await response.json();
					if (!response.ok) throw new Error(data.error || 'Transcription failed');
					formData.details = [formData.details.trim(), data.transcript.trim()].filter(Boolean).join('\n');
				} catch (err) {
					toast.error('Voice note failed', { description: err instanceof Error ? err.message : 'Try again' });
				} finally {
					transcribing = false;
				}
			};
			mediaRecorder.start();
			recording = true;
		} catch {
			toast.error('Microphone access denied');
		}
	}

	function stopRecording() {
		mediaRecorder?.stop();
	}

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
			const result = data.result as AiDiagnosis;
			aiResult = result;
			aiSource = (data.source ?? 'ai') as 'ai' | 'rules';
			try {
				await prepareSpeech(result);
				await audioPlayer?.play();
			} catch (err) {
				stopTts();
				toast.warning('Triage ready without voice', {
					description: err instanceof Error ? err.message : 'Speech service unavailable'
				});
			}
			// Adopt the AI-assessed severity into the form (nurse can still change it)
			const sevMap: Record<string, string> = {
				low: 'low',
				moderate: 'medium',
				high: 'high',
				critical: 'critical'
			};
			if (result.assessedSeverity && sevMap[result.assessedSeverity]) {
				formData.severity = sevMap[result.assessedSeverity];
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
		stopTts();
		if (recording) stopRecording();
		formData = {
			nurseId: '',
			reason: '',
			details: '',
			medicationsGiven: '',
			visitType: 'other',
			severity: 'low',
			isEmergency: false,
			temperature: '',
			bloodPressureSystolic: '',
			bloodPressureDiastolic: '',
			pulse: ''
		};
		aiResult = null;
		aiError = null;
		aiLoading = false;
		aiSource = null;
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
		{#if aiLoading}
			<div class="absolute inset-0 z-50 grid place-items-center overflow-hidden rounded-lg bg-background/75 backdrop-blur-md">
				<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.16),transparent_55%)]"></div>
				<div class="relative w-[min(82%,22rem)] overflow-hidden rounded-2xl border border-cyan-400/25 bg-background/90 p-6 text-center shadow-2xl shadow-cyan-500/20">
					<div class="absolute inset-x-0 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
					<div class="relative mx-auto mb-5 size-20">
						<div class="absolute inset-0 animate-spin rounded-full border border-transparent border-t-cyan-400 border-r-blue-500"></div>
						<div class="absolute inset-2 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border border-transparent border-b-violet-500 border-l-cyan-300"></div>
						<div class="absolute inset-5 grid place-items-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-lg shadow-cyan-500/30">
							<Sparkles class="size-5 animate-pulse text-white" />
						</div>
					</div>
					<p class="text-sm font-semibold text-foreground">Preparing triage briefing</p>
					<p class="mt-1 text-xs text-muted-foreground">Analyzing case and synthesizing voice guidance</p>
					<div class="mt-5 h-1 overflow-hidden rounded-full bg-muted">
						<div class="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"></div>
					</div>
					<p class="mt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Groq clinical assist</p>
				</div>
			</div>
		{/if}
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

			<!-- Vitals (optional) -->
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<Label class="text-sm font-medium">Vitals <span class="text-xs font-normal text-muted-foreground">(optional)</span></Label>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<Label for="temperature" class="text-xs text-muted-foreground">Temperature (°C)</Label>
						<Input
							id="temperature"
							type="number"
							min="30"
							max="45"
							step="0.1"
							placeholder="e.g. 37.5"
							bind:value={formData.temperature}
							class="h-9"
						/>
					</div>
					<div class="space-y-1">
						<Label for="pulse" class="text-xs text-muted-foreground">Pulse (bpm)</Label>
						<Input
							id="pulse"
							type="number"
							min="30"
							max="250"
							placeholder="e.g. 80"
							bind:value={formData.pulse}
							class="h-9"
						/>
					</div>
					<div class="space-y-1 col-span-2">
						<Label class="text-xs text-muted-foreground">Blood Pressure (mmHg)</Label>
						<div class="flex items-center gap-2">
							<Input
								type="number"
								min="50"
								max="250"
								placeholder="Systolic"
								bind:value={formData.bloodPressureSystolic}
								class="h-9"
							/>
							<span class="text-muted-foreground font-medium">/</span>
							<Input
								type="number"
								min="30"
								max="150"
								placeholder="Diastolic"
								bind:value={formData.bloodPressureDiastolic}
								class="h-9"
							/>
						</div>
					</div>
				</div>
				<!-- Hidden JSON field sent with form -->
				<input type="hidden" name="vitals" value={JSON.stringify({
					...(formData.temperature ? { temperature: parseFloat(formData.temperature) } : {}),
					...(formData.bloodPressureSystolic ? { bloodPressureSystolic: parseInt(formData.bloodPressureSystolic) } : {}),
					...(formData.bloodPressureDiastolic ? { bloodPressureDiastolic: parseInt(formData.bloodPressureDiastolic) } : {}),
					...(formData.pulse ? { pulse: parseInt(formData.pulse) } : {})
				})} />
			</div>

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
				<div class="flex items-center justify-between gap-2">
					<Label for="details">Details</Label>
					<Button
						type="button"
						variant={recording ? 'destructive' : 'outline'}
						size="sm"
						class="h-7 gap-1.5 text-xs"
						onclick={recording ? stopRecording : startRecording}
						disabled={transcribing}
					>
						{#if transcribing}
							<Loader2 class="size-3 animate-spin" /> Transcribing
						{:else if recording}
							<Square class="size-3" /> Stop recording
						{:else}
							<Mic class="size-3" /> Voice note
						{/if}
					</Button>
				</div>
				<Textarea
					id="details"
					name="details"
					placeholder="Describe symptoms, when they started, severity, etc."
					bind:value={formData.details}
					rows={3}
					class="min-h-20"
				/>
			</div>

			<!-- Groq triage command panel -->
			<div class="space-y-3 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 p-4 shadow-[0_0_35px_-20px] shadow-cyan-500">
				<!-- Header row -->
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<div class="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-lg shadow-cyan-500/30">
							<Sparkles class="size-3.5 text-white" />
						</div>
						<div>
							<span class="block text-sm font-semibold text-foreground">Triage intelligence</span>
							<span class="block text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Groq · Llama 3.1</span>
						</div>
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
							{aiResult ? 'Refresh triage' : 'Run triage'}
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
					<p class="text-xs text-muted-foreground">Add chief complaint, then run triage. Voice notes use Groq Whisper; guidance uses nurse review.</p>
				{/if}

				{#if aiResult}
					<!-- Source indicator -->
					{#if aiSource === 'rules'}
						<div class="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
							<AlertTriangle class="size-3 shrink-0" />
							Offline mode — AI unavailable, using rule-based guidance
						</div>
					{/if}

					<!-- Top summary bar -->
					<div class="flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2 border border-border/40">
						<span class={cn(
							'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
							severityStyle[aiResult.assessedSeverity]
						)}>{aiResult.assessedSeverity}</span>
						<p class="text-xs text-foreground leading-snug line-clamp-2">{aiResult.summary}</p>
						{#if aiResult.referralRecommended}
							<span class="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">Refer</span>
						{/if}
						<div class="ml-auto flex shrink-0 items-center gap-1">
							{#if ttsPlaying}
								<button
									type="button"
									onclick={stopTts}
									class="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
									title="Stop reading"
								>
									<span class="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
									Stop
								</button>
							{:else}
								<button
									type="button"
									onclick={() => speakResult(aiResult!)}
									class="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
									title="Read aloud"
								>
									<Volume2 class="size-3" /> Listen
								</button>
							{/if}
						</div>
					</div>

					<!-- Referral reason (only if recommended) -->
					{#if aiResult.referralRecommended && aiResult.referralReason}
						<div class="flex items-start gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-xs text-red-600 dark:text-red-400">
							<AlertTriangle class="mt-0.5 size-3.5 shrink-0" />
							{aiResult.referralReason}
						</div>
					{/if}

					<!-- Tab buttons -->
					<div class="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-background/40 p-1.5 shadow-inner backdrop-blur-sm">
						{#each [
							{ id: 'causes', label: 'Causes', icon: Activity, active: 'from-cyan-500 to-blue-600' },
							{ id: 'treatment', label: 'Treatment', icon: Pill, active: 'from-violet-500 to-fuchsia-600' },
							{ id: 'firstaid', label: 'First Aid', icon: WandSparkles, active: 'from-emerald-500 to-teal-600' },
							{ id: 'flags', label: 'Red Flags', icon: ShieldAlert, active: 'from-orange-500 to-red-600' }
						] as tab}
							<button
								type="button"
								onclick={() => activeTab = tab.id}
								class={cn(
									'flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold transition-all duration-300',
									activeTab === tab.id
										? `bg-gradient-to-br ${tab.active} text-white shadow-lg`
										: 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
								)}
							>
								<tab.icon class="size-3.5" />
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Tab panels -->
					<div class="min-h-[110px] rounded-xl border border-white/10 bg-background/45 p-3 shadow-inner backdrop-blur-sm">
						{#if activeTab === 'causes'}
							<div class="grid gap-2 sm:grid-cols-2">
								{#each aiResult.possibleConditions as c, i}
									<div class="group relative overflow-hidden rounded-xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-3 transition-all hover:-translate-y-0.5 hover:border-cyan-400/35 hover:shadow-lg hover:shadow-cyan-500/10">
										<span class="absolute right-2 top-1 text-3xl font-black text-cyan-500/8">0{i + 1}</span>
										<div class="mb-2 flex items-center gap-2">
										<span class={cn('mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', likelihoodStyle[c.likelihood])}>
											{c.likelihood}
										</span>
											<p class="text-xs font-bold text-foreground">{c.name}</p>
										</div>
										<p class="relative text-[11px] leading-relaxed text-muted-foreground">{c.explanation}</p>
									</div>
								{/each}
							</div>

						{:else if activeTab === 'treatment'}
							<div class="space-y-3">
								{#if aiResult.recommendedRemedies.length}
									<div class="grid gap-2 sm:grid-cols-2">
										{#each aiResult.recommendedRemedies as r, i}
											<div class="flex items-center gap-2 rounded-lg border border-violet-500/15 bg-violet-500/8 px-3 py-2 text-[11px] text-foreground">
												<span class="grid size-5 shrink-0 place-items-center rounded-md bg-violet-500/15 text-[9px] font-bold text-violet-600 dark:text-violet-300">{i + 1}</span>{r}
											</div>
										{/each}
									</div>
								{/if}
								{#if aiResult.suggestedMedications.length}
									<p class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
										<Pill class="size-3" /> Medications
									</p>
									{#each aiResult.suggestedMedications as m}
										<div class="relative overflow-hidden rounded-xl border border-fuchsia-500/15 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 px-3 py-2.5">
											<div class="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-violet-400 to-fuchsia-500"></div>
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
							<ol class="relative space-y-2 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-gradient-to-b before:from-emerald-400 before:to-teal-500/10">
								{#each aiResult.firstAidSteps as step, i}
									<li class="relative flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-2.5">
										<span class="z-10 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-[10px] font-bold text-white shadow-md shadow-emerald-500/20">{i + 1}</span>
										<p class="pt-1 text-xs leading-relaxed text-foreground">{step}</p>
									</li>
								{/each}
							</ol>

						{:else if activeTab === 'flags'}
							<div class="grid gap-2 sm:grid-cols-2">
								{#each aiResult.redFlags as flag}
									<div class="group flex items-start gap-2.5 rounded-xl border border-red-500/15 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-3 text-xs transition-colors hover:border-red-500/35">
										<span class="grid size-7 shrink-0 place-items-center rounded-lg bg-red-500/15">
											<AlertTriangle class="size-3.5 text-red-500" />
										</span>
										<p class="pt-1 font-medium leading-relaxed text-foreground">{flag}</p>
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
