import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";
import { db } from "@Eportal/db";
import { and, eq } from "drizzle-orm";
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from "@Eportal/db/schema/school";

export const o = os.$context<Context>();

export const publicProcedure = o;

export async function hasPermission(
  userId: string,
  action: string,
  resource: string
): Promise<boolean> {
  // Check if user has admin role (admin has all permissions)
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
    .innerJoin(
      rolePermissions,
      eq(rolePermissions.permissionId, permissions.id)
    )
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

export async function getUserRoles(userId: string) {
  return await db
    .select({ role: roles })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
}

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", "Authentication required");
  }

  const userId = context.session.user.id;
  const userRolesList = await getUserRoles(userId);
  
  return next({
    context: {
      userId,
      userRoles: userRolesList,
      hasPermission: (action: string, resource: string) =>
        hasPermission(userId, action, resource),
      session: context.session,
    },
  });
});

// Permission-based middleware
export const requirePermission = (action: string, resource: string) =>
  requireAuth.middleware(async ({ context, next }) => {
    const hasAccess = await context.hasPermission(action, resource);
    if (!hasAccess) {
      throw new ORPCError(
        "FORBIDDEN", 
        `Insufficient permissions: ${action}:${resource}`
      );
    }
    return next({ context });
  });

export const protectedProcedure = publicProcedure.use(requireAuth);
