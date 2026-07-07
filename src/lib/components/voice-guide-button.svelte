<script lang="ts">
	import { voiceGuide } from '$lib/stores/voice-guide.js';
	import { page } from '$app/state';
	import { Volume2, VolumeX } from '@lucide/svelte';

	let enabled = $state(voiceGuide.isEnabled);

	function toggle() {
		enabled = !enabled;
		voiceGuide.setEnabled(enabled);
		if (enabled) {
			// Replay current page audio on re-enable (provides the user gesture)
			voiceGuide.playForRoute(page.url.pathname);
		}
	}
</script>

<button
	onclick={toggle}
	title={enabled ? 'Mute voice guide' : 'Enable voice guide'}
	class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
>
	{#if enabled}
		<Volume2 class="h-4 w-4" />
	{:else}
		<VolumeX class="h-4 w-4" />
	{/if}
	<span class="sr-only">{enabled ? 'Mute voice guide' : 'Enable voice guide'}</span>
</button>
