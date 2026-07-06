<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import { ArrowRight } from '@lucide/svelte';

	type Accent = 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';

	interface VisitSummary {
		title: string;
		count: number;
		actionText: string;
		actionHref?: string;
		icon?: typeof IconType;
		accent?: Accent;
		subtitle?: string;
	}

	let { summaries }: { summaries: VisitSummary[] } = $props();

	const accentClasses: Record<Accent, { ring: string; icon: string; bar: string }> = {
		blue: {
			ring: 'group-hover:border-blue-400/60 dark:group-hover:border-blue-500/40',
			icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
			bar: 'from-blue-500 to-indigo-500'
		},
		emerald: {
			ring: 'group-hover:border-emerald-400/60 dark:group-hover:border-emerald-500/40',
			icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
			bar: 'from-emerald-500 to-teal-500'
		},
		amber: {
			ring: 'group-hover:border-amber-400/60 dark:group-hover:border-amber-500/40',
			icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
			bar: 'from-amber-500 to-orange-500'
		},
		violet: {
			ring: 'group-hover:border-violet-400/60 dark:group-hover:border-violet-500/40',
			icon: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
			bar: 'from-violet-500 to-purple-500'
		},
		rose: {
			ring: 'group-hover:border-rose-400/60 dark:group-hover:border-rose-500/40',
			icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
			bar: 'from-rose-500 to-pink-500'
		}
	};
</script>

<!-- Responsive card grid -->
<div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each summaries as summary}
		{@const accent = accentClasses[summary.accent ?? 'blue']}
		{@const Icon = summary.icon}
		<svelte:element
			this={summary.actionHref ? 'a' : 'div'}
			href={summary.actionHref}
			class="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5
			       shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md
			       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
			       {accent.ring}"
		>
			<!-- Accent bar -->
			<div
				class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r {accent.bar} opacity-0 transition-opacity duration-200 group-hover:opacity-100"
			></div>

			<div class="mb-4 flex items-start justify-between">
				<div class="min-w-0">
					<h3 class="text-sm font-medium text-muted-foreground">{summary.title}</h3>
					{#if summary.subtitle}
						<p class="mt-0.5 text-xs text-muted-foreground/70">{summary.subtitle}</p>
					{/if}
				</div>
				{#if Icon}
					<div class="flex size-10 shrink-0 items-center justify-center rounded-lg {accent.icon}">
						<Icon size={20} />
					</div>
				{/if}
			</div>

			<!-- Large count display -->
			<div class="text-3xl font-bold leading-none tracking-tight text-foreground md:text-4xl">
				{summary.count.toLocaleString()}
			</div>

			<!-- Action link -->
			<div class="mt-4 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
				{summary.actionText}
				{#if summary.actionHref}
					<ArrowRight class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
				{/if}
			</div>
		</svelte:element>
	{/each}
</div>
