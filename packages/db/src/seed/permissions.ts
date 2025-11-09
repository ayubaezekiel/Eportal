export const defaultPermissions = [
  // Dashboard
  { action: "view", resource: "dashboard", description: "View dashboard" },
  
  // Users
  { action: "view", resource: "users", description: "View users" },
  { action: "create", resource: "users", description: "Create users" },
  { action: "update", resource: "users", description: "Update users" },
  { action: "delete", resource: "users", description: "Delete users" },
  
  // Results
  { action: "view", resource: "results", description: "View results" },
  { action: "create", resource: "results", description: "Upload results" },
  { action: "update", resource: "results", description: "Update results" },
  { action: "approve", resource: "results", description: "Approve results" },
  { action: "delete", resource: "results", description: "Delete results" },
  
  // Courses
  { action: "view", resource: "courses", description: "View courses" },
  { action: "create", resource: "courses", description: "Create courses" },
  { action: "update", resource: "courses", description: "Update courses" },
  { action: "delete", resource: "courses", description: "Delete courses" },
  
  // Attendance
  { action: "view", resource: "attendance", description: "View attendance" },
  { action: "create", resource: "attendance", description: "Mark attendance" },
  { action: "update", resource: "attendance", description: "Update attendance" },
  
  // Payments
  { action: "view", resource: "payments", description: "View payments" },
  { action: "create", resource: "payments", description: "Process payments" },
  { action: "update", resource: "payments", description: "Update payments" },
  
  // Transcripts & Certificates
  { action: "view", resource: "transcripts", description: "View transcripts" },
  { action: "create", resource: "transcripts", description: "Create transcripts" },
  { action: "update", resource: "transcripts", description: "Update transcripts" },
  { action: "process", resource: "transcripts", description: "Process transcripts" },
  
  // Roles & Permissions
  { action: "view", resource: "roles", description: "View roles" },
  { action: "create", resource: "roles", description: "Create roles" },
  { action: "update", resource: "roles", description: "Update roles" },
  { action: "delete", resource: "roles", description: "Delete roles" },
  { action: "view", resource: "permissions", description: "View permissions" },
  
  // Reports
  { action: "view", resource: "reports", description: "View reports" },
  { action: "generate", resource: "reports", description: "Generate reports" },
  
  // Settings
  { action: "view", resource: "settings", description: "View settings" },
  { action: "update", resource: "settings", description: "Update settings" },
];

export const defaultRoles = [
  {
    name: "admin",
    description: "System administrator with full access",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:users", "create:users", "update:users", "delete:users",
      "view:results", "create:results", "update:results", "approve:results", "delete:results",
      "view:courses", "create:courses", "update:courses", "delete:courses",
      "view:attendance", "create:attendance", "update:attendance",
      "view:payments", "create:payments", "update:payments",
      "view:transcripts", "create:transcripts", "update:transcripts", "process:transcripts",
      "view:roles", "create:roles", "update:roles", "delete:roles", "view:permissions",
      "view:reports", "generate:reports", "view:settings", "update:settings"
    ],
  },
  {
    name: "registrar",
    description: "University Registrar",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:users", "create:users", "update:users",
      "view:results", "view:courses", "create:courses", "update:courses",
      "view:transcripts", "create:transcripts", "update:transcripts", "process:transcripts",
      "view:reports", "generate:reports"
    ],
  },
  {
    name: "bursar",
    description: "University Bursar",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:users",
      "view:payments", "create:payments", "update:payments",
      "view:reports", "generate:reports"
    ],
  },
  {
    name: "dean",
    description: "Faculty Dean",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:users", "update:users",
      "view:results", "approve:results", "view:courses", "create:courses", "update:courses",
      "view:attendance", "view:reports", "generate:reports", "view:settings"
    ],
  },
  {
    name: "hod",
    description: "Head of Department",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:users", "update:users",
      "view:results", "approve:results", "view:courses", "create:courses", "update:courses",
      "view:attendance", "view:reports", "generate:reports"
    ],
  },
  {
    name: "lecturer",
    description: "Course lecturer",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:results", "create:results", "update:results",
      "view:courses", "view:attendance", "create:attendance", "update:attendance"
    ],
  },
  {
    name: "student",
    description: "Student user",
    isSystemRole: true,
    permissions: [
      "view:dashboard", "view:results", "view:courses", "view:payments"
    ],
  },
];
