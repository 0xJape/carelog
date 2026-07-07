<script lang="ts">
	import { voiceGuide } from '$lib/stores/voice-guide.js';

	let { onEnter }: { onEnter: () => void } = $props();

	let entering = $state(false);

	function handleEnter() {
		if (entering) return;
		entering = true;
		// User gesture — unlock audio and start welcome guide
		voiceGuide.init();
		voiceGuide.playWelcome();
		// Small delay for exit animation before revealing landing page
		setTimeout(() => onEnter(), 800);
	}
</script>

<div
	class="splash fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-slate-950"
	class:splash--exit={entering}
>
	<!-- Animated grid background -->
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute inset-0 opacity-20"
			style="background-image: linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px); background-size: 60px 60px;">
		</div>
		<!-- Radial fade mask over grid -->
		<div class="absolute inset-0" style="background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #020617 100%);"></div>
	</div>

	<!-- Glow orbs -->
	<div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="absolute -left-64 -top-64 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-3xl"></div>
		<div class="absolute -right-48 -top-32 h-[400px] w-[400px] animate-pulse rounded-full bg-indigo-600/10 blur-3xl" style="animation-delay: 1s;"></div>
		<div class="absolute -bottom-48 left-0 h-[350px] w-[350px] animate-pulse rounded-full bg-cyan-600/8 blur-3xl" style="animation-delay: 2s;"></div>
	</div>

	<!-- Scanning line -->
	<div class="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent scan-line"></div>

	<!-- Content -->
	<div class="relative flex flex-col items-center gap-8 px-6 text-center">
		<!-- Logo mark -->
		<div class="relative flex items-center justify-center">
			<div class="absolute h-32 w-32 animate-ping rounded-full border border-blue-500/20" style="animation-duration: 2s;"></div>
			<div class="absolute h-24 w-24 animate-ping rounded-full border border-blue-400/30" style="animation-duration: 2s; animation-delay: 0.3s;"></div>
			<div class="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 shadow-2xl shadow-blue-500/20 backdrop-blur-sm">
				<img src="/logo.png" alt="CLINIQAI" class="h-10 w-10 rounded-xl" />
			</div>
		</div>

		<!-- Name + tagline -->
		<div class="space-y-3">
			<div class="flex items-center justify-center gap-3">
				<div class="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/60"></div>
				<span class="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-400">
					School Clinic System
				</span>
				<div class="h-px w-12 bg-gradient-to-l from-transparent to-blue-500/60"></div>
			</div>

			<h1 class="text-5xl font-bold tracking-tight text-white sm:text-6xl">
				CLINIQ<span class="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">AI</span>
			</h1>

			<p class="text-sm text-slate-400 max-w-xs">
				AI-integrated clinic management for schools — fast, smart, and built for emergencies.
			</p>
		</div>

		<!-- Loading indicators -->
		<div class="w-64 space-y-2">
			{#each [
				{ label: 'Loading student records', delay: '0ms', width: '100%' },
				{ label: 'Initializing AI engine', delay: '200ms', width: '85%' },
				{ label: 'Connecting to database', delay: '400ms', width: '92%' }
			] as item}
				<div class="flex items-center gap-3" style="animation: fadeSlideIn 0.5s ease both; animation-delay: {item.delay}">
					<div class="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
						<div
							class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-progress-fill"
							style="animation-delay: {item.delay}"
						></div>
					</div>
					<span class="w-40 text-left text-[10px] text-slate-500">{item.label}</span>
				</div>
			{/each}
		</div>

		<!-- Enter button -->
		<button
			onclick={handleEnter}
			disabled={entering}
			class="enter-btn group relative mt-2 overflow-hidden rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-10 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-blue-400/60 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if entering}
					<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
					Entering...
				{:else}
					<span class="text-base">→</span>
					Enter System
				{/if}
			</span>
			<!-- Shimmer sweep on hover -->
			<span class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
		</button>

		<p class="text-[10px] text-slate-600">
			Tupi National High School · Clinic Health Office
		</p>
	</div>
</div>

<style>
	.splash {
		animation: splashIn 0.6s ease both;
	}

	.splash--exit {
		animation: splashOut 0.8s ease forwards;
	}

	@keyframes splashIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes splashOut {
		0% { opacity: 1; transform: scale(1); }
		100% { opacity: 0; transform: scale(1.04); }
	}

	.scan-line {
		animation: scanMove 4s linear infinite;
	}

	@keyframes scanMove {
		0% { top: -2px; }
		100% { top: 100%; }
	}
</style>
