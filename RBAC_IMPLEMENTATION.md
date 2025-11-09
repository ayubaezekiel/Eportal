# RBAC Implementation Summary

## Overview
This document outlines the Role-Based Access Control (RBAC) implementation for the Eportal system.

## Fixed Issues

### 1. Database Schema Issues
- **Fixed**: Added proper primary key constraints to junction tables (`rolePermissions` and `userRoles`)
- **Fixed**: Improved schema relationships and constraints

### 2. API Router Issues
- **Fixed**: Added consistent permission checking across all routers
- **Fixed**: Implemented proper error handling with `ORPCError`
- **Fixed**: Added admin bypass logic (admins have all permissions)
- **Fixed**: Enhanced middleware with better context passing

### 3. Permissions Seed Issues
- **Fixed**: Comprehensive permission definitions covering all resources
- **Fixed**: Proper role-permission mappings
- **Fixed**: System role definitions with appropriate permissions

### 4. User Permissions Form Issues
- **Fixed**: Corrected API calls to use proper ORPC methods
- **Fixed**: Proper role management instead of direct permission assignment
- **Fixed**: Better form state management

### 5. Route Protection Issues
- **Fixed**: Replaced simple userType checks with permission-based guards
- **Fixed**: Added `PermissionGuard` component for UI-level protection
- **Fixed**: Implemented `usePermission` hook for conditional rendering

## Key Components

### 1. Database Schema
```typescript
// Roles table
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(false),
  // ... timestamps
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  description: text("description"),
  // ... timestamps
});

// Junction tables with proper constraints
export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: { primaryKey: [table.roleId, table.permissionId] },
}));

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: { primaryKey: [table.userId, table.roleId] },
}));
```

### 2. API Middleware
```typescript
export async function hasPermission(
  userId: string,
  action: string,
  resource: string
): Promise<boolean> {
  // Admin bypass
  const adminCheck = await db
    .select()
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.name, "admin")));

  if (adminCheck.length > 0) return true;

  // Check specific permission
  const result = await db
    .select()
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(userRoles, eq(userRoles.roleId, rolePermissions.roleId))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(permissions.action, action),
        eq(permissions.resource, resource)
      )
    );

  return result.length > 0;
}
```

### 3. Frontend Permission Guards
```typescript
// PermissionGuard Component
export function PermissionGuard({ 
  action, 
  resource, 
  children, 
  fallback = <div>Access Denied</div> 
}: PermissionGuardProps) {
  // ... permission checking logic
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// usePermission Hook
export function usePermission(action: string, resource: string) {
  // ... permission checking logic
  return hasPermission;
}
```

### 4. Route Protection
```typescript
// Example route with RBAC
export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});

function UsersPage() {
  const canViewUsers = usePermission("view", "users");
  
  if (!canViewUsers) {
    return <AccessDeniedComponent />;
  }
  
  return (
    <div>
      <PermissionGuard action="create" resource="users">
        <CreateUserButton />
      </PermissionGuard>
      {/* ... rest of component */}
    </div>
  );
}
```

## Default Roles and Permissions

### Roles
1. **Admin**: Full system access
2. **HOD**: Department management, result approval
3. **Lecturer**: Course management, result upload
4. **Student**: View personal data

### Permissions Structure
- **Action**: `view`, `create`, `update`, `delete`, `approve`, `generate`
- **Resource**: `users`, `results`, `courses`, `attendance`, `payments`, `roles`, `permissions`, `reports`, `settings`, `dashboard`

## Usage Examples

### 1. Protecting API Endpoints
```typescript
export const usersRouter = {
  getAll: protectedProcedure
    .meta({ requiredPermission: { action: "view", resource: "users" } })
    .handler(async ({ context }) => {
      const hasAccess = await context.hasPermission("view", "users");
      if (!hasAccess) throw new ORPCError("FORBIDDEN", "Insufficient permissions");
      return await db.select().from(user);
    }),
};
```

### 2. Protecting UI Components
```typescript
<PermissionGuard action="create" resource="users">
  <Button>Add User</Button>
</PermissionGuard>
```

### 3. Conditional Rendering
```typescript
const canEditUsers = usePermission("update", "users");

return (
  <div>
    {canEditUsers && <EditButton />}
  </div>
);
```

## Setup Instructions

### 1. Database Migration
```bash
# Push schema changes
bun run db:push
```

### 2. Seed RBAC Data
```bash
# Run the RBAC seed script
bun run packages/db/src/seed/rbac-seed.ts
```

### 3. Assign Roles to Users
Users are automatically assigned roles based on their `userType`, but you can also manually assign roles through the admin interface.

## Security Considerations

1. **Admin Bypass**: Admins automatically have all permissions
2. **Permission Caching**: Consider implementing permission caching for better performance
3. **Audit Logging**: All permission checks should be logged for security auditing
4. **Role Hierarchy**: Current implementation is flat; consider hierarchical roles if needed

## Future Enhancements

1. **Dynamic Permissions**: Allow creating custom permissions at runtime
2. **Resource-Level Permissions**: Implement object-level permissions (e.g., "edit own results")
3. **Time-Based Permissions**: Add expiration dates to role assignments
4. **Permission Inheritance**: Implement role inheritance for complex hierarchies
5. **API Rate Limiting**: Add rate limiting based on user roles

## Testing

Ensure to test:
1. Permission checks at API level
2. UI component visibility based on permissions
3. Route access control
4. Admin bypass functionality
5. Role assignment and removal

This RBAC implementation provides a solid foundation for access control in the Eportal system while maintaining flexibility for future enhancements.
