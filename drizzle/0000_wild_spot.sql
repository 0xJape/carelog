CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"table_name" text,
	"record_id" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_visits" (
	"visit_number" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"student_id" text NOT NULL,
	"attended_by_id" text NOT NULL,
	"visit_type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"severity" text DEFAULT 'low' NOT NULL,
	"check_in_time" timestamp DEFAULT now() NOT NULL,
	"check_out_time" timestamp,
	"chief_complaint" text NOT NULL,
	"symptoms" text,
	"vital_signs" jsonb,
	"diagnosis" text,
	"treatment" text,
	"medication_given" text,
	"instructions" text,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_date" timestamp,
	"notes" text,
	"is_emergency" boolean DEFAULT false NOT NULL,
	"parent_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_visits_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"phone_number" text NOT NULL,
	"alternate_phone" text,
	"email" text,
	"address" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"medicine_id" text NOT NULL,
	"alert_type" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_id" text,
	"transaction_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text,
	"performed_by" text NOT NULL,
	"reference_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_number" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"date_received" timestamp DEFAULT now() NOT NULL,
	"location" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"generic_name" text,
	"description" text,
	"dosage" text,
	"form" text,
	"manufacturer" text,
	"supplier" text,
	"unit_price" text,
	"min_stock_level" integer DEFAULT 10 NOT NULL,
	"max_stock_level" integer DEFAULT 100 NOT NULL,
	"location" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medicines_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text,
	"recipient_type" text NOT NULL,
	"recipient_id" text,
	"recipient_name" text NOT NULL,
	"recipient_contact" text NOT NULL,
	"notification_type" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qr_code_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"qr_code_id" text NOT NULL,
	"student_id" text,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	"scan_location" text,
	"was_successful" boolean DEFAULT true NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "user_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"qr_code_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"middle_name" text,
	"email" text,
	"date_of_birth" timestamp NOT NULL,
	"gender" text NOT NULL,
	"grade" text NOT NULL,
	"section" text,
	"address" text,
	"chronic_health_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_medications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"doctor_id" text,
	"health_history" text,
	"enrollment_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"profile_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id"),
	CONSTRAINT "students_qr_code_id_unique" UNIQUE("qr_code_id"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" text DEFAULT 'nurse' NOT NULL,
	"phone_number" text,
	"profile_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "visit_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"description" text,
	"uploaded_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_visits" ADD CONSTRAINT "clinic_visits_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_visits" ADD CONSTRAINT "clinic_visits_attended_by_id_users_id_fk" FOREIGN KEY ("attended_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_alerts" ADD CONSTRAINT "inventory_alerts_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_alerts" ADD CONSTRAINT "inventory_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_batch_id_medicine_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."medicine_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_batches" ADD CONSTRAINT "medicine_batches_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_visit_id_clinic_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."clinic_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_logs" ADD CONSTRAINT "qr_code_logs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_attachments" ADD CONSTRAINT "visit_attachments_visit_id_clinic_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."clinic_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_attachments" ADD CONSTRAINT "visit_attachments_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_usersession_user_id" ON "user_session" USING btree ("user_id");