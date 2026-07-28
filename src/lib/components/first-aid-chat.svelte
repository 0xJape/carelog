<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import {
		Activity,
		Bot,
		ChevronDown,
		Loader2,
		MessageCircleHeart,
		Send,
		ShieldCheck,
		Sparkles,
		Volume2,
		VolumeX
	} from '@lucide/svelte';
	import { tick } from 'svelte';

	type Message = { role: 'user' | 'assistant'; content: string };

	const prompts = ['Minor burn', 'Nosebleed', 'Sprained ankle', 'Fainting'];
	let open = $state(false);
	let input = $state('');
	let loading = $state(false);
	let speechLoading = $state(false);
	let messages = $state<Message[]>([
		{
			role: 'assistant',
			content: 'Describe what happened and current symptoms. I will give immediate first-aid steps only.'
		}
	]);
	let messageList = $state<HTMLDivElement | null>(null);
	let audio = $state<HTMLAudioElement | null>(null);
	let speaking = $state(false);

	function speechText(text: string) {
		return text
			.replace(/[•*_#~`|<>\[\]{}]/g, ' ')
			.replace(/[–—-]+/g, ', ')
			.replace(/\b(\d+)\s*mg\b/gi, '$1 milligrams')
			.replace(/\bhrs?\b/gi, 'hours')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 200);
	}

	function stopSpeech() {
		audio?.pause();
		audio = null;
		speaking = false;
	}

	async function readReply(text: string) {
		stopSpeech();
		speechLoading = true;
		try {
			const response = await fetch('/api/speak', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: speechText(text) })
			});
			if (!response.ok) throw new Error();
			const url = URL.createObjectURL(await response.blob());
			audio = new Audio(url);
			audio.onplay = () => (speaking = true);
			audio.onended = () => {
				speaking = false;
				URL.revokeObjectURL(url);
			};
			await audio.play();
		} finally {
			speechLoading = false;
		}
	}

	async function send(message = input) {
		const content = message.trim();
		if (!content || loading) return;
		messages.push({ role: 'user', content });
		input = '';
		loading = true;
		await tick();
		messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
		try {
			const response = await fetch('/api/first-aid-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: messages.slice(-10) })
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Assistant unavailable');
			messages.push({ role: 'assistant', content: data.reply });
			await tick();
			messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
			await readReply(data.reply).catch(() => undefined);
		} catch (error) {
			messages.push({
				role: 'assistant',
				content: error instanceof Error ? error.message : 'Assistant unavailable. Seek trained help if urgent.'
			});
		} finally {
			loading = false;
		}
	}
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
	{#if open}
		<section class="relative flex h-[min(70vh,38rem)] w-[min(calc(100vw-2.5rem),25rem)] flex-col overflow-hidden rounded-3xl border border-cyan-300/20 bg-background/90 shadow-[inset_0_1px_rgba(255,255,255,0.14),0_28px_80px_rgba(8,47,73,0.28)] backdrop-blur-2xl">
			<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.14),transparent_42%)]"></div>
			<header class="relative flex items-center gap-3 border-b border-cyan-500/15 p-4">
				<div class="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-orange-500 shadow-lg shadow-cyan-500/25">
					<Activity class="size-5 text-white" />
					<span class="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-400"></span>
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5">
						<h2 class="truncate text-sm font-bold text-foreground">First Aid Assist</h2>
						<Sparkles class="size-3 text-cyan-500" />
					</div>
					<p class="text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">Groq response core</p>
				</div>
				<button type="button" class="grid size-8 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground" onclick={() => (open = false)} aria-label="Minimize first aid assistant">
					<ChevronDown class="size-4" />
				</button>
			</header>

			<div class="relative flex items-center gap-2 border-b border-border/40 bg-amber-500/5 px-4 py-2 text-[10px] leading-snug text-amber-700 dark:text-amber-300">
				<ShieldCheck class="size-3.5 shrink-0" /> First aid only. Call emergency services for life-threatening symptoms.
			</div>

			<div bind:this={messageList} class="relative flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
				{#each messages as message}
					<div class={cn('flex gap-2', message.role === 'user' && 'justify-end')}>
						{#if message.role === 'assistant'}
							<div class="mt-1 grid size-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-orange-500/20 text-cyan-600 dark:text-cyan-300">
								<Bot class="size-3.5" />
							</div>
						{/if}
						<div class={cn('max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm', message.role === 'assistant' ? 'rounded-tl-sm border border-cyan-500/10 bg-card/80 text-foreground' : 'rounded-tr-sm bg-gradient-to-br from-cyan-600 to-orange-500 text-white')}>
							<p class="whitespace-pre-wrap">{message.content}</p>
							{#if message.role === 'assistant' && messages.indexOf(message) > 0}
								<button type="button" class="mt-2 flex items-center gap-1 text-[10px] font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300" onclick={() => (speaking ? stopSpeech() : readReply(message.content))} disabled={speechLoading}>
									{#if speechLoading}<Loader2 class="size-3 animate-spin" />{:else if speaking}<VolumeX class="size-3" /> Stop{:else}<Volume2 class="size-3" /> Listen{/if}
								</button>
							{/if}
						</div>
					</div>
				{/each}
				{#if loading}
					<div class="flex items-center gap-2">
						<div class="grid size-7 place-items-center rounded-xl bg-cyan-500/10"><Bot class="size-3.5 text-cyan-500" /></div>
						<div class="flex gap-1 rounded-2xl rounded-tl-sm border border-cyan-500/10 bg-card/80 px-4 py-3">
							<span class="size-1.5 animate-bounce rounded-full bg-cyan-500"></span><span class="size-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]"></span><span class="size-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]"></span>
						</div>
					</div>
				{/if}
			</div>

			{#if messages.length === 1}
				<div class="relative flex flex-wrap gap-1.5 px-4 pb-3">
					{#each prompts as prompt}
						<button type="button" class="rounded-full border border-cyan-500/15 bg-cyan-500/5 px-2.5 py-1 text-[10px] font-medium text-cyan-800 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 dark:text-cyan-200" onclick={() => send(prompt)}>{prompt}</button>
					{/each}
				</div>
			{/if}

			<form class="relative border-t border-border/50 bg-background/70 p-3" onsubmit={(event) => { event.preventDefault(); send(); }}>
				<div class="flex items-end gap-2 rounded-2xl border border-border/70 bg-card/70 p-1.5 pl-3 shadow-inner focus-within:border-cyan-500/40 focus-within:ring-2 focus-within:ring-cyan-500/10">
					<textarea bind:value={input} rows="1" maxlength="1000" placeholder="Describe injury or symptoms..." class="max-h-24 min-h-9 flex-1 resize-none bg-transparent py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground" onkeydown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }}></textarea>
					<Button type="submit" size="icon" class="size-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20" disabled={!input.trim() || loading} aria-label="Send message">
						{#if loading}<Loader2 class="size-4 animate-spin" />{:else}<Send class="size-4" />{/if}
					</Button>
				</div>
			</form>
		</section>
	{/if}

	<button type="button" onclick={() => (open = !open)} class="chat-launcher group relative grid size-16 place-items-center rounded-full bg-slate-950 text-white shadow-xl shadow-cyan-500/25 transition duration-300 hover:-translate-y-1 hover:scale-105" aria-label={open ? 'Close first aid assistant' : 'Open first aid assistant'} aria-expanded={open}>
		<span class="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-500/25 to-orange-500/25 backdrop-blur"></span>
		{#if open}<ChevronDown class="relative size-6" />{:else}<MessageCircleHeart class="relative size-6" />{/if}
	</button>
</div>

<style>
	.chat-launcher::before {
		content: '';
		position: absolute;
		inset: -3px;
		z-index: -1;
		border-radius: inherit;
		background: conic-gradient(from 0deg, #06b6d4, #ffffff, #f97316, #0891b2, #06b6d4);
		filter: drop-shadow(0 0 12px rgb(6 182 212 / 0.45));
		animation: chat-ring 4s linear infinite;
	}

	@keyframes chat-ring {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.chat-launcher::before { animation: none; }
	}
</style>
