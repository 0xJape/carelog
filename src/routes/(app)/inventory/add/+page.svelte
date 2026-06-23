<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { AlertCircle, ArrowLeft, Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let submitting = $state(false);
	let formError = $derived(page.form?.error);

	const dosageForms = data.dosageForms || [];
</script>

<svelte:head>
	<title>Add Medicine</title>
</svelte:head>

<main class="mx-5 flex w-full flex-1 flex-col">
	<div class="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<button
				onclick={() => goto('/inventory')}
				class="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
			>
				<ArrowLeft class="h-5 w-5" />
			</button>
			<div>
				<h1 class="medical-typography-heading text-2xl text-foreground">Add Medicine</h1>
				<p class="text-sm text-muted-foreground">Add a new medicine to the inventory</p>
			</div>
		</div>

		<!-- Form -->
		<div class="grid gap-6 max-w-2xl">
			<form
				method="POST"
				class="space-y-6"
				use:enhance={() => {
					submitting = true;
					return async ({ result, update }) => {
						if (result.type === 'success') {
							toast.success('Medicine added successfully!');
							await goto('/inventory');
						} else if (result.type === 'failure') {
							toast.error('Failed to add medicine', {
								description: result.data?.error || 'Please try again'
							});
						}
						submitting = false;
						await update();
					};
				}}
			>
				{#if formError}
					<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
						<AlertCircle class="h-4 w-4 flex-shrink-0" />
						<span>{formError}</span>
					</div>
				{/if}

				<!-- Basic Information -->
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">Basic Information</CardTitle>
						<CardDescription>Medicine name, dosage, and form</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="name" class="text-sm font-medium">Medicine Name *</Label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="e.g., Paracetamol"
									required
									class="h-10"
								/>
							</div>

							<div class="space-y-2">
								<Label for="genericName" class="text-sm font-medium">Generic Name</Label>
								<Input
									id="genericName"
									name="genericName"
									type="text"
									placeholder="e.g., Acetaminophen"
									class="h-10"
								/>
							</div>
						</div>

						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="dosage" class="text-sm font-medium">Dosage *</Label>
								<Input
									id="dosage"
									name="dosage"
									type="text"
									placeholder="e.g., 500mg"
									required
									class="h-10"
								/>
							</div>

							<div class="space-y-2">
								<Label for="form" class="text-sm font-medium">Form</Label>
								<select
									id="form"
									name="form"
									class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<option value="">Select form</option>
									{#each dosageForms as dosageForm}
										<option value={dosageForm}>{dosageForm}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="manufacturer" class="text-sm font-medium">Manufacturer</Label>
								<Input
									id="manufacturer"
									name="manufacturer"
									type="text"
									placeholder="e.g., Pharma Inc."
									class="h-10"
								/>
							</div>

							<div class="space-y-2">
								<Label for="location" class="text-sm font-medium">Storage Location</Label>
								<Input
									id="location"
									name="location"
									type="text"
									placeholder="e.g., Cabinet A"
									class="h-10"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Stock Levels -->
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">Stock Levels</CardTitle>
						<CardDescription>Minimum and maximum stock thresholds</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="minStock" class="text-sm font-medium">Minimum Stock Level</Label>
								<Input
									id="minStock"
									name="minStock"
									type="number"
									value="10"
									min="1"
									class="h-10"
								/>
							</div>

							<div class="space-y-2">
								<Label for="maxStock" class="text-sm font-medium">Maximum Stock Level</Label>
								<Input
									id="maxStock"
									name="maxStock"
									type="number"
									value="100"
									min="1"
									class="h-10"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Initial Batch -->
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">Initial Batch</CardTitle>
						<CardDescription>Add the first batch of this medicine</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="batchNumber" class="text-sm font-medium">Batch Number *</Label>
								<Input
									id="batchNumber"
									name="batchNumber"
									type="text"
									placeholder="e.g., LOT123456"
									required
									class="h-10"
								/>
							</div>

							<div class="space-y-2">
								<Label for="batchQuantity" class="text-sm font-medium">Quantity *</Label>
								<Input
									id="batchQuantity"
									name="batchQuantity"
									type="number"
									placeholder="e.g., 100"
									required
									min="1"
									class="h-10"
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="expirationDate" class="text-sm font-medium">Expiration Date *</Label>
							<Input
								id="expirationDate"
								name="expirationDate"
								type="date"
								required
								class="h-10"
							/>
						</div>
					</CardContent>
				</Card>

				<!-- Actions -->
				<div class="flex gap-3 pt-4">
					<Button
						type="submit"
						disabled={submitting}
						class="gap-2"
					>
						{#if submitting}
							<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
							Adding...
						{:else}
							<Plus class="h-4 w-4" />
							Add Medicine
						{/if}
					</Button>
					<Button
						type="button"
						variant="outline"
						onclick={() => goto('/inventory')}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	</div>
</main>
