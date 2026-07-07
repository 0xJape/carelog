<script lang="ts">
	import { LogOut } from '@lucide/svelte';
	import AppLogo from './app-logo.svelte';
	import NavigationMenuItems from './navigation-menu-items.svelte';
	import ThemeSwitcher from './theme-switcher.svelte';
	import VoiceGuideButton from './voice-guide-button.svelte';

	let { data } = $props();

	const user = $derived(data?.user);
	const initials = $derived(
		user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?'
	);
	const roleLabel = $derived(
		user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'
	);
</script>

<!-- Modern sidebar with enhanced styling and fixed positioning -->
<div class="flex w-64 flex-col">
	<div class="flex h-screen flex-col border-r border-sidebar-border bg-sidebar">
		<!-- Logo section -->
		<div class="flex items-center justify-between gap-2 px-5 py-5">
			<AppLogo />
			<div class="flex items-center gap-1.5">
				<VoiceGuideButton />
				<ThemeSwitcher initialTheme={data?.theme} />
			</div>
		</div>

		<div class="mx-5 border-t border-sidebar-border/60"></div>

		<!-- Navigation menu (scrollable) -->
		<div class="no-scrollbar flex flex-1 flex-col overflow-y-auto px-3 py-5">
			<NavigationMenuItems />
		</div>

		<!-- User profile + logout footer -->
		<div class="mt-auto border-t border-sidebar-border/60 p-3">
			{#if user}
				<div class="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
					>
						{initials}
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-foreground">
							{user.firstName}
							{user.lastName}
						</p>
						<p class="truncate text-xs text-muted-foreground">{roleLabel}</p>
					</div>
				</div>
			{/if}
			<a
				href="/logout"
				class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
				       text-muted-foreground transition-all duration-200 ease-out
				       hover:bg-destructive/10 hover:text-destructive
				       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive
				       active:scale-[0.98]"
			>
				<LogOut
					size={18}
					class="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
				/>
				<span>Logout</span>
			</a>
		</div>
	</div>
</div>
