import { useUser } from "@/hooks/auth";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface PermissionGuardProps {
  action: string;
  resource: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  action,
  resource,
  children,
  fallback = <div>Access Denied</div>,
}: PermissionGuardProps) {
  const { data: session } = useUser();

  const { data: userRoles = [] } = useQuery({
    ...orpc.users.getRoles.queryOptions({
      input: { userId: session?.data?.user?.id || "" },
    }),
    enabled: !!session?.data?.user?.id,
  });

  if (!session?.data?.user) {
    return <>{fallback}</>;
  }

  // Check if user has admin role (admin has all permissions)
  const hasAdminRole = userRoles.some(
    (userRole: any) => userRole.role.name === "admin"
  );
  if (hasAdminRole) {
    return <>{children}</>;
  }

  // Action-based permission check
  const hasPermission = userRoles.some((userRole: any) => {
    const roleName = userRole.role.name;

    // Registrar permissions
    if (roleName === "registrar") {
      if (resource === "users" && ["view", "create", "update"].includes(action))
        return true;
      if (
        resource === "transcripts" &&
        ["view", "create", "update", "process"].includes(action)
      )
        return true;
      if (resource === "courses" && ["view"].includes(action)) return true;
    }

    // Bursar permissions
    if (roleName === "bursar") {
      if (
        resource === "payments" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
      if (resource === "users" && ["view"].includes(action)) return true;
    }

    // Dean permissions
    if (roleName === "dean") {
      if (resource === "users" && ["view", "update"].includes(action))
        return true;
      if (resource === "results" && ["view", "approve"].includes(action))
        return true;
      if (
        resource === "courses" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
    }

    // HOD permissions
    if (roleName === "hod") {
      if (resource === "users" && ["view", "update"].includes(action))
        return true;
      if (resource === "results" && ["view", "approve"].includes(action))
        return true;
      if (
        resource === "courses" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
    }

    // Lecturer permissions
    if (roleName === "lecturer") {
      if (
        resource === "results" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
      if (resource === "courses" && ["view"].includes(action)) return true;
      if (
        resource === "attendance" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
    }

    // Student permissions
    if (roleName === "student") {
      if (resource === "results" && ["view"].includes(action)) return true;
      if (resource === "courses" && ["view"].includes(action)) return true;
      if (resource === "payments" && ["view"].includes(action)) return true;
    }

    return false;
  });

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Hook for checking permissions
export function usePermission(action: string, resource: string) {
  const { data: session } = useUser();

  const { data: userRoles = [] } = useQuery({
    ...orpc.users.getRoles.queryOptions({
      input: { userId: session?.data?.user?.id || "" },
    }),
    enabled: !!session?.data?.user?.id,
  });

  if (!session?.data?.user) return false;

  // Check if user has admin role
  const hasAdminRole = userRoles.some(
    (userRole: any) => userRole.role.name === "admin"
  );
  if (hasAdminRole) return true;

  // Action-based permission check
  return userRoles.some((userRole: any) => {
    const roleName = userRole.role.name;

    // Registrar permissions
    if (roleName === "registrar") {
      if (resource === "users" && ["view", "create", "update"].includes(action))
        return true;
      if (
        resource === "transcripts" &&
        ["view", "create", "update", "process"].includes(action)
      )
        return true;
      if (resource === "courses" && ["view"].includes(action)) return true;
    }

    // Bursar permissions
    if (roleName === "bursar") {
      if (
        resource === "payments" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
      if (resource === "users" && ["view"].includes(action)) return true;
    }

    // Dean permissions
    if (roleName === "dean") {
      if (resource === "users" && ["view", "update"].includes(action))
        return true;
      if (resource === "results" && ["view", "approve"].includes(action))
        return true;
      if (
        resource === "courses" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
    }

    // HOD permissions
    if (roleName === "hod") {
      if (resource === "users" && ["view", "update"].includes(action))
        return true;
      if (resource === "results" && ["view", "approve"].includes(action))
        return true;
      if (
        resource === "courses" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
    }

    // Lecturer permissions
    if (roleName === "lecturer") {
      if (
        resource === "results" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
      if (resource === "courses" && ["view"].includes(action)) return true;
      if (
        resource === "attendance" &&
        ["view", "create", "update"].includes(action)
      )
        return true;
    }

    // Student permissions
    if (roleName === "student") {
      if (resource === "results" && ["view"].includes(action)) return true;
      if (resource === "courses" && ["view"].includes(action)) return true;
      if (resource === "payments" && ["view"].includes(action)) return true;
    }

    return false;
  });
}
