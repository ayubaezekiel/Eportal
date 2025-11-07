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

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const userId = context.session.user.id;
  return next({
    context: {
      userId,
      hasPermission: (action: string, resource: string) =>
        hasPermission(userId, action, resource),
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
