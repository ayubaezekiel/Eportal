import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================
// USERS & AUTHENTICATION
// ============================================

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  // User Type & Status
  userType: varchar("user_type", { length: 50 }).notNull(), // 'student', 'lecturer', 'admin', 'hod', 'dean', 'registrar', 'bursar'
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'suspended', 'graduated', 'withdrawn', 'deferred'

  // Personal Information
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull(), // 'male', 'female'
  dateOfBirth: text("date_of_birth").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  alternatePhone: varchar("alternate_phone", { length: 20 }),

  // Address Information
  stateOfOrigin: varchar("state_of_origin", { length: 100 }).notNull(),
  lgaOfOrigin: varchar("lga_of_origin", { length: 100 }).notNull(),
  nationality: varchar("nationality", { length: 100 })
    .notNull()
    .default("Nigeria"),
  permanentAddress: text("permanent_address").notNull(),
  contactAddress: text("contact_address").notNull(),

  // Emergency Contact
  nextOfKinName: varchar("next_of_kin_name", { length: 200 }),
  nextOfKinRelationship: varchar("next_of_kin_relationship", { length: 100 }),
  nextOfKinPhone: varchar("next_of_kin_phone", { length: 20 }),
  nextOfKinAddress: text("next_of_kin_address"),

  // Student Specific Fields
  matricNumber: varchar("matric_number", { length: 50 }).unique(),
  jambRegNumber: varchar("jamb_reg_number", { length: 50 }),
  modeOfEntry: varchar("mode_of_entry", { length: 50 }), // 'UTME', 'Direct Entry', 'Transfer'
  admissionYear: integer("admission_year"),
  currentLevel: integer("current_level"), // 100, 200, 300, 400, 500
  currentSemester: varchar("current_semester", { length: 20 }), // 'First', 'Second'
  studyMode: varchar("study_mode", { length: 50 }), // 'Full Time', 'Part Time', 'Sandwich'

  // Academic Information
  facultyId: uuid("faculty_id"),
  departmentId: uuid("department_id"),
  programmeId: uuid("programme_id"),
  cgpa: decimal("cgpa", { precision: 3, scale: 2 }),
  totalCreditsEarned: integer("total_credits_earned").default(0),

  // Staff Specific Fields
  staffId: varchar("staff_id", { length: 50 }).unique(),
  designation: varchar("designation", { length: 100 }), // 'Professor', 'Associate Professor', 'Senior Lecturer', etc.
  employmentDate: text("employment_date"),
  employmentType: varchar("employment_type", { length: 50 }), // 'Full Time', 'Part Time', 'Contract', 'Adjunct'
  officeLocation: varchar("office_location", { length: 200 }),
  isAdmin: boolean("is_admin").default(false),

  // Academic Status
  isOnProbation: boolean("is_on_probation").default(false),
  probationReason: text("probation_reason"),
  isDeferred: boolean("is_deferred").default(false),
  defermentStartDate: text("deferment_start_date"),
  defermentEndDate: text("deferment_end_date"),

  // Verification & Security
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLogin: timestamp("last_login"),
  loginAttempts: integer("login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),

  name: text("name").notNull(),
  image: text("image"),
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ============================================
// ACADEMIC STRUCTURE
// ============================================

export const faculties = pgTable("faculties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  deanId: uuid("dean_id"),
  establishedYear: integer("established_year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  facultyId: uuid("faculty_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  hodId: uuid("hod_id"),
  establishedYear: integer("established_year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const programmes = pgTable("programmes", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentId: uuid("department_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  degreeType: varchar("degree_type", { length: 50 }).notNull(), // 'B.Sc', 'B.Agric', 'M.Sc', 'PhD'
  durationYears: integer("duration_years").notNull(),
  minimumCredits: integer("minimum_credits").notNull(),
  description: text("description"),
  coordinatorId: uuid("coordinator_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COURSES & CURRICULUM
// ============================================

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseCode: varchar("course_code", { length: 20 }).notNull().unique(),
  courseTitle: varchar("course_title", { length: 255 }).notNull(),
  creditUnits: integer("credit_units").notNull(),
  courseType: varchar("course_type", { length: 50 }).notNull(), // 'Core', 'Elective', 'General Studies', 'Practical'
  level: integer("level").notNull(), // 100, 200, 300, 400, 500
  semester: varchar("semester", { length: 20 }).notNull(), // 'First', 'Second', 'Both'
  departmentId: uuid("department_id").notNull(),
  description: text("description"),
  prerequisiteCourses: jsonb("prerequisite_courses").default([]), // [courseId1, courseId2]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseAllocation = pgTable("course_allocation", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull(),
  lecturerId: uuid("lecturer_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Lecturer"), // 'Lecturer', 'Co-Lecturer', 'Lab Assistant'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// COURSE REGISTRATION
// ============================================

export const courseRegistrations = pgTable("course_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  courseId: uuid("course_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  registrationType: varchar("registration_type", { length: 50 }).default(
    "Normal"
  ), // 'Normal', 'Carry Over', 'Spillover'
  registrationDate: timestamp("registration_date").defaultNow(),

  // Approval Chain
  adviserApproved: boolean("adviser_approved").default(false),
  adviserApprovedBy: uuid("adviser_approved_by"),
  adviserApprovedAt: timestamp("adviser_approved_at"),
  hodApproved: boolean("hod_approved").default(false),
  hodApprovedBy: uuid("hod_approved_by"),
  hodApprovedAt: timestamp("hod_approved_at"),

  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Approved', 'Rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// RESULTS & GRADING
// ============================================

export const results = pgTable("results", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  courseId: uuid("course_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),

  // Continuous Assessment
  attendance: decimal("attendance", { precision: 5, scale: 2 }), // 10%
  assignment: decimal("assignment", { precision: 5, scale: 2 }), // 10%
  test1: decimal("test1", { precision: 5, scale: 2 }), // 10%
  test2: decimal("test2", { precision: 5, scale: 2 }), // 10%
  practical: decimal("practical", { precision: 5, scale: 2 }), // 10%
  caTotal: decimal("ca_total", { precision: 5, scale: 2 }), // Total CA (30-40%)

  // Examination
  examScore: decimal("exam_score", { precision: 5, scale: 2 }), // 60-70%
  totalScore: decimal("total_score", { precision: 5, scale: 2 }),
  grade: varchar("grade", { length: 5 }), // A, B, C, D, E, F
  gradePoint: decimal("grade_point", { precision: 3, scale: 2 }), // 5.00, 4.00, etc
  remark: varchar("remark", { length: 50 }), // 'Excellent', 'Very Good', 'Good', 'Fair', 'Pass', 'Fail'

  // Result Processing
  uploadedBy: uuid("uploaded_by"),
  uploadedAt: timestamp("uploaded_at"),
  verifiedBy: uuid("verified_by"),
  verifiedAt: timestamp("verified_at"),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),
  status: varchar("status", { length: 50 }).default("Draft"), // 'Draft', 'Submitted', 'Verified', 'Approved', 'Published'

  // Academic Integrity
  isCarryOver: boolean("is_carry_over").default(false),
  attemptNumber: integer("attempt_number").default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SESSIONS & SEMESTERS
// ============================================

export const academicSessions = pgTable("academic_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionName: varchar("session_name", { length: 50 }).notNull().unique(), // '2023/2024'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false),
  isActive: boolean("is_active").default(true),

  // Important Dates
  firstSemesterStart: date("first_semester_start"),
  firstSemesterEnd: date("first_semester_end"),
  secondSemesterStart: date("second_semester_start"),
  secondSemesterEnd: date("second_semester_end"),

  // Registration Periods
  courseRegStartFirst: date("course_reg_start_first"),
  courseRegEndFirst: date("course_reg_end_first"),
  courseRegStartSecond: date("course_reg_start_second"),
  courseRegEndSecond: date("course_reg_end_second"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// FEES & PAYMENTS
// ============================================

export const feeStructures = pgTable("fee_structures", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  programmeId: uuid("programme_id").notNull(),
  level: integer("level").notNull(),
  studyMode: varchar("study_mode", { length: 50 }).notNull(),

  // Fee Components
  tuitionFee: decimal("tuition_fee", { precision: 10, scale: 2 }).notNull(),
  developmentLevy: decimal("development_levy", { precision: 10, scale: 2 }),
  libraryFee: decimal("library_fee", { precision: 10, scale: 2 }),
  sportsFee: decimal("sports_fee", { precision: 10, scale: 2 }),
  medicalFee: decimal("medical_fee", { precision: 10, scale: 2 }),
  examFee: decimal("exam_fee", { precision: 10, scale: 2 }),
  technologyFee: decimal("technology_fee", { precision: 10, scale: 2 }),
  departmentalDues: decimal("departmental_dues", { precision: 10, scale: 2 }),
  facultyDues: decimal("faculty_dues", { precision: 10, scale: 2 }),
  otherCharges: jsonb("other_charges").default({}), // {SUG: 1000, ID_Card: 500}

  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  sessionId: uuid("session_id").notNull(),

  // Payment Details
  referenceNumber: varchar("reference_number", { length: 100 })
    .notNull()
    .unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: varchar("payment_type", { length: 50 }).notNull(), // 'School Fees', 'Acceptance Fee', 'Late Registration', 'Result Checking'
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // 'Remita', 'Bank Transfer', 'Card', 'Cash'
  paymentChannel: varchar("payment_channel", { length: 100 }),

  // Transaction Info
  transactionReference: varchar("transaction_reference", { length: 255 }),
  rrr: varchar("rrr", { length: 50 }), // Remita Retrieval Reference
  bankName: varchar("bank_name", { length: 100 }),
  tellerNumber: varchar("teller_number", { length: 50 }),

  // Status
  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Confirmed', 'Failed', 'Reversed'
  paymentDate: timestamp("payment_date").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: uuid("confirmed_by"),

  // Receipt
  receiptNumber: varchar("receipt_number", { length: 100 }).unique(),
  receiptUrl: text("receipt_url"),

  description: text("description"),
  metadata: jsonb("metadata").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// ATTENDANCE
// ============================================

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  courseId: uuid("course_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),

  attendanceDate: date("attendance_date").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'Present', 'Absent', 'Late', 'Excused'
  markedBy: uuid("marked_by").notNull(),
  remarks: text("remarks"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// HOSTEL MANAGEMENT
// ============================================

export const hostels = pgTable("hostels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  hostelType: varchar("hostel_type", { length: 50 }).notNull(), // 'Male', 'Female', 'Mixed'
  location: varchar("location", { length: 255 }),
  totalRooms: integer("total_rooms").notNull(),
  totalBeds: integer("total_beds").notNull(),
  availableBeds: integer("available_beds").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hostelRooms = pgTable("hostel_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id").notNull(),
  roomNumber: varchar("room_number", { length: 50 }).notNull(),
  capacity: integer("capacity").notNull(),
  occupiedBeds: integer("occupied_beds").default(0),
  roomType: varchar("room_type", { length: 50 }), // 'Single', 'Double', 'Triple', 'Quad'
  facilities: jsonb("facilities").default([]), // ['Fan', 'Wardrobe', 'Reading Table']
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hostelAllocations = pgTable("hostel_allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  hostelId: uuid("hostel_id").notNull(),
  roomId: uuid("room_id").notNull(),
  sessionId: uuid("session_id").notNull(),

  allocationDate: date("allocation_date").defaultNow(),
  expiryDate: date("expiry_date"),
  bedSpace: varchar("bed_space", { length: 20 }), // 'A', 'B', 'C', 'D'
  status: varchar("status", { length: 50 }).default("Active"), // 'Active', 'Expired', 'Vacated', 'Swapped'

  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// ANNOUNCEMENTS & NOTIFICATIONS
// ============================================

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'Academic', 'Administrative', 'Events', 'Exams', 'General'
  priority: varchar("priority", { length: 50 }).default("Normal"), // 'Low', 'Normal', 'High', 'Urgent'

  // Target Audience
  targetAudience: jsonb("target_audience").default([]), // ['students', 'lecturers', 'all']
  targetFaculties: jsonb("target_faculties").default([]),
  targetDepartments: jsonb("target_departments").default([]),
  targetLevels: jsonb("target_levels").default([]),

  // Attachments
  attachments: jsonb("attachments").default([]),

  // Visibility
  publishDate: timestamp("publish_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  isPinned: boolean("is_pinned").default(false),
  isActive: boolean("is_active").default(true),

  publishedBy: uuid("published_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'info', 'success', 'warning', 'error'
  category: varchar("category", { length: 50 }), // 'payment', 'result', 'registration', 'announcement'

  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),

  actionUrl: text("action_url"),
  metadata: jsonb("metadata").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CLEARANCE
// ============================================

export const clearances = pgTable("clearances", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  clearanceType: varchar("clearance_type", { length: 50 }).notNull(), // 'Course Registration', 'Exams', 'Graduation'

  // Clearance Units
  bursaryCleared: boolean("bursary_cleared").default(false),
  bursaryClearedBy: uuid("bursary_cleared_by"),
  bursaryClearedAt: timestamp("bursary_cleared_at"),
  bursaryRemarks: text("bursary_remarks"),

  libraryCleared: boolean("library_cleared").default(false),
  libraryClearedBy: uuid("library_cleared_by"),
  libraryClearedAt: timestamp("library_cleared_at"),
  libraryRemarks: text("library_remarks"),

  hostelCleared: boolean("hostel_cleared").default(false),
  hostelClearedBy: uuid("hostel_cleared_by"),
  hostelClearedAt: timestamp("hostel_cleared_at"),
  hostelRemarks: text("hostel_remarks"),

  departmentCleared: boolean("department_cleared").default(false),
  departmentClearedBy: uuid("department_cleared_by"),
  departmentClearedAt: timestamp("department_cleared_at"),
  departmentRemarks: text("department_remarks"),

  facultyCleared: boolean("faculty_cleared").default(false),
  facultyClearedBy: uuid("faculty_cleared_by"),
  facultyClearedAt: timestamp("faculty_cleared_at"),
  facultyRemarks: text("faculty_remarks"),

  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Completed', 'Partial'
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// DOCUMENTS & UPLOADS
// ============================================

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(), // 'O Level Result', 'Birth Certificate', 'Passport', 'Transcript'
  documentName: varchar("document_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),

  // Verification
  isVerified: boolean("is_verified").default(false),
  verifiedBy: uuid("verified_by"),
  verifiedAt: timestamp("verified_at"),
  verificationStatus: varchar("verification_status", { length: 50 }).default(
    "Pending"
  ), // 'Pending', 'Verified', 'Rejected'
  rejectionReason: text("rejection_reason"),

  expiryDate: date("expiry_date"),
  metadata: jsonb("metadata").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// EXAMINATION
// ============================================

export const examinations = pgTable("examinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),

  examDate: date("exam_date").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  duration: integer("duration").notNull(), // in minutes

  venue: varchar("venue", { length: 200 }).notNull(),
  examType: varchar("exam_type", { length: 50 }).notNull(), // 'First CA Test', 'Second CA Test', 'Final Exam'
  maxScore: decimal("max_score", { precision: 5, scale: 2 }).notNull(),

  instructions: text("instructions"),
  invigilators: jsonb("invigilators").default([]), // [userId1, userId2]

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const examCards = pgTable("exam_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  sessionId: uuid("session_id").notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),

  cardNumber: varchar("card_number", { length: 50 }).notNull().unique(),
  issuedDate: date("issued_date").defaultNow(),
  expiryDate: date("expiry_date").notNull(),

  status: varchar("status", { length: 50 }).default("Active"), // 'Active', 'Expired', 'Revoked'
  issuedBy: uuid("issued_by").notNull(),

  qrCode: text("qr_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// TRANSCRIPT & CERTIFICATES
// ============================================

export const transcripts = pgTable("transcripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  transcriptNumber: varchar("transcript_number", { length: 100 })
    .notNull()
    .unique(),

  requestDate: date("request_date").defaultNow(),
  purpose: text("purpose"),
  destinationAddress: text("destination_address"),

  // Processing Status
  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Processing', 'Ready', 'Dispatched', 'Collected'
  processedBy: uuid("processed_by"),
  processedAt: timestamp("processed_at"),

  // Verification
  verifiedBy: uuid("verified_by"),
  verifiedAt: timestamp("verified_at"),

  // Collection
  collectedBy: varchar("collected_by", { length: 255 }),
  collectionDate: date("collection_date"),
  collectorIdType: varchar("collector_id_type", { length: 50 }),
  collectorIdNumber: varchar("collector_id_number", { length: 100 }),

  // Fees
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }),
  feePaid: boolean("fee_paid").default(false),
  paymentId: uuid("payment_id"),

  remarks: text("remarks"),
  fileUrl: text("file_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  certificateType: varchar("certificate_type", { length: 100 }).notNull(), // 'Degree Certificate', 'Provisional Certificate', 'Statement of Result'
  certificateNumber: varchar("certificate_number", { length: 100 })
    .notNull()
    .unique(),

  programmeId: uuid("programme_id").notNull(),
  degreeClass: varchar("degree_class", { length: 50 }), // 'First Class', 'Second Class Upper', 'Second Class Lower', 'Third Class', 'Pass'
  cgpa: decimal("cgpa", { precision: 3, scale: 2 }).notNull(),
  graduationDate: date("graduation_date"),

  issuedDate: date("issued_date"),
  issuedBy: uuid("issued_by"),

  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Issued', 'Revoked'

  // Verification
  verificationCode: varchar("verification_code", { length: 100 }).unique(),
  fileUrl: text("file_url"),

  remarks: text("remarks"),
  metadata: jsonb("metadata").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// PETITIONS & COMPLAINTS
// ============================================

export const petitions = pgTable("petitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  petitionType: varchar("petition_type", { length: 100 }).notNull(), // 'Result Issue', 'Late Registration', 'Grade Appeal', 'General Complaint'
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),

  // Related Entities
  courseId: uuid("course_id"),
  sessionId: uuid("session_id"),

  // Attachments
  attachments: jsonb("attachments").default([]),

  // Processing
  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Under Review', 'Resolved', 'Rejected', 'Escalated'
  priority: varchar("priority", { length: 50 }).default("Normal"), // 'Low', 'Normal', 'High', 'Urgent'

  assignedTo: uuid("assigned_to"),
  assignedAt: timestamp("assigned_at"),

  // Resolution
  resolution: text("resolution"),
  resolvedBy: uuid("resolved_by"),
  resolvedAt: timestamp("resolved_at"),

  remarks: text("remarks"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SENATE & ACADEMIC BOARD
// ============================================

export const senateDecisions = pgTable("senate_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingDate: date("meeting_date").notNull(),
  decisionNumber: varchar("decision_number", { length: 100 })
    .notNull()
    .unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  decisionType: varchar("decision_type", { length: 100 }), // 'Academic Policy', 'Student Matter', 'Programme Approval', 'General'

  // Affected Entities
  affectedStudents: jsonb("affected_students").default([]),
  affectedDepartments: jsonb("affected_departments").default([]),

  status: varchar("status", { length: 50 }).default("Active"), // 'Active', 'Superseded', 'Revoked'
  effectiveDate: date("effective_date"),

  documentUrl: text("document_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SCHOLARSHIPS & AWARDS
// ============================================

export const scholarships = pgTable("scholarships", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sponsor: varchar("sponsor", { length: 255 }),

  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  scholarshipType: varchar("scholarship_type", { length: 100 }), // 'Merit-Based', 'Need-Based', 'Sports', 'Special Recognition'

  // Eligibility Criteria
  minCgpa: decimal("min_cgpa", { precision: 3, scale: 2 }),
  eligibleLevels: jsonb("eligible_levels").default([]),
  eligibleDepartments: jsonb("eligible_departments").default([]),

  // Duration
  sessionId: uuid("session_id").notNull(),
  numberOfSlots: integer("number_of_slots"),
  availableSlots: integer("available_slots"),

  // Dates
  applicationStartDate: date("application_start_date"),
  applicationEndDate: date("application_end_date"),

  status: varchar("status", { length: 50 }).default("Active"), // 'Active', 'Closed', 'Suspended'

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scholarshipApplications = pgTable("scholarship_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  scholarshipId: uuid("scholarship_id").notNull(),
  studentId: uuid("student_id").notNull(),

  applicationDate: date("application_date").defaultNow(),
  statement: text("statement"), // Why they deserve the scholarship
  supportingDocuments: jsonb("supporting_documents").default([]),

  status: varchar("status", { length: 50 }).default("Pending"), // 'Pending', 'Shortlisted', 'Approved', 'Rejected'

  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),

  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// ALUMNI
// ============================================

export const alumni = pgTable("alumni", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),

  graduationYear: integer("graduation_year").notNull(),
  degreeObtained: varchar("degree_obtained", { length: 100 }).notNull(),
  degreeClass: varchar("degree_class", { length: 50 }),
  finalCgpa: decimal("final_cgpa", { precision: 3, scale: 2 }),

  // Current Information
  currentEmployer: varchar("current_employer", { length: 255 }),
  currentPosition: varchar("current_position", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  workEmail: varchar("work_email", { length: 255 }),

  // Contact Preference
  willingToMentor: boolean("willing_to_mentor").default(false),
  interestedInRecruitment: boolean("interested_in_recruitment").default(false),

  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  achievements: text("achievements"),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// AUDIT LOGS
// ============================================

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 100 }).notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  entity: varchar("entity", { length: 100 }).notNull(), // 'user', 'result', 'payment', etc
  entityId: uuid("entity_id"),

  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),

  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),

  metadata: jsonb("metadata").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SETTINGS & CONFIGURATIONS
// ============================================

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  settingType: varchar("setting_type", { length: 50 }).notNull(), // 'string', 'number', 'boolean', 'json'
  description: text("description"),
  category: varchar("category", { length: 50 }), // 'Academic', 'Financial', 'Security', 'General'

  isPublic: boolean("is_public").default(false), // Can students see this setting?

  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -----------------------------------------------
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(), // 'admin', 'hod', 'lecturer', 'student'
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Permissions Table
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: varchar("action", { length: 100 }).notNull(), // 'view', 'create', 'update', 'delete'
  resource: varchar("resource", { length: 100 }).notNull(), // 'users', 'results', 'courses'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Role-Permission Junction
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: { primaryKey: [table.roleId, table.permissionId] },
  })
);

// User-Role Junction
export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: { primaryKey: [table.userId, table.roleId] },
  })
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(user, ({ one, many }) => ({
  faculty: one(faculties, {
    fields: [user.facultyId],
    references: [faculties.id],
  }),
  userRoles: many(userRoles),
  department: one(departments, {
    fields: [user.departmentId],
    references: [departments.id],
  }),
  programme: one(programmes, {
    fields: [user.programmeId],
    references: [programmes.id],
  }),
  courseRegistrations: many(courseRegistrations),
  results: many(results),
  payments: many(payments),
  attendance: many(attendance),
  hostelAllocations: many(hostelAllocations),
  notifications: many(notifications),
  documents: many(documents),
  petitions: many(petitions),
  scholarshipApplications: many(scholarshipApplications),
}));

export const facultiesRelations = relations(faculties, ({ one, many }) => ({
  dean: one(user, {
    fields: [faculties.deanId],
    references: [user.id],
  }),
  departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  faculty: one(faculties, {
    fields: [departments.facultyId],
    references: [faculties.id],
  }),
  hod: one(user, {
    fields: [departments.hodId],
    references: [user.id],
  }),
  programmes: many(programmes),
  courses: many(courses),
}));

export const programmesRelations = relations(programmes, ({ one, many }) => ({
  department: one(departments, {
    fields: [programmes.departmentId],
    references: [departments.id],
  }),
  coordinator: one(user, {
    fields: [programmes.coordinatorId],
    references: [user.id],
  }),
  feeStructures: many(feeStructures),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  department: one(departments, {
    fields: [courses.departmentId],
    references: [departments.id],
  }),
  courseAllocations: many(courseAllocation),
  courseRegistrations: many(courseRegistrations),
  results: many(results),
  attendance: many(attendance),
  examinations: many(examinations),
}));

export const courseAllocationRelations = relations(
  courseAllocation,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseAllocation.courseId],
      references: [courses.id],
    }),
    lecturer: one(user, {
      fields: [courseAllocation.lecturerId],
      references: [user.id],
    }),
    session: one(academicSessions, {
      fields: [courseAllocation.sessionId],
      references: [academicSessions.id],
    }),
  })
);

export const courseRegistrationsRelations = relations(
  courseRegistrations,
  ({ one }) => ({
    student: one(user, {
      fields: [courseRegistrations.studentId],
      references: [user.id],
    }),
    course: one(courses, {
      fields: [courseRegistrations.courseId],
      references: [courses.id],
    }),
    session: one(academicSessions, {
      fields: [courseRegistrations.sessionId],
      references: [academicSessions.id],
    }),
  })
);

export const resultsRelations = relations(results, ({ one }) => ({
  student: one(user, {
    fields: [results.studentId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [results.courseId],
    references: [courses.id],
  }),
  session: one(academicSessions, {
    fields: [results.sessionId],
    references: [academicSessions.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(user, {
    fields: [payments.studentId],
    references: [user.id],
  }),
  session: one(academicSessions, {
    fields: [payments.sessionId],
    references: [academicSessions.id],
  }),
}));

export const feeStructuresRelations = relations(feeStructures, ({ one }) => ({
  session: one(academicSessions, {
    fields: [feeStructures.sessionId],
    references: [academicSessions.id],
  }),
  programme: one(programmes, {
    fields: [feeStructures.programmeId],
    references: [programmes.id],
  }),
}));

export const hostelAllocationsRelations = relations(
  hostelAllocations,
  ({ one }) => ({
    student: one(user, {
      fields: [hostelAllocations.studentId],
      references: [user.id],
    }),
    hostel: one(hostels, {
      fields: [hostelAllocations.hostelId],
      references: [hostels.id],
    }),
    room: one(hostelRooms, {
      fields: [hostelAllocations.roomId],
      references: [hostelRooms.id],
    }),
    session: one(academicSessions, {
      fields: [hostelAllocations.sessionId],
      references: [academicSessions.id],
    }),
  })
);

export const hostelRoomsRelations = relations(hostelRooms, ({ one, many }) => ({
  hostel: one(hostels, {
    fields: [hostelRooms.hostelId],
    references: [hostels.id],
  }),
  allocations: many(hostelAllocations),
}));

export const hostelsRelations = relations(hostels, ({ many }) => ({
  rooms: many(hostelRooms),
  allocations: many(hostelAllocations),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
}));

export const examinationsRelations = relations(examinations, ({ one }) => ({
  course: one(courses, {
    fields: [examinations.courseId],
    references: [courses.id],
  }),
  session: one(academicSessions, {
    fields: [examinations.sessionId],
    references: [academicSessions.id],
  }),
}));

export const examCardsRelations = relations(examCards, ({ one }) => ({
  student: one(user, {
    fields: [examCards.studentId],
    references: [user.id],
  }),
  session: one(academicSessions, {
    fields: [examCards.sessionId],
    references: [academicSessions.id],
  }),
}));

export const transcriptsRelations = relations(transcripts, ({ one }) => ({
  student: one(user, {
    fields: [transcripts.studentId],
    references: [user.id],
  }),
  payment: one(payments, {
    fields: [transcripts.paymentId],
    references: [payments.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  student: one(user, {
    fields: [certificates.studentId],
    references: [user.id],
  }),
  programme: one(programmes, {
    fields: [certificates.programmeId],
    references: [programmes.id],
  }),
}));

export const petitionsRelations = relations(petitions, ({ one }) => ({
  student: one(user, {
    fields: [petitions.studentId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [petitions.courseId],
    references: [courses.id],
  }),
  session: one(academicSessions, {
    fields: [petitions.sessionId],
    references: [academicSessions.id],
  }),
}));

export const scholarshipApplicationsRelations = relations(
  scholarshipApplications,
  ({ one }) => ({
    scholarship: one(scholarships, {
      fields: [scholarshipApplications.scholarshipId],
      references: [scholarships.id],
    }),
    student: one(user, {
      fields: [scholarshipApplications.studentId],
      references: [user.id],
    }),
  })
);

export const scholarshipsRelations = relations(
  scholarships,
  ({ one, many }) => ({
    session: one(academicSessions, {
      fields: [scholarships.sessionId],
      references: [academicSessions.id],
    }),
    applications: many(scholarshipApplications),
  })
);

export const alumniRelations = relations(alumni, ({ one }) => ({
  user: one(user, {
    fields: [alumni.userId],
    references: [user.id],
  }),
}));

export const clearancesRelations = relations(clearances, ({ one }) => ({
  student: one(user, {
    fields: [clearances.studentId],
    references: [user.id],
  }),
  session: one(academicSessions, {
    fields: [clearances.sessionId],
    references: [academicSessions.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(user, {
    fields: [attendance.studentId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [attendance.courseId],
    references: [courses.id],
  }),
  session: one(academicSessions, {
    fields: [attendance.sessionId],
    references: [academicSessions.id],
  }),
}));

// Add to existing relations
export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));
