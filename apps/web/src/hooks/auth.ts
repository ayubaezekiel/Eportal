import { authClient } from "@/lib/auth-client";
import {
  rolePermissions,
  type Permission,
  type UserRole,
} from "@/lib/rbac";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useUser = () => {
  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const session = await authClient.getSession();
      return session;
    },
  });

  const permissions = useMemo(() => {
    const user = query.data?.user;
    if (user && user.userType) {
      return rolePermissions[user.userType as UserRole] || new Set();
    }
    return new Set<Permission>();
  }, [query.data?.user]);

  const hasPermission = (permission: Permission) => {
    return permissions.has(permission);
  };

  return { ...query, permissions, hasPermission };
};
