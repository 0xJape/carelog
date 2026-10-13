<script lang="ts">
	import { onMount } from 'svelte';

	type Month = { label: string; visits: number; emergency: number; critical: number };
	let { months }: { months: Month[] } = $props();
	let lineCanvas: HTMLCanvasElement;
	let doughnutCanvas: HTMLCanvasElement;

	onMount(() => {
		let line: import('chart.js').Chart;
		let doughnut: import('chart.js').Chart;
		void (async () => {
		const { Chart, registerables } = await import('chart.js');
		Chart.register(...registerables);
		line = new Chart(lineCanvas, {
			type: 'bar',
			data: { labels: months.map((month) => month.label), datasets: [
				{ label: 'Routine', data: months.map((month) => Math.max(month.visits - month.emergency - month.critical, 0)), backgroundColor: '#06b6d4', borderRadius: 8, borderSkipped: false, stack: 'visits' },
				{ label: 'Emergency', data: months.map((month) => month.emergency), backgroundColor: '#f43f5e', borderRadius: 8, borderSkipped: false, stack: 'visits' },
				{ label: 'Critical', data: months.map((month) => month.critical), backgroundColor: '#7c3aed', borderRadius: 8, borderSkipped: false, stack: 'visits' }
			] },
			options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } }, tooltip: { enabled: true, mode: 'index', intersect: false } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, border: { display: false } } } }
		});
		doughnut = new Chart(doughnutCanvas, {
			type: 'doughnut',
			data: { labels: ['Routine', 'Emergency', 'Critical'], datasets: [{ data: [months.reduce((sum, month) => sum + month.visits - month.emergency - month.critical, 0), months.reduce((sum, month) => sum + month.emergency, 0), months.reduce((sum, month) => sum + month.critical, 0)], backgroundColor: ['#0ea5e9', '#f43f5e', '#7c3aed'], borderWidth: 0 }] },
			options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } } }
		});
		})();
		return () => { line.destroy(); doughnut.destroy(); };
	});
</script>

<div class="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
	<section class="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
		<div class="mb-6"><h2 class="text-lg font-semibold">Visit volume</h2><p class="text-sm text-muted-foreground">Routine, emergency, and critical cases</p></div>
		<div class="h-72"><canvas bind:this={lineCanvas} aria-label="Monthly visit trend chart"></canvas></div>
	</section>
	<section class="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
		<div class="mb-6"><h2 class="text-lg font-semibold">Case mix</h2><p class="text-sm text-muted-foreground">Routine, emergency, and critical cases</p></div>
		<div class="h-72"><canvas bind:this={doughnutCanvas} aria-label="Case mix chart"></canvas></div>
	</section>
</div>
