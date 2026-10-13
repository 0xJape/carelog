<script lang="ts">
	import MonthlyCharts from '$lib/components/monthly-charts.svelte';
	let { data } = $props();
	type Month = { label: string; visits: number; emergency: number; critical: number };
	const total = $derived(data.months.reduce((sum: number, month: Month) => sum + month.visits, 0));
	const emergencies = $derived(data.months.reduce((sum: number, month: Month) => sum + month.emergency, 0));
	const critical = $derived(data.months.reduce((sum: number, month: Month) => sum + month.critical, 0));
</script>

<svelte:head><title>Monthly Reports</title></svelte:head>

<main class="mx-5 flex w-full flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
	<div class="mb-8">
		<p class="text-sm font-semibold uppercase tracking-widest text-primary">Analytics</p>
		<h1 class="medical-typography-heading text-3xl text-foreground">Monthly Report</h1>
		<p class="text-muted-foreground">Six-month clinic activity trends at a glance.</p>
	</div>

	<div class="mb-6 grid gap-4 md:grid-cols-3">
		<div class="rounded-2xl border border-border bg-card p-5 shadow-sm"><p class="text-sm text-muted-foreground">Total visits</p><p class="mt-2 text-3xl font-bold">{total}</p></div>
		<div class="rounded-2xl border border-border bg-card p-5 shadow-sm"><p class="text-sm text-muted-foreground">Emergency visits</p><p class="mt-2 text-3xl font-bold text-rose-600">{emergencies}</p></div>
		<div class="rounded-2xl border border-border bg-card p-5 shadow-sm"><p class="text-sm text-muted-foreground">Peak month</p><p class="mt-2 text-3xl font-bold">{data.months.reduce((best: Month, month: Month) => month.visits > best.visits ? month : best, data.months[0]).label}</p></div>
	</div>

	<div class="mt-6"><MonthlyCharts months={data.months} /></div>
</main>
