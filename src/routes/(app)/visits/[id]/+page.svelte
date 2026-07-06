<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Activity,
		AlertTriangle,
		ArrowLeft,
		CalendarDays,
		Clock,
		Droplet,
		Gauge,
		HeartPulse,
		Pill,
		Ruler,
		Stethoscope,
		Thermometer,
		Timer,
		User,
		Wind
	} from '@lucide/svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const visit = $derived(data.visit);

	// Format the check-in date and time
	const formattedDate = $derived.by(() => {
		const visitDate = new Date(visit.checkInTime);
		return visitDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	});

	const formattedTime = $derived.by(() => {
		const visitDate = new Date(visit.checkInTime);
		return visitDate.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	});

	// Format check-out time if available
	const checkOutFormatted = $derived(
		visit.checkOutTime
			? new Date(visit.checkOutTime).toLocaleTimeString('en-US', {
					hour: 'numeric',
					minute: '2-digit',
					hour12: true
				})
			: null
	);

	// Calculate visit duration
	const visitDuration = $derived(
		visit.checkOutTime
			? Math.round(
					(new Date(visit.checkOutTime).getTime() - new Date(visit.checkInTime).getTime()) /
						(1000 * 60)
				)
			: Math.round((new Date().getTime() - new Date(visit.checkInTime).getTime()) / (1000 * 60))
	);

	// Get badge variant based on severity
	const getSeverityVariant = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'destructive';
			case 'high':
				return 'destructive';
			case 'medium':
				return 'secondary';
			default:
				return 'outline';
		}
	};

	// Get status badge variant
	const getStatusVariant = (status: string) => {
		switch (status) {
			case 'active':
				return 'default';
			case 'completed':
				return 'secondary';
			case 'cancelled':
				return 'outline';
			default:
				return 'outline';
		}
	};

	// Parse medications from the notes if they exist
	const parseMedications = (notes: string | null) => {
		if (!notes) return [];

		// Look for patterns like "Medications Given:" or "Medication:" in the notes
		const medicationSection = notes.match(/(?:medications?\s+given|medication):\s*([^\n]+)/i);
		if (medicationSection) {
			return medicationSection[1]
				.split(',')
				.map((med: string) => med.trim())
				.filter((med: string) => med);
		}

		// Check if medicationGiven field has data
		if (visit.medicationGiven) {
			return visit.medicationGiven
				.split(',')
				.map((med: string) => med.trim())
				.filter((med: string) => med);
		}

		return [];
	};

	const medications = $derived(parseMedications(visit.notes));

	// Calculate student age
	const calculateAge = (birthDate: Date | string) => {
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	};

	const studentAge = $derived(calculateAge(visit.student.dateOfBirth));

	// Format vital signs for display
	const formatVitalSigns = (vitals: any) => {
		if (!vitals) return null;
		return {
			temperature: vitals.temperature ? `${vitals.temperature}°F` : null,
			bloodPressure:
				vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
					? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`
					: null,
			pulse: vitals.pulse ? `${vitals.pulse} bpm` : null,
			respiratoryRate: vitals.respiratoryRate ? `${vitals.respiratoryRate} breaths/min` : null,
			oxygenSaturation: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : null,
			height: vitals.heightCm ? `${vitals.heightCm} cm` : null,
			weight: vitals.weightKg ? `${vitals.weightKg} kg` : null,
			bmi: vitals.bmi ? vitals.bmi.toFixed(1) : null,
			bloodSugar: vitals.bloodSugar ? `${vitals.bloodSugar} mg/dL` : null
		};
	};

	const vitalSigns = $derived(formatVitalSigns(visit.vitalSigns));
</script>

<svelte:head>
	<title>Visit Details</title>
</svelte:head>

<div class="mx-auto w-full max-w-7xl px-4 py-8">
	<!-- Page Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-4">
			<Button
				variant="outline"
				size="icon"
				onclick={() => {
					history.back();
				}}
			>
				<ArrowLeft class="size-4" />
				<span class="sr-only">Back</span>
			</Button>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
						Visit Details
					</h1>
					<span class="rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
						#{visit.visitNumber}
					</span>
				</div>
				<p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
					<CalendarDays class="size-3.5" />
					{formattedDate} · {formattedTime}
				</p>
			</div>
		</div>

		<!-- Status and Emergency Badges -->
		<div class="flex flex-wrap items-center gap-2">
			{#if visit.isEmergency}
				<Badge variant="destructive" class="flex items-center gap-1">
					<AlertTriangle class="size-3" />
					Emergency
				</Badge>
			{/if}
			<Badge variant={getStatusVariant(visit.status)} class="capitalize">
				{visit.status}
			</Badge>
			<Badge variant={getSeverityVariant(visit.severity)} class="capitalize">
				{visit.severity} Priority
			</Badge>
		</div>
	</div>

	<!-- Quick stats bar -->
	<div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
		<div class="rounded-xl border border-border bg-card p-4">
			<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
				<Clock class="size-3.5" /> Check-in
			</div>
			<p class="mt-1 text-lg font-semibold text-foreground">{formattedTime}</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-4">
			<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
				<Clock class="size-3.5" /> Check-out
			</div>
			<p class="mt-1 text-lg font-semibold text-foreground">{checkOutFormatted ?? '—'}</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-4">
			<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
				<Timer class="size-3.5" /> Duration
			</div>
			<p class="mt-1 text-lg font-semibold text-foreground">{visitDuration} min</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-4">
			<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
				<Stethoscope class="size-3.5" /> Attended by
			</div>
			<p class="mt-1 truncate text-lg font-semibold text-foreground">
				{visit.attendedBy.firstName}
				{visit.attendedBy.lastName}
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Main Visit Information Card -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Vital Signs -->
			{#if vitalSigns && Object.values(vitalSigns).some((v) => v)}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2 text-base">
							<Activity class="size-5 text-primary" />
							Vital Signs
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{#each [
								{ label: 'Temperature', value: vitalSigns.temperature, icon: Thermometer },
								{ label: 'Blood Pressure', value: vitalSigns.bloodPressure, icon: Gauge },
								{ label: 'Pulse', value: vitalSigns.pulse, icon: HeartPulse },
								{ label: 'Respiratory Rate', value: vitalSigns.respiratoryRate, icon: Wind },
								{ label: 'O₂ Saturation', value: vitalSigns.oxygenSaturation, icon: Droplet },
								{ label: 'Blood Sugar', value: vitalSigns.bloodSugar, icon: Droplet },
								{ label: 'Height', value: vitalSigns.height, icon: Ruler },
								{ label: 'Weight', value: vitalSigns.weight, icon: Ruler },
								{ label: 'BMI', value: vitalSigns.bmi, icon: Gauge }
							] as vital}
								{#if vital.value}
									{@const VIcon = vital.icon}
									<div class="rounded-lg border border-border bg-muted/30 p-3">
										<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
											<VIcon class="size-3.5" />
											{vital.label}
										</div>
										<p class="mt-1 text-base font-semibold text-foreground">{vital.value}</p>
									</div>
								{/if}
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Visit Notes / Clinical Details -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-base">
						<Stethoscope class="size-5 text-primary" />
						Clinical Details
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-5">
					<!-- Reason -->
					<div>
						<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Chief Complaint
						</div>
						<div class="text-sm text-foreground">
							{visit.chiefComplaint || 'No reason specified'}
						</div>
					</div>

					{#if visit.notes}
						<div>
							<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Notes
							</div>
							<div class="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
								{visit.notes}
							</div>
						</div>
					{/if}

					{#if visit.symptoms}
						<div>
							<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Symptoms
							</div>
							<div class="whitespace-pre-wrap text-sm text-foreground">
								{visit.symptoms}
							</div>
						</div>
					{/if}

					{#if visit.diagnosis}
						<div>
							<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Diagnosis
							</div>
							<div class="text-sm text-foreground">{visit.diagnosis}</div>
						</div>
					{/if}

					{#if visit.treatment}
						<div>
							<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Treatment
							</div>
							<div class="whitespace-pre-wrap text-sm text-foreground">{visit.treatment}</div>
						</div>
					{/if}

					<!-- Medications Given -->
					{#if visit.medicationGiven || medications.length > 0}
						<div>
							<div class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								<Pill class="size-3.5" /> Medications Given
							</div>
							<div class="flex flex-wrap gap-2">
								{#if visit.medicationGiven}
									{#each visit.medicationGiven.split(/[\n,]+/) as medication}
										{#if medication.trim()}
											<span
												class="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
											>
												{medication.trim()}
											</span>
										{/if}
									{/each}
								{:else}
									{#each medications as medication}
										<span
											class="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary"
										>
											{medication}
										</span>
									{/each}
								{/if}
							</div>
						</div>
					{/if}

					{#if visit.instructions}
						<div>
							<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Instructions
							</div>
							<div class="whitespace-pre-wrap text-sm text-foreground">{visit.instructions}</div>
						</div>
					{/if}

					<!-- Nurse Information -->
					<Separator />
					<div class="flex items-center gap-2 text-sm">
						<Stethoscope class="size-4 text-muted-foreground" />
						<span class="text-muted-foreground">
							{visit.attendedBy.role === 'nurse' ? 'Nurse' : 'Attended by'}:
						</span>
						<span class="font-medium text-foreground">
							{visit.attendedBy.firstName}
							{visit.attendedBy.lastName}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Patient Information Sidebar -->
		<div class="lg:col-span-1">
			<div class="space-y-6 lg:sticky lg:top-6">
				<!-- Patient Info Card -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2 text-base">
							<User class="size-5 text-primary" />
							Patient Information
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<!-- Patient Avatar and Name -->
						<a
							href={`/students/${visit.student.studentId}`}
							class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
						>
							<Avatar class="h-14 w-14">
								{#if visit.student.profileUrl}
									<AvatarImage
										src={visit.student.profileUrl}
										alt={`${visit.student.firstName} ${visit.student.lastName}`}
									/>
								{/if}
								<AvatarFallback class="bg-primary/10 font-semibold text-primary">
									{visit.student.firstName.charAt(0)}{visit.student.lastName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div class="min-w-0">
								<div class="truncate font-semibold text-foreground">
									{visit.student.firstName}
									{visit.student.lastName}
								</div>
								<div class="text-sm text-muted-foreground">ID: {visit.student.studentId}</div>
								<div class="text-sm text-muted-foreground">{studentAge} years old</div>
							</div>
						</a>

						<Separator />

						<!-- Student Details -->
						<div class="space-y-2.5">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Grade</span>
								<span class="font-medium text-foreground">
									{visit.student.grade}{visit.student.section ? ` ${visit.student.section}` : ''}
								</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Date of Birth</span>
								<span class="font-medium text-foreground">
									{new Date(visit.student.dateOfBirth).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric'
									})}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Medical History -->
				{#if visit.student.chronicHealthConditions?.length > 0 || visit.student.currentMedications?.length > 0 || visit.student.healthHistory}
					<Card
						class="border-amber-300/60 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-950/20"
					>
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
								<AlertTriangle class="size-5" />
								Medical History
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							{#if visit.student.chronicHealthConditions?.length > 0}
								<div>
									<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
										Health Conditions
									</div>
									<div class="flex flex-wrap gap-1.5">
										{#each visit.student.chronicHealthConditions as condition}
											<span
												class="rounded-md bg-amber-200/70 px-2 py-0.5 text-xs font-medium capitalize text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
											>
												{condition}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if visit.student.currentMedications?.length > 0}
								<div>
									<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
										Current Medications
									</div>
									<div class="flex flex-wrap gap-1.5">
										{#each visit.student.currentMedications as medication}
											<span
												class="rounded-md bg-amber-200/70 px-2 py-0.5 text-xs font-medium capitalize text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
											>
												{medication}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if visit.student.healthHistory}
								<div>
									<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
										Health History
									</div>
									<div class="whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-100">
										{visit.student.healthHistory}
									</div>
								</div>
							{/if}
						</CardContent>
					</Card>
				{/if}
			</div>
		</div>
	</div>
</div>
