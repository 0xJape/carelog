import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export type VitalSigns = {
	temperature: number;
	bloodPressureSystolic?: number;
	bloodPressureDiastolic?: number;
	pulse?: number;
	respiratoryRate?: number;
	oxygenSaturation?: number;
	heightCm?: number;
	weightKg?: number;
	bmi?: number;
	bloodSugar?: number;
	notes?: string;
};

// Enums for better type safety (as constants since SQLite doesn't have native enums)
export const USER_ROLES = ['admin', 'nurse', 'doctor', 'staff'] as const;
export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'] as const;
export const VISIT_TYPES = [
	'emergency',
	'illness',
	'injury',
	'medication',
	'checkup',
	'mental_health',
	'other'
] as const;
export const VISIT_STATUSES = ['active', 'completed', 'cancelled'] as const;
export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const RELATIONSHIPS = [
	'parent',
	'guardian',
	'sibling',
	'grandparent',
	'other',
	'adviser'
] as const;
export const NOTIFICATION_STATUSES = ['pending', 'sent', 'failed'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type Gender = (typeof GENDERS)[number];
export type BloodType = (typeof BLOOD_TYPES)[number];
export type VisitType = (typeof VISIT_TYPES)[number];
export type VisitStatus = (typeof VISIT_STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type Relationship = (typeof RELATIONSHIPS)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

// Users table (for nurses, doctors, admins)
export const users = pgTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	role: text('role').$type<UserRole>().notNull().default('nurse'),
	phoneNumber: text('phone_number'),
	profileUrl: text('profile_url'),
	isActive: boolean('is_active').notNull().default(true),
	lastLogin: timestamp('last_login', { mode: 'date' }),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
});

export const session = pgTable(
	'user_session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
	},
	(t) => [index('idx_usersession_user_id').on(t.userId)]
);

// Students table
export const students = pgTable('students', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	studentId: text('student_id').notNull().unique(), // School ID number
	qrCodeId: text('qr_code_id').unique(), // QR code identifier
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	middleName: text('middle_name'),
	email: text('email').unique(),
	dateOfBirth: timestamp('date_of_birth', { mode: 'date' }).notNull(),
	gender: text('gender').$type<Gender>().notNull(),
	grade: text('grade').notNull(),
	section: text('section'),
	address: text('address'),

	// Simple medical information (as shown in the image)
	chronicHealthConditions: jsonb('chronic_health_conditions')
		.$type<string[]>()
		.notNull()
		.default([]),
	currentMedications: jsonb('current_medications')
		.$type<string[]>()
		.notNull()
		.default([]),
	doctorId: text('doctor_id').references(() => users.id), // Reference to assigned doctor in staff table
	healthHistory: text('health_history'), // e.g., "I have allergies to pollen, dust, and pet fur..."

	enrollmentDate: timestamp('enrollment_date', { mode: 'date' }).notNull(),
	isActive: boolean('is_active').notNull().default(true),
	profileUrl: text('profile_url'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
});

// Emergency contacts
export const emergencyContacts = pgTable('emergency_contacts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	studentId: text('student_id')
		.references(() => students.id, { onDelete: 'cascade' })
		.notNull(),
	name: text('name').notNull(),
	relationship: text('relationship').$type<Relationship>().notNull(),
	phoneNumber: text('phone_number').notNull(),
	alternatePhone: text('alternate_phone'),
	email: text('email'),
	address: text('address'),
	isPrimary: boolean('is_primary').notNull().default(false),
	priority: integer('priority').notNull().default(1), // 1 = highest priority
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
});

// Clinic visits
// Clinic visits with proper auto-increment
export const clinicVisits = pgTable('clinic_visits', {
	visitNumber: serial('visit_number').primaryKey(), // Auto-incrementing visit number
	id: text('id')
		.notNull()
		.unique()
		.$defaultFn(() => crypto.randomUUID()),
	studentId: text('student_id')
		.references(() => students.id, { onDelete: 'cascade' })
		.notNull(),
	attendedById: text('attended_by_id')
		.references(() => users.id)
		.notNull(),
	visitType: text('visit_type').$type<VisitType>().notNull(),
	status: text('status').$type<VisitStatus>().notNull().default('active'),
	severity: text('severity').$type<Severity>().notNull().default('low'),
	checkInTime: timestamp('check_in_time', { mode: 'date' }).notNull().defaultNow(),
	checkOutTime: timestamp('check_out_time', { mode: 'date' }),
	chiefComplaint: text('chief_complaint').notNull(), // Main reason for visit
	symptoms: text('symptoms'),
	vitalSigns: jsonb('vital_signs').$type<VitalSigns>(), // Store as JSON: temperature, blood pressure, pulse, etc.
	diagnosis: text('diagnosis'),
	treatment: text('treatment'),
	medicationGiven: text('medication_given'),
	instructions: text('instructions'),
	followUpRequired: boolean('follow_up_required').notNull().default(false),
	followUpDate: timestamp('follow_up_date', { mode: 'date' }),
	notes: text('notes'),
	isEmergency: boolean('is_emergency').notNull().default(false),
	parentNotified: boolean('parent_notified').notNull().default(false),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
});

