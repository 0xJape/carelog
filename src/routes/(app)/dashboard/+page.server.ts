import { db } from '$lib/server/db';
import { clinicVisits, students } from '$lib/server/db/schema';
import { and, count, desc, eq, gte, lt, ne } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const startOfNextMonth = new Date(startOfMonth);
	startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

	// Base query for non-cancelled visits
	const baseCondition = ne(clinicVisits.status, 'cancelled');

	// Get total visits count
	const [{ count: totalVisits }] = await db
		.select({ count: count() })
		.from(clinicVisits)
		.where(baseCondition);

	// Get visits this month count
	const [{ count: visitsThisMonth }] = await db
		.select({ count: count() })
		.from(clinicVisits)
		.where(
			and(
				baseCondition,
				gte(clinicVisits.checkInTime, startOfMonth),
				lt(clinicVisits.checkInTime, startOfNextMonth)
			)
		);

	// Get visits today count
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const startOfTomorrow = new Date(startOfToday);
	startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

	const [{ count: visitsThisDay }] = await db
		.select({ count: count() })
		.from(clinicVisits)
		.where(and(baseCondition, gte(clinicVisits.checkInTime, startOfToday), lt(clinicVisits.checkInTime, startOfTomorrow)));

	// Get severity counts for this month
	const severityCounts = await db
		.select({
			severity: clinicVisits.severity,
			count: count()
		})
		.from(clinicVisits)
		.where(
			and(
				baseCondition,
				gte(clinicVisits.checkInTime, startOfMonth),
				lt(clinicVisits.checkInTime, startOfNextMonth)
			)
		)
		.groupBy(clinicVisits.severity);

	// Get recent visits with student information
	const recentVisits = await db
		.select({
			id: clinicVisits.id,
			visitNumber: clinicVisits.visitNumber,
			checkInTime: clinicVisits.checkInTime,
			checkOutTime: clinicVisits.checkOutTime,
			visitType: clinicVisits.visitType,
			status: clinicVisits.status,
			severity: clinicVisits.severity,
			chiefComplaint: clinicVisits.chiefComplaint,
			isEmergency: clinicVisits.isEmergency,
			student: {
				id: students.id,
				studentId: students.studentId,
				firstName: students.firstName,
				lastName: students.lastName,
				grade: students.grade,
				section: students.section
			}
		})
		.from(clinicVisits)
		.innerJoin(students, eq(clinicVisits.studentId, students.id))
		.where(baseCondition)
		.orderBy(desc(clinicVisits.checkInTime))
		.limit(10);

	return {
		recentVisits,
		visitsThisDay,
		visitsThisMonth,
		totalVisits,
		severityCounts
	};
};
