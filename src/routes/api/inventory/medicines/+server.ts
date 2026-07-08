import { db } from '$lib/server/db/index.js';
import { medicines } from '$lib/server/db/schema.js';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.name || !data.dosage) {
			return json(
				{ error: 'Name and dosage are required' },
				{ status: 400 }
			);
		}

		// Check if medicine already exists
		const existing = await db
			.select({ id: medicines.id })
			.from(medicines)
			.where(eq(medicines.name, data.name))
			.limit(1);

		if (existing.length > 0) {
			return json(
				{ error: 'Medicine already exists' },
				{ status: 409 }
			);
		}

		// Create new medicine
		const [newMedicine] = await db
			.insert(medicines)
			.values({
				name: data.name,
				genericName: data.genericName || null,
				description: data.description || null,
				dosage: data.dosage,
				form: data.form || null,
				manufacturer: data.manufacturer || null,
				supplier: data.supplier || null,
				unitPrice: data.unitPrice || null,
				minStockLevel: data.minStockLevel || 10,
				maxStockLevel: data.maxStockLevel || 100,
				location: data.location || null,
				notes: data.notes || null
			})
			.returning({ id: medicines.id });

		return json({ success: true, medicineId: newMedicine.id }, { status: 201 });
	} catch (error) {
		console.error('Error adding medicine:', error);
		return json(
			{ error: 'Failed to add medicine' },
			{ status: 500 }
		);
	}
};
