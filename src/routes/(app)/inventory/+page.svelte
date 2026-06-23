<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		AlertTriangle,
		Package,
		Plus,
		TrendingDown,
		Bell,
		Clock,
		Pill,
		MoreVertical
	} from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let medicines = $derived(data.medicines);
	let lowStockAlerts = $derived(data.lowStockAlerts);
	let expiringAlerts = $derived(data.expiringAlerts);
	let stats = $derived(data.stats);

	function getStockStatus(current: number, min: number, max: number) {
		if (current <= min) return { label: 'Low', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' };
		if (current >= max) return { label: 'High', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' };
		return { label: 'Normal', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' };
	}
</script>

<svelte:head>
	<title>Inventory Management</title>
</svelte:head>

<main class="mx-5 flex w-full flex-1 flex-col">
	<div class="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
		<!-- Header -->
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div class="flex flex-col gap-1">
				<h1 class="medical-typography-heading text-2xl text-foreground md:text-3xl">
					Inventory Management
				</h1>
				<p class="text-sm text-muted-foreground">
					Track medicines, monitor stock levels, and manage expiration dates
				</p>
			</div>
			<Button class="gap-2 w-fit" onclick={() => goto('/inventory/add')}>
				<Plus class="h-4 w-4" />
				Add Medicine
			</Button>
		</div>

		<!-- Stats Cards -->
		<div class="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<CardTitle class="text-sm font-medium">Total Medicines</CardTitle>
						<Pill class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-foreground">{stats.totalMedicines}</div>
					<p class="text-xs text-muted-foreground">Active medicines in stock</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<CardTitle class="text-sm font-medium">Low Stock</CardTitle>
						<TrendingDown class="h-5 w-5 text-orange-600 dark:text-orange-400" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStockCount}</div>
					<p class="text-xs text-muted-foreground">Items below minimum level</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<CardTitle class="text-sm font-medium">Active Alerts</CardTitle>
						<AlertTriangle class="h-5 w-5 text-red-600 dark:text-red-400" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalAlerts}</div>
					<p class="text-xs text-muted-foreground">Requires immediate attention</p>
				</CardContent>
			</Card>
		</div>

		<!-- Alerts Section -->
		{#if lowStockAlerts.length > 0 || expiringAlerts.length > 0}
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Low Stock Alerts -->
				{#if lowStockAlerts.length > 0}
					<Card class="border-orange-200 dark:border-orange-900/50">
						<CardHeader>
							<div class="flex items-center justify-between">
								<CardTitle class="flex items-center gap-2 text-base">
									<TrendingDown class="h-4 w-4 text-orange-600 dark:text-orange-400" />
									Low Stock Alerts
								</CardTitle>
								<span class="text-xs font-semibold text-orange-600 dark:text-orange-400">
									{lowStockAlerts.length}
								</span>
							</div>
						</CardHeader>
						<CardContent class="space-y-2">
							{#each lowStockAlerts.slice(0, 5) as alert}
								<div class="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/30 dark:bg-orange-950/20">
									<div class="min-w-0">
										<p class="text-sm font-medium text-orange-900 dark:text-orange-100">
											{alert.medicineName}
										</p>
										<p class="text-xs text-orange-700 dark:text-orange-300">
											{alert.message}
										</p>
									</div>
									<Button variant="ghost" size="sm" class="h-8 w-8 p-0 flex-shrink-0">
										<MoreVertical class="h-4 w-4" />
									</Button>
								</div>
							{/each}
						</CardContent>
					</Card>
				{/if}

				<!-- Expiring Soon Alerts -->
				{#if expiringAlerts.length > 0}
					<Card class="border-red-200 dark:border-red-900/50">
						<CardHeader>
							<div class="flex items-center justify-between">
								<CardTitle class="flex items-center gap-2 text-base">
									<Clock class="h-4 w-4 text-red-600 dark:text-red-400" />
									Expiring Soon
								</CardTitle>
								<span class="text-xs font-semibold text-red-600 dark:text-red-400">
									{expiringAlerts.length}
								</span>
							</div>
						</CardHeader>
						<CardContent class="space-y-2">
							{#each expiringAlerts.slice(0, 5) as alert}
								<div class="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-950/20">
									<div class="min-w-0">
										<p class="text-sm font-medium text-red-900 dark:text-red-100">
											{alert.medicineName}
										</p>
										<p class="text-xs text-red-700 dark:text-red-300">
											{alert.message}
										</p>
									</div>
									<Button variant="ghost" size="sm" class="h-8 w-8 p-0 flex-shrink-0">
										<MoreVertical class="h-4 w-4" />
									</Button>
								</div>
							{/each}
						</CardContent>
					</Card>
				{/if}
			</div>
		{/if}

		<!-- Inventory Table -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Package class="h-5 w-5" />
					Medicine Inventory
				</CardTitle>
				<CardDescription>
					Current stock levels and status for all medicines
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border/40">
								<th class="px-4 py-2 text-left font-medium text-muted-foreground">Medicine</th>
								<th class="px-4 py-2 text-left font-medium text-muted-foreground">Dosage</th>
								<th class="px-4 py-2 text-center font-medium text-muted-foreground">Current</th>
								<th class="px-4 py-2 text-center font-medium text-muted-foreground">Min / Max</th>
								<th class="px-4 py-2 text-center font-medium text-muted-foreground">Status</th>
								<th class="px-4 py-2 text-left font-medium text-muted-foreground">Location</th>
							</tr>
						</thead>
						<tbody>
							{#each medicines as med}
								{@const status = getStockStatus(med.currentStock, med.minStockLevel, med.maxStockLevel)}
								<tr class="border-b border-border/20 hover:bg-muted/50 transition-colors">
									<td class="px-4 py-3">
										<div>
											<p class="font-medium text-foreground">{med.name}</p>
											{#if med.genericName}
												<p class="text-xs text-muted-foreground">{med.genericName}</p>
											{/if}
										</div>
									</td>
									<td class="px-4 py-3 text-muted-foreground">{med.dosage} {med.form}</td>
									<td class="px-4 py-3 text-center font-semibold text-foreground">
										{med.currentStock}
									</td>
									<td class="px-4 py-3 text-center text-sm text-muted-foreground">
										{med.minStockLevel} / {med.maxStockLevel}
									</td>
									<td class="px-4 py-3 text-center">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {status.bg} {status.color}">
											{status.label}
										</span>
									</td>
									<td class="px-4 py-3 text-muted-foreground">{med.location || 'N/A'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if medicines.length === 0}
					<div class="flex flex-col items-center justify-center py-12">
						<Package class="h-12 w-12 text-muted-foreground/20 mb-3" />
						<p class="text-sm text-muted-foreground">No medicines found</p>
						<Button variant="outline" class="mt-4 gap-2">
							<Plus class="h-4 w-4" />
							Add First Medicine
						</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</main>
