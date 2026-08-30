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

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		if (!data.id || !data.name || !data.dosage) return json({ error: 'ID, name and dosage are required' }, { status: 400 });
		const [medicine] = await db.update(medicines).set({
			name: data.name, genericName: data.genericName || null, dosage: data.dosage,
			form: data.form || null, location: data.location || null, updatedAt: new Date()
		}).where(eq(medicines.id, data.id)).returning({ id: medicines.id });
		return medicine ? json({ success: true }) : json({ error: 'Medicine not found' }, { status: 404 });
	} catch (error) {
		console.error('Error updating medicine:', error);
		return json({ error: 'Failed to update medicine' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		if (!id) return json({ error: 'Medicine ID is required' }, { status: 400 });
		const [medicine] = await db.update(medicines).set({ isActive: false, updatedAt: new Date() }).where(eq(medicines.id, id)).returning({ id: medicines.id });
		return medicine ? json({ success: true }) : json({ error: 'Medicine not found' }, { status: 404 });
	} catch (error) {
		console.error('Error removing medicine:', error);
		return json({ error: 'Failed to remove medicine' }, { status: 500 });
	}
};
