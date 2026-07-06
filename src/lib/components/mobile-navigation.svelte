<script lang="ts">
	import { LogOut, X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import AppLogo from './app-logo.svelte';
	import NavigationMenuItems from './navigation-menu-items.svelte';
	import ThemeSwitcher from './theme-switcher.svelte';

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
		data?: any;
	}

	let { isOpen = false, onClose, data }: Props = $props();

	const user = $derived(data?.user);
	const initials = $derived(
		user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?'
	);
	const roleLabel = $derived(
		user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'
	);

	function handleNavClick() {
		onClose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose?.();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose?.();
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop overlay -->
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		transition:fly={{ duration: 200, opacity: 0 }}
		role="dialog"
		aria-modal="true"
		aria-label="Mobile navigation menu"
		tabindex="-1"
	>
		<!-- Mobile navigation panel -->
		<nav
			id="mobile-navigation"
			class="fixed top-0 left-0 h-full w-80 max-w-[85vw] border-r border-background bg-sidebar"
			transition:fly={{ x: -320, duration: 300, opacity: 1 }}
			aria-label="Mobile navigation"
		>
			<div class="flex h-full flex-col">
				<!-- Header with close button -->
				<div class="flex items-center justify-between border-b border-background p-6">
					<AppLogo />

					<div class="flex items-center gap-3">
						<ThemeSwitcher initialTheme={data?.theme} />

						<button
							onclick={onClose}
							class="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg
							       text-gray-700 transition-all duration-200 ease-out
							       hover:bg-gray-100 hover:text-gray-900
							       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
							       active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
							aria-label="Close navigation menu"
						>
							<X class="h-4 w-4" />
						</button>
					</div>
				</div>

				<!-- Navigation content -->
				<div class="no-scrollbar flex flex-1 flex-col overflow-y-auto px-3 py-5">
					<NavigationMenuItems onNavClick={handleNavClick} />
				</div>

				<!-- User profile + logout footer -->
				<div class="mt-auto border-t border-background p-3">
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
						onclick={handleNavClick}
						class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
						       text-muted-foreground transition-all duration-200 ease-out
						       hover:bg-destructive/10 hover:text-destructive
						       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive
						       active:scale-[0.98]"
					>
						<LogOut size={18} class="shrink-0" />
						<span>Logout</span>
					</a>
				</div>
			</div>
		</nav>
	</div>
{/if}