// Visit attachments (photos, documents, etc.)
export const visitAttachments = pgTable('visit_attachments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	visitId: text('visit_id')
		.references(() => clinicVisits.id, { onDelete: 'cascade' })
		.notNull(),
	fileName: text('file_name').notNull(),
	fileUrl: text('file_url').notNull(),
	fileType: text('file_type').notNull(), // image/jpeg, application/pdf, etc.
	fileSize: integer('file_size'), // in bytes
	description: text('description'),
	uploadedById: text('uploaded_by_id')
		.references(() => users.id)
		.notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow()
});

// Notifications (SMS/Email logs)
export const notifications = pgTable('notifications', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	visitId: text('visit_id').references(() => clinicVisits.id, { onDelete: 'cascade' }),
	recipientType: text('recipient_type').notNull(), // 'student', 'parent', 'emergency_contact'
	recipientId: text('recipient_id'), // Could reference different tables based on type
	recipientName: text('recipient_name').notNull(),
	recipientContact: text('recipient_contact').notNull(), // phone or email
	notificationType: text('notification_type').notNull(), // 'sms', 'email'
	subject: text('subject'),
	message: text('message').notNull(),
	status: text('status').$type<NotificationStatus>().notNull().default('pending'),
	sentAt: timestamp('sent_at', { mode: 'date' }),
	errorMessage: text('error_message'),
	retryCount: integer('retry_count').notNull().default(0),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow()
});

// QR code scan logs for security and tracking
export const qrCodeLogs = pgTable('qr_code_logs', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	qrCodeId: text('qr_code_id').notNull(),
	studentId: text('student_id').references(() => students.id),
	scannedAt: timestamp('scanned_at', { mode: 'date' }).notNull().defaultNow(),
	scanLocation: text('scan_location'), // e.g., "Clinic Entrance"
	wasSuccessful: boolean('was_successful').notNull().default(true),
	errorMessage: text('error_message')
});

// System settings
export const systemSettings = pgTable('system_settings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	settingKey: text('setting_key').notNull().unique(),
	settingValue: text('setting_value'),
	description: text('description'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
});

// Audit logs for security and compliance
export const auditLogs = pgTable('audit_logs', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => users.id),
	action: text('action').notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
	tableName: text('table_name'),
	recordId: text('record_id'),
	oldValues: jsonb('old_values'),
	newValues: jsonb('new_values'),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow()
});

// Define relationships
export const studentsRelations = relations(students, ({ one, many }) => ({
	doctor: one(users, {
		fields: [students.doctorId],
		references: [users.id]
	}),
	emergencyContacts: many(emergencyContacts),
	clinicVisits: many(clinicVisits),
	qrCodeLogs: many(qrCodeLogs)
}));

export const staffRelations = relations(users, ({ many }) => ({
	assignedStudents: many(students), // Students assigned to this doctor
	clinicVisits: many(clinicVisits),
	visitAttachments: many(visitAttachments),
	auditLogs: many(auditLogs)
}));

export const clinicVisitsRelations = relations(clinicVisits, ({ one, many }) => ({
	student: one(students, {
		fields: [clinicVisits.studentId],
		references: [students.id]
	}),
	attendedBy: one(users, {
		fields: [clinicVisits.attendedById],
		references: [users.id]
	}),
	attachments: many(visitAttachments),
	notifications: many(notifications)
}));

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
	student: one(students, {
		fields: [emergencyContacts.studentId],
		references: [students.id]
	})
}));

export const visitAttachmentsRelations = relations(visitAttachments, ({ one }) => ({
	visit: one(clinicVisits, {
		fields: [visitAttachments.visitId],
		references: [clinicVisits.id]
	}),
	uploadedBy: one(users, {
		fields: [visitAttachments.uploadedById],
		references: [users.id]
	})
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	visit: one(clinicVisits, {
		fields: [notifications.visitId],
		references: [clinicVisits.id]
	})
}));

export const qrCodeLogsRelations = relations(qrCodeLogs, ({ one }) => ({
	student: one(students, {
		fields: [qrCodeLogs.studentId],
		references: [students.id]
	})
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	})
}));

export type Session = typeof session.$inferSelect;
export type Staff = typeof users.$inferSelect;
