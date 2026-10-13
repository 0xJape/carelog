import { db } from '$lib/server/db/index.js';
import { clinicVisits } from '$lib/server/db/schema.js';
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
	const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const rows = await db.select({
		month: sql<string>`to_char(date_trunc('month', ${clinicVisits.checkInTime}), 'Mon')`,
		monthKey: sql<string>`to_char(date_trunc('month', ${clinicVisits.checkInTime}), 'YYYY-MM')`,
		visits: count(),
		emergency: sql<number>`count(*) filter (where ${clinicVisits.isEmergency} = true)`,
		critical: sql<number>`count(*) filter (where ${clinicVisits.severity} = 'critical')`
	}).from(clinicVisits).where(and(gte(clinicVisits.checkInTime, start), lt(clinicVisits.checkInTime, end))).groupBy(sql`date_trunc('month', ${clinicVisits.checkInTime})`).orderBy(sql`date_trunc('month', ${clinicVisits.checkInTime})`);

	return { months: Array.from({ length: 6 }, (_, index) => {
		const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		const row = rows.find((item) => item.monthKey === key);
		return { label: date.toLocaleString('en', { month: 'short' }), visits: Number(row?.visits ?? 0), emergency: Number(row?.emergency ?? 0), critical: Number(row?.critical ?? 0) };
	}) };
};
