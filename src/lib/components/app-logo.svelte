<script lang="ts">
	interface Props {
		showSubtitle?: boolean;
	}

	let { showSubtitle = true }: Props = $props();
</script>

<!-- Logo section -->
<a class="group flex items-center gap-3" href="/dashboard">
	<div class="flex size-10 items-center justify-center">
		<img
			src="/logo.png"
			alt="CareLog logo"
			class="size-10 rounded-lg shadow-sm ring-1 ring-border transition-transform duration-200 group-hover:scale-105"
		/>
	</div>
	<div class="leading-tight">
		<h1 class="text-lg font-bold tracking-tight text-foreground">CareLog</h1>
		{#if showSubtitle}
			<p class="text-xs text-muted-foreground">Clinic Management</p>
		{/if}
	</div>
</a>
