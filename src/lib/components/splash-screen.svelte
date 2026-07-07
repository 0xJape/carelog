<script lang="ts">
	import { voiceGuide } from '$lib/stores/voice-guide.js';

	let { onEnter }: { onEnter: () => void } = $props();

	let entering = $state(false);

	function handleEnter() {
		if (entering) return;
		entering = true;
		voiceGuide.init();
		voiceGuide.playWelcome();
		setTimeout(() => onEnter(), 600);
	}
</script>

<div
	class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950"
	class:exit={entering}
>
	<!-- Subtle grid -->
	<div class="pointer-events-none absolute inset-0 opacity-[0.06]"
		style="background-image: linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px); background-size: 48px 48px;">
	</div>

	<!-- Center glow -->
	<div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

	<!-- Content -->
	<div class="relative flex flex-col items-center gap-10">
		<!-- Logo -->
		<div class="flex flex-col items-center gap-4">
			<div class="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
				<img src="/logo.png" alt="CLINIQAI" class="size-9 rounded-xl" />
			</div>
			<div class="text-center">
				<h1 class="text-3xl font-bold tracking-tight text-white">
					CLINIQ<span class="text-indigo-400">AI</span>
				</h1>
				<p class="mt-1 text-xs text-slate-500 tracking-widest uppercase">School Clinic System</p>
			</div>
		</div>

		<!-- Enter button -->
		<button
			onclick={handleEnter}
			disabled={entering}
			class="group relative rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-50"
		>
			{#if entering}
				<span class="flex items-center gap-2">
					<span class="size-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
					Entering...
				</span>
			{:else}
				Enter
			{/if}
		</button>

		<p class="text-[10px] tracking-widest text-slate-700 uppercase">Tupi National High School</p>
	</div>
</div>

<style>
	div.fixed {
		animation: fadeIn 0.5s ease both;
	}

	div.exit {
		animation: fadeOut 0.6s ease forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}
</style>
