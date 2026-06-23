import { db } from '$lib/server/db/index.js';
import { medicines, medicineBatches, inventoryAlerts, inventoryTransactions, users } from '$lib/server/db/schema.js';
import { sql, eq, desc, and, sum } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Fetch all active medicines with their current stock
		const allMedicines = await db
			.select({
				id: medicines.id,
				name: medicines.name,
				genericName: medicines.genericName,
				dosage: medicines.dosage,
				form: medicines.form,
				minStockLevel: medicines.minStockLevel,
				maxStockLevel: medicines.maxStockLevel,
				location: medicines.location,
				unitPrice: medicines.unitPrice
			})
			.from(medicines)
			.where(eq(medicines.isActive, true))
			.orderBy(medicines.name);

		// Fetch current stock levels for each medicine
		const stockLevels = await Promise.all(
			allMedicines.map(async (med) => {
				const result = await db
					.select({ total: sum(medicineBatches.quantity) })
					.from(medicineBatches)
					.where(
						and(
							eq(medicineBatches.medicineId, med.id),
							eq(medicineBatches.isActive, true)
						)
					);

				const totalStock = result[0]?.total || 0;
				return {
					...med,
					currentStock: totalStock,
					status: totalStock < med.minStockLevel ? 'low' : 'normal'
				};
			})
		);

		// Fetch low stock alerts
		const lowStockAlerts = await db
			.select({
				id: inventoryAlerts.id,
				medicineId: inventoryAlerts.medicineId,
				medicineName: medicines.name,
				alertType: inventoryAlerts.alertType,
				message: inventoryAlerts.message,
				severity: inventoryAlerts.severity,
				isResolved: inventoryAlerts.isResolved,
				createdAt: inventoryAlerts.createdAt
			})
			.from(inventoryAlerts)
			.innerJoin(medicines, eq(inventoryAlerts.medicineId, medicines.id))
			.where(
				and(
					eq(inventoryAlerts.alertType, 'low_stock'),
					eq(inventoryAlerts.isResolved, false)
				)
			)
			.orderBy(desc(inventoryAlerts.createdAt))
			.limit(10);

		// Fetch expiring soon alerts
		const expiringAlerts = await db
			.select({
				id: inventoryAlerts.id,
				medicineId: inventoryAlerts.medicineId,
				medicineName: medicines.name,
				alertType: inventoryAlerts.alertType,
				message: inventoryAlerts.message,
				severity: inventoryAlerts.severity,
				isResolved: inventoryAlerts.isResolved,
				createdAt: inventoryAlerts.createdAt
			})
			.from(inventoryAlerts)
			.innerJoin(medicines, eq(inventoryAlerts.medicineId, medicines.id))
			.where(
				and(
					eq(inventoryAlerts.alertType, 'expiring_soon'),
					eq(inventoryAlerts.isResolved, false)
				)
			)
			.orderBy(desc(inventoryAlerts.createdAt))
			.limit(10);

		// Calculate stats
		const totalMedicines = allMedicines.length;
		const lowStockCount = stockLevels.filter((m) => m.status === 'low').length;
		const totalAlerts = lowStockAlerts.length + expiringAlerts.length;

		return {
			medicines: stockLevels,
			lowStockAlerts,
			expiringAlerts,
			stats: {
				totalMedicines,
				lowStockCount,
				totalAlerts
			}
		};
	} catch (error) {
		console.error('Inventory load error:', error);
		throw error;
	}
};
