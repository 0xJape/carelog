<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let showTransition = $state(false);

	beforeNavigate((e) => {
		showTransition = true;
		e.complete.then(() => {
			showTransition = false;
		});
	});
</script>

{#if showTransition}
	<div
		class="fixed inset-0 z-[9999] bg-background/50 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
	></div>
{/if}
