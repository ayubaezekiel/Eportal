// apps/web/src/lib/rbac.ts

/**
 * @file This file defines the client-side Role-Based Access Control (RBAC) rules.
 * NOTE: This is NOT a security mechanism. It is for UI/UX purposes only.
 * It can be easily bypassed by a malicious user.
 * True security must always be enforced on the server-side.
 */

// A union type of all possible permissions in the application
export type Permission =
  // User Management
  | "user:create"
  | "user:read"
  | "user:update"
  | "user:delete"
  | "user:impersonate"
  // Role & Permission Management (Read-only on client)
  | "permission:read"
  // Academic Structure
  | "faculty:create"
  | "faculty:read"
  | "faculty:update"
  | "faculty:delete"
  | "department:create"
  | "department:read"
  | "department:update"
  | "department:delete"
  | "programme:create"
  | "programme:read"
  | "programme:update"
  | "programme:delete"
  // Course Management
  | "course:create"
  | "course:read"
  | "course:update"
  | "course:delete"
  | "course:allocate"
  // Result Management
  | "result:create"
  | "result:read"
  | "result:update"
  | "result:approve"
  | "result:publish"
  // Financials
  | "payment:read"
  | "payment:verify"
  | "feestructure:create"
  | "feestructure:read"
  | "feestructure:update"
  // Student-specific
  | "courseregistration:create"
  | "courseregistration:read"
  | "clearance:read"
  // Announcements
  | "announcement:create"
  | "announcement:read"
  | "announcement:update"
  | "announcement:delete"
  // System Settings
  | "settings:update";

// A type representing the user roles from the database `userType` column
export type UserRole =
  | "student"
  | "lecturer"
  | "admin"
  | "hod"
  | "dean"
  | "registrar"
  | "bursar";

// A record mapping each role to its set of permissions
export const rolePermissions: Record<UserRole, Set<Permission>> = {
  // All-powerful role
  admin: new Set([
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "user:impersonate",
    "permission:read",
    "faculty:create",
    "faculty:read",
    "faculty:update",
    "faculty:delete",
    "department:create",
    "department:read",
    "department:update",
    "department:delete",
    "programme:create",
    "programme:read",
    "programme:update",
    "programme:delete",
    "course:create",
    "course:read",
    "course:update",
    "course:delete",
    "course:allocate",
    "result:create",
    "result:read",
    "result:update",
    "result:approve",
    "result:publish",
    "payment:read",
    "payment:verify",
    "feestructure:create",
    "feestructure:read",
    "feestructure:update",
    "announcement:create",
    "announcement:read",
    "announcement:update",
    "announcement:delete",
    "settings:update",
  ]),

  // Student role with basic permissions
  student: new Set([
    "user:read", // Can view their own profile
    "user:update", // Can update their own profile
    "course:read",
    "result:read",
    "payment:read",
    "courseregistration:create",
    "courseregistration:read",
    "clearance:read",
    "announcement:read",
  ]),

  // Lecturer role
  lecturer: new Set([
    "user:read", // Can view profiles
    "course:read",
    "result:create", // Can upload results for their courses
    "result:read",
    "result:update", // Can update results they uploaded
    "announcement:read",
  ]),

  // Head of Department
  hod: new Set([
    ...rolePermissions.lecturer,
    "user:read",
    "course:allocate",
    "result:approve", // Can approve results for their department
    "announcement:create",
    "announcement:update",
  ]),

  // Dean of Faculty
  dean: new Set([
    ...rolePermissions.hod,
    "result:publish", // Can publish faculty-level results
    "announcement:create",
    "announcement:update",
    "announcement:delete",
  ]),

  // Registrar for academic records
  registrar: new Set([
    "user:create",
    "user:read",
    "user:update",
    "faculty:read",
    "department:read",
    "programme:read",
    "result:read",
    "clearance:read",
    "settings:update",
  ]),

  // Bursar for financial management
  bursar: new Set([
    "user:read",
    "payment:read",
    "payment:verify",
    "feestructure:create",
    "feestructure:read",
    "feestructure:update",
    "clearance:read",
  ]),
};

/**
 * Checks if a given role has a specific permission.
 * @param role The user's role.
 * @param permission The permission to check for.
 * @returns True if the role has the permission, false otherwise.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) {
    return false;
  }
  return permissions.has(permission);
}
