import { db } from "..";
import { permissions, rolePermissions, roles } from "../schema/school";

// seed/roles.ts
export const seedRolesAndPermissions = async () => {
  const adminPerms = ["view", "create", "update", "delete"].flatMap((action) =>
    ["users", "results", "courses", "roles", "permissions"].map((resource) => ({
      action,
      resource,
    }))
  );

  const [adminRole] = await db
    .insert(roles)
    .values({ name: "admin", isSystemRole: true })
    .returning();
  const perms = await db.insert(permissions).values(adminPerms).returning();

  await db
    .insert(rolePermissions)
    .values(perms.map((p) => ({ roleId: adminRole.id, permissionId: p.id })));
};
