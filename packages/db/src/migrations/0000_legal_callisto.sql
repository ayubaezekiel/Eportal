CREATE TABLE "academic_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_name" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_current" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"first_semester_start" date,
	"first_semester_end" date,
	"second_semester_start" date,
	"second_semester_end" date,
	"course_reg_start_first" date,
	"course_reg_end_first" date,
	"course_reg_start_second" date,
	"course_reg_end_second" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academic_sessions_session_name_unique" UNIQUE("session_name")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"graduation_year" integer NOT NULL,
	"degree_obtained" varchar(100) NOT NULL,
	"degree_class" varchar(50),
	"final_cgpa" numeric(3, 2),
	"current_employer" varchar(255),
	"current_position" varchar(255),
	"industry" varchar(100),
	"work_email" varchar(255),
	"willing_to_mentor" boolean DEFAULT false,
	"interested_in_recruitment" boolean DEFAULT false,
	"linkedin_url" varchar(255),
	"achievements" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alumni_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"priority" varchar(50) DEFAULT 'Normal',
	"target_audience" jsonb DEFAULT '[]'::jsonb,
	"target_faculties" jsonb DEFAULT '[]'::jsonb,
	"target_departments" jsonb DEFAULT '[]'::jsonb,
	"target_levels" jsonb DEFAULT '[]'::jsonb,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"publish_date" timestamp DEFAULT now(),
	"expiry_date" timestamp,
	"is_pinned" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"published_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"semester" varchar(20) NOT NULL,
	"attendance_date" date NOT NULL,
	"status" varchar(20) NOT NULL,
	"marked_by" uuid NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity" varchar(100) NOT NULL,
	"entity_id" uuid,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"certificate_type" varchar(100) NOT NULL,
	"certificate_number" varchar(100) NOT NULL,
	"programme_id" uuid NOT NULL,
	"degree_class" varchar(50),
	"cgpa" numeric(3, 2) NOT NULL,
	"graduation_date" date,
	"issued_date" date,
	"issued_by" uuid,
	"status" varchar(50) DEFAULT 'Pending',
	"verification_code" varchar(100),
	"file_url" text,
	"remarks" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number"),
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "clearances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"clearance_type" varchar(50) NOT NULL,
	"bursary_cleared" boolean DEFAULT false,
	"bursary_cleared_by" uuid,
	"bursary_cleared_at" timestamp,
	"bursary_remarks" text,
	"library_cleared" boolean DEFAULT false,
	"library_cleared_by" uuid,
	"library_cleared_at" timestamp,
	"library_remarks" text,
	"hostel_cleared" boolean DEFAULT false,
	"hostel_cleared_by" uuid,
	"hostel_cleared_at" timestamp,
	"hostel_remarks" text,
	"department_cleared" boolean DEFAULT false,
	"department_cleared_by" uuid,
	"department_cleared_at" timestamp,
	"department_remarks" text,
	"faculty_cleared" boolean DEFAULT false,
	"faculty_cleared_by" uuid,
	"faculty_cleared_at" timestamp,
	"faculty_remarks" text,
	"status" varchar(50) DEFAULT 'Pending',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_allocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"lecturer_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"semester" varchar(20) NOT NULL,
	"role" varchar(50) DEFAULT 'Lecturer' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"semester" varchar(20) NOT NULL,
	"registration_type" varchar(50) DEFAULT 'Normal',
	"registration_date" timestamp DEFAULT now(),
	"adviser_approved" boolean DEFAULT false,
	"adviser_approved_by" uuid,
	"adviser_approved_at" timestamp,
	"hod_approved" boolean DEFAULT false,
	"hod_approved_by" uuid,
	"hod_approved_at" timestamp,
	"status" varchar(50) DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_code" varchar(20) NOT NULL,
	"course_title" varchar(255) NOT NULL,
	"credit_units" integer NOT NULL,
	"course_type" varchar(50) NOT NULL,
	"level" integer NOT NULL,
	"semester" varchar(20) NOT NULL,
	"department_id" uuid NOT NULL,
	"description" text,
	"prerequisite_courses" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_course_code_unique" UNIQUE("course_code")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(20) NOT NULL,
	"description" text,
	"hod_id" uuid,
	"established_year" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"is_verified" boolean DEFAULT false,
	"verified_by" uuid,
	"verified_at" timestamp,
	"verification_status" varchar(50) DEFAULT 'Pending',
	"rejection_reason" text,
	"expiry_date" date,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"semester" varchar(20) NOT NULL,
	"card_number" varchar(50) NOT NULL,
	"issued_date" date DEFAULT now(),
	"expiry_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'Active',
	"issued_by" uuid NOT NULL,
	"qr_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exam_cards_card_number_unique" UNIQUE("card_number")
);
--> statement-breakpoint
CREATE TABLE "examinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"semester" varchar(20) NOT NULL,
	"exam_date" date NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"duration" integer NOT NULL,
	"venue" varchar(200) NOT NULL,
	"exam_type" varchar(50) NOT NULL,
	"max_score" numeric(5, 2) NOT NULL,
	"instructions" text,
	"invigilators" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(20) NOT NULL,
	"description" text,
	"dean_id" uuid,
	"established_year" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "faculties_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "fee_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"programme_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"study_mode" varchar(50) NOT NULL,
	"tuition_fee" numeric(10, 2) NOT NULL,
	"development_levy" numeric(10, 2),
	"library_fee" numeric(10, 2),
	"sports_fee" numeric(10, 2),
	"medical_fee" numeric(10, 2),
	"exam_fee" numeric(10, 2),
	"technology_fee" numeric(10, 2),
	"departmental_dues" numeric(10, 2),
	"faculty_dues" numeric(10, 2),
	"other_charges" jsonb DEFAULT '{}'::jsonb,
	"total_amount" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostel_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"hostel_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"allocation_date" date DEFAULT now(),
	"expiry_date" date,
	"bed_space" varchar(20),
	"status" varchar(50) DEFAULT 'Active',
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostel_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hostel_id" uuid NOT NULL,
	"room_number" varchar(50) NOT NULL,
	"capacity" integer NOT NULL,
	"occupied_beds" integer DEFAULT 0,
	"room_type" varchar(50),
	"facilities" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hostels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"hostel_type" varchar(50) NOT NULL,
	"location" varchar(255),
	"total_rooms" integer NOT NULL,
	"total_beds" integer NOT NULL,
	"available_beds" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50),
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"action_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"reference_number" varchar(100) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_type" varchar(50) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_channel" varchar(100),
	"transaction_reference" varchar(255),
	"rrr" varchar(50),
	"bank_name" varchar(100),
	"teller_number" varchar(50),
	"status" varchar(50) DEFAULT 'Pending',
	"payment_date" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	"confirmed_by" uuid,
	"receipt_number" varchar(100),
	"receipt_url" text,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_number_unique" UNIQUE("reference_number"),
	CONSTRAINT "payments_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "petitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"petition_type" varchar(100) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"course_id" uuid,
	"session_id" uuid,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'Pending',
	"priority" varchar(50) DEFAULT 'Normal',
	"assigned_to" uuid,
	"assigned_at" timestamp,
	"resolution" text,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(20) NOT NULL,
	"degree_type" varchar(50) NOT NULL,
	"duration_years" integer NOT NULL,
	"minimum_credits" integer NOT NULL,
	"description" text,
	"coordinator_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "programmes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"semester" varchar(20) NOT NULL,
	"attendance" numeric(5, 2),
	"assignment" numeric(5, 2),
	"test1" numeric(5, 2),
	"test2" numeric(5, 2),
	"practical" numeric(5, 2),
	"ca_total" numeric(5, 2),
	"exam_score" numeric(5, 2),
	"total_score" numeric(5, 2),
	"grade" varchar(5),
	"grade_point" numeric(3, 2),
	"remark" varchar(50),
	"uploaded_by" uuid,
	"uploaded_at" timestamp,
	"verified_by" uuid,
	"verified_at" timestamp,
	"approved_by" uuid,
	"approved_at" timestamp,
	"status" varchar(50) DEFAULT 'Draft',
	"is_carry_over" boolean DEFAULT false,
	"attempt_number" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholarship_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scholarship_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"application_date" date DEFAULT now(),
	"statement" text,
	"supporting_documents" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'Pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_comments" text,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sponsor" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"scholarship_type" varchar(100),
	"min_cgpa" numeric(3, 2),
	"eligible_levels" jsonb DEFAULT '[]'::jsonb,
	"eligible_departments" jsonb DEFAULT '[]'::jsonb,
	"session_id" uuid NOT NULL,
	"number_of_slots" integer,
	"available_slots" integer,
	"application_start_date" date,
	"application_end_date" date,
	"status" varchar(50) DEFAULT 'Active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "senate_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_date" date NOT NULL,
	"decision_number" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"decision_type" varchar(100),
	"affected_students" jsonb DEFAULT '[]'::jsonb,
	"affected_departments" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'Active',
	"effective_date" date,
	"document_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "senate_decisions_decision_number_unique" UNIQUE("decision_number")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar(100) NOT NULL,
	"setting_value" text NOT NULL,
	"setting_type" varchar(50) NOT NULL,
	"description" text,
	"category" varchar(50),
	"is_public" boolean DEFAULT false,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"transcript_number" varchar(100) NOT NULL,
	"request_date" date DEFAULT now(),
	"purpose" text,
	"destination_address" text,
	"status" varchar(50) DEFAULT 'Pending',
	"processed_by" uuid,
	"processed_at" timestamp,
	"verified_by" uuid,
	"verified_at" timestamp,
	"collected_by" varchar(255),
	"collection_date" date,
	"collector_id_type" varchar(50),
	"collector_id_number" varchar(100),
	"fee_amount" numeric(10, 2),
	"fee_paid" boolean DEFAULT false,
	"payment_id" uuid,
	"remarks" text,
	"file_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transcripts_transcript_number_unique" UNIQUE("transcript_number")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"gender" varchar(20) NOT NULL,
	"date_of_birth" text NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"alternate_phone" varchar(20),
	"state_of_origin" varchar(100) NOT NULL,
	"lga_of_origin" varchar(100) NOT NULL,
	"nationality" varchar(100) DEFAULT 'Nigeria' NOT NULL,
	"permanent_address" text NOT NULL,
	"contact_address" text NOT NULL,
	"next_of_kin_name" varchar(200),
	"next_of_kin_relationship" varchar(100),
	"next_of_kin_phone" varchar(20),
	"next_of_kin_address" text,
	"matric_number" varchar(50),
	"jamb_reg_number" varchar(50),
	"mode_of_entry" varchar(50),
	"admission_year" integer,
	"current_level" integer,
	"current_semester" varchar(20),
	"study_mode" varchar(50),
	"faculty_id" uuid,
	"department_id" uuid,
	"programme_id" uuid,
	"cgpa" numeric(3, 2),
	"total_credits_earned" integer DEFAULT 0,
	"staff_id" varchar(50),
	"designation" varchar(100),
	"employment_date" text,
	"employment_type" varchar(50),
	"office_location" varchar(200),
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"is_on_probation" boolean DEFAULT false,
	"probation_reason" text,
	"is_deferred" boolean DEFAULT false,
	"deferment_start_date" text,
	"deferment_end_date" text,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"last_login" timestamp,
	"login_attempts" integer DEFAULT 0,
	"account_locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"name" text NOT NULL,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_matric_number_unique" UNIQUE("matric_number"),
	CONSTRAINT "user_staff_id_unique" UNIQUE("staff_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;