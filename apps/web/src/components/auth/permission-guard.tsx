// apps/web/src/components/auth/permission-guard.tsx
import { useUser } from "@/hooks/auth";
import type { Permission } from "@/lib/rbac";
import React from "react";

type PermissionGuardProps = {
  /**
   * The permission required to render the children.
   */
  permission: Permission;
  /**
   * The content to render if the user has the required permission.
   */
  children: React.ReactNode;
  /**
   * Optional: A fallback component to render if the user is loading or lacks permission.
   * If not provided, renders nothing.
   */
  fallback?: React.ReactNode;
};

/**
 * A component that conditionally renders its children based on the current user's permissions.
 * This provides a simple way to implement client-side RBAC for UI elements.
 *
 * @example
 * <PermissionGuard permission="user:create">
 *   <Button>Create User</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission, isLoading } = useUser();

  if (isLoading) {
    // You might want to render a skeleton/loader here
    return null;
  }

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};