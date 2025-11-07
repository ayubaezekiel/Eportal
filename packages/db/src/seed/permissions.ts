// seed/permissions.ts
export const defaultPermissions = [
  { action: "view", resource: "dashboard", description: "View dashboard" },
  { action: "view", resource: "users", description: "View users" },
  { action: "create", resource: "users", description: "Create users" },
  { action: "update", resource: "users", description: "Update users" },
  { action: "delete", resource: "users", description: "Delete users" },
  { action: "view", resource: "results", description: "View results" },
  { action: "upload", resource: "results", description: "Upload results" },
  { action: "approve", resource: "results", description: "Approve results" },
  // Add more as needed
];

export const defaultRoles = [
  {
    name: "admin",
    isSystemRole: true,
    permissions: ["*"], // all permissions
  },
  {
    name: "hod",
    permissions: [
      "view:users",
      "update:users",
      "view:results",
      "approve:results",
      "view:courses",
    ],
  },
  {
    name: "lecturer",
    permissions: [
      "view:results",
      "upload:results",
      "view:courses",
      "view:attendance",
    ],
  },
  {
    name: "student",
    permissions: ["view:dashboard", "view:results", "view:fees"],
  },
];
