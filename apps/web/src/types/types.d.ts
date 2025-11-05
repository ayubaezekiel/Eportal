import {
  user,
  session,
  account,
  verification,
  faculties,
  departments,
  programmes,
  courses,
  courseAllocation,
  courseRegistrations,
  results,
  academicSessions,
  feeStructures,
  payments,
  attendance,
  hostels,
  hostelRooms,
  hostelAllocations,
  announcements,
  notifications,
  timetables,
  clearances,
  documents,
  examinations,
  examCards,
  transcripts,
  certificates,
  petitions,
  senateDecisions,
  scholarships,
  scholarshipApplications,
  alumni,
  auditLogs,
  systemSettings,
} from "@Eportal/db/schema/school";

// ============================================P
// USERS & AUTHENTICATION
// ============================================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// ============================================
// ACADEMIC STRUCTURE
// ============================================

export type Faculty = typeof faculties.$inferSelect;
export type NewFaculty = typeof faculties.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Programme = typeof programmes.$inferSelect;
export type NewProgramme = typeof programmes.$inferInsert;

// ============================================
// COURSES & CURRICULUM
// ============================================

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CourseAllocation = typeof courseAllocation.$inferSelect;
export type NewCourseAllocation = typeof courseAllocation.$inferInsert;

// ============================================
// COURSE REGISTRATION
// ============================================

export type CourseRegistration = typeof courseRegistrations.$inferSelect;
export type NewCourseRegistration = typeof courseRegistrations.$inferInsert;

// ============================================
// RESULTS & GRADING
// ============================================

export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;

// ============================================
// SESSIONS & SEMESTERS
// ============================================

export type AcademicSession = typeof academicSessions.$inferSelect;
export type NewAcademicSession = typeof academicSessions.$inferInsert;

// ============================================
// FEES & PAYMENTS
// ============================================

export type FeeStructure = typeof feeStructures.$inferSelect;
export type NewFeeStructure = typeof feeStructures.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// ============================================
// ATTENDANCE
// ============================================

export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;

// ============================================
// HOSTEL MANAGEMENT
// ============================================

export type Hostel = typeof hostels.$inferSelect;
export type NewHostel = typeof hostels.$inferInsert;

export type HostelRoom = typeof hostelRooms.$inferSelect;
export type NewHostelRoom = typeof hostelRooms.$inferInsert;

export type HostelAllocation = typeof hostelAllocations.$inferSelect;
export type NewHostelAllocation = typeof hostelAllocations.$inferInsert;

// ============================================
// ANNOUNCEMENTS & NOTIFICATIONS
// ============================================

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ============================================
// TIMETABLE
// ============================================

export type Timetable = typeof timetables.$inferSelect;
export type NewTimetable = typeof timetables.$inferInsert;

// ============================================
// CLEARANCE
// ============================================

export type Clearance = typeof clearances.$inferSelect;
export type NewClearance = typeof clearances.$inferInsert;

// ============================================
// DOCUMENTS & UPLOADS
// ============================================

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

// ============================================
// EXAMINATION
// ============================================

export type Examination = typeof examinations.$inferSelect;
export type NewExamination = typeof examinations.$inferInsert;

export type ExamCard = typeof examCards.$inferSelect;
export type NewExamCard = typeof examCards.$inferInsert;

// ============================================
// TRANSCRIPT & CERTIFICATES
// ============================================

export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

// ============================================
// PETITIONS & COMPLAINTS
// ============================================

export type Petition = typeof petitions.$inferSelect;
export type NewPetition = typeof petitions.$inferInsert;

// ============================================
// SENATE & ACADEMIC BOARD
// ============================================

export type SenateDecision = typeof senateDecisions.$inferSelect;
export type NewSenateDecision = typeof senateDecisions.$inferInsert;

// ============================================
// SCHOLARSHIPS & AWARDS
// ============================================

export type Scholarship = typeof scholarships.$inferSelect;
export type NewScholarship = typeof scholarships.$inferInsert;

export type ScholarshipApplication =
  typeof scholarshipApplications.$inferSelect;
export type NewScholarshipApplication =
  typeof scholarshipApplications.$inferInsert;

// ============================================
// ALUMNI
// ============================================

export type Alumni = typeof alumni.$inferSelect;
export type NewAlumni = typeof alumni.$inferInsert;

// ============================================
// AUDIT LOGS
// ============================================

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// ============================================
// SETTINGS & CONFIGURATIONS
// ============================================

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
