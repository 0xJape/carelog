<script lang="ts">
	import { page } from '$app/state';
	import {
		Calendar,
		LayoutDashboard,
		Package,
		Settings,
		Users,
		UsersRound
	} from '@lucide/svelte';

	interface Props {
		onNavClick?: () => void;
	}

	let { onNavClick }: Props = $props();

	// Grouped menu items for clearer structure
	const menuGroups = [
		{
			label: 'Overview',
			items: [{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
		},
		{
			label: 'Clinic',
			items: [
				{ title: 'Students', href: '/students', icon: Users },
				{ title: 'Visits', href: '/visits', icon: Calendar },
				{ title: 'Inventory', href: '/inventory', icon: Package }
			]
		},
		{
			label: 'Management',
			items: [
				{ title: 'Staffs', href: '/staffs', icon: UsersRound },
				{ title: 'Settings', href: '/settings', icon: Settings }
			]
		}
	];

	function isActiveRoute(href: string, currentPath: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	function handleNavClick() {
		onNavClick?.();
	}
</script>

<!-- Navigation menu items -->
<nav class="flex flex-col gap-6" aria-label="Main navigation">
	{#each menuGroups as group}
		<div class="flex flex-col gap-1">
			<p
				class="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70"
			>
				{group.label}
			</p>
			{#each group.items as item}
				{@const Icon = item.icon}
				{@const isActive = isActiveRoute(item.href, page.url.pathname)}
				<a
					href={item.href}
					onclick={handleNavClick}
					class="group relative flex items-center gap-3 rounded-lg px-3 py-2.5
					       text-sm font-medium transition-all duration-200 ease-out
					       {isActive
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'text-muted-foreground hover:bg-accent hover:text-foreground'}
					       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
					       active:scale-[0.98]"
					aria-current={isActive ? 'page' : undefined}
				>
					{#if isActive}
						<span
							class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/80"
						></span>
					{/if}
					<Icon
						size={18}
						class="shrink-0 transition-transform duration-200 group-hover:scale-110"
					/>
					<span>{item.title}</span>
				</a>
			{/each}
		</div>
	{/each}
</nav>

