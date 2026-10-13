import { db } from '$lib/server/db/index.js';
import { medicines, medicineBatches, inventoryAlerts } from '$lib/server/db/schema.js';
import { eq, desc, and, sum } from 'drizzle-orm';
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

		// Fetch all stock totals in one query instead of one query per medicine.
		const stockRows = await db
			.select({ medicineId: medicineBatches.medicineId, total: sum(medicineBatches.quantity) })
			.from(medicineBatches)
			.where(eq(medicineBatches.isActive, true))
			.groupBy(medicineBatches.medicineId);
		const stockByMedicine = new Map(stockRows.map((row) => [row.medicineId, Number(row.total ?? 0)]));
		const stockLevels = allMedicines.map((med) => {
			const totalStock = stockByMedicine.get(med.id) ?? 0;
			return { ...med, currentStock: totalStock, status: totalStock < med.minStockLevel ? 'low' : 'normal' };
		});
		const batches = await db
			.select({ id: medicineBatches.id, medicineId: medicineBatches.medicineId, name: medicines.name, dosage: medicines.dosage, form: medicines.form, manufacturer: medicines.manufacturer, batchNumber: medicineBatches.batchNumber, quantity: medicineBatches.quantity, expirationDate: medicineBatches.expirationDate })
			.from(medicineBatches)
			.innerJoin(medicines, eq(medicineBatches.medicineId, medicines.id))
			.where(and(eq(medicineBatches.isActive, true), eq(medicines.isActive, true)))
			.orderBy(medicines.name, medicineBatches.expirationDate);

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
			batches,
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
