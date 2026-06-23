import { db } from '$lib/server/db/index.js';
import { medicines, medicineBatches, inventoryTransactions } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		dosageForms: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Powder', 'Liquid', 'Drops']
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		try {
			const formData = await request.formData();

			// Get form data
			const name = formData.get('name')?.toString().trim();
			const genericName = formData.get('genericName')?.toString().trim();
			const dosage = formData.get('dosage')?.toString().trim();
			const form = formData.get('form')?.toString();
			const manufacturer = formData.get('manufacturer')?.toString().trim();
			const minStock = parseInt(formData.get('minStock')?.toString() || '10');
			const maxStock = parseInt(formData.get('maxStock')?.toString() || '100');
			const location = formData.get('location')?.toString().trim();

			// Batch info
			const batchNumber = formData.get('batchNumber')?.toString().trim();
			const batchQuantity = parseInt(formData.get('batchQuantity')?.toString() || '0');
			const expirationDate = formData.get('expirationDate')?.toString();

			// Validate required fields
			if (!name || !dosage) {
				return fail(400, { error: 'Medicine name and dosage are required' });
			}

			if (!batchNumber || batchQuantity <= 0 || !expirationDate) {
				return fail(400, { error: 'Batch information is required' });
			}

			// Check if medicine already exists
			const existing = await db
				.select({ id: medicines.id })
				.from(medicines)
				.where(eq(medicines.name, name))
				.limit(1);

			if (existing.length > 0) {
				return fail(409, { error: 'Medicine already exists' });
			}

			// Create medicine
			const [newMedicine] = await db
				.insert(medicines)
				.values({
					name,
					genericName: genericName || null,
					dosage,
					form: form || null,
					manufacturer: manufacturer || null,
					minStockLevel: minStock,
					maxStockLevel: maxStock,
					location: location || null
				})
				.returning({ id: medicines.id });

			// Create batch
			const [newBatch] = await db
				.insert(medicineBatches)
				.values({
					medicineId: newMedicine.id,
					batchNumber,
					quantity: batchQuantity,
					expirationDate: new Date(expirationDate)
				})
				.returning({ id: medicineBatches.id });

			// Log transaction (only if user is authenticated)
			if (locals.user?.id) {
				await db.insert(inventoryTransactions).values({
					medicineId: newMedicine.id,
					batchId: newBatch.id,
					transactionType: 'stock_in',
					quantity: batchQuantity,
					reason: 'Initial stock',
					performedBy: locals.user.id
				});
			}

			// Redirect to inventory page
			return redirect(302, '/inventory');
		} catch (error) {
			console.error('Error adding medicine:', error);
			return fail(500, { error: 'Failed to add medicine. Please try again.' });
		}
	}
};
