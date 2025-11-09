import { db } from "../index";
import { roles, permissions, rolePermissions, userRoles, user } from "../schema/school";
import { defaultPermissions, defaultRoles } from "./permissions";
import { eq, and } from "drizzle-orm";

export async function seedRBAC() {
  console.log("🌱 Seeding RBAC data...");

  try {
    // Insert permissions
    console.log("📝 Inserting permissions...");
    const insertedPermissions = [];
    
    for (const permission of defaultPermissions) {
      const [existing] = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.action, permission.action),
            eq(permissions.resource, permission.resource)
          )
        );

      if (!existing) {
        const [inserted] = await db
          .insert(permissions)
          .values(permission)
          .returning();
        insertedPermissions.push(inserted);
      } else {
        insertedPermissions.push(existing);
      }
    }

    console.log(`✅ Inserted ${insertedPermissions.length} permissions`);

    // Insert roles
    console.log("👥 Inserting roles...");
    const insertedRoles = [];

    for (const roleData of defaultRoles) {
      const { permissions: rolePermissionsList, ...roleInfo } = roleData;
      
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleInfo.name));

      let role;
      if (!existingRole) {
        [role] = await db.insert(roles).values(roleInfo).returning();
      } else {
        role = existingRole;
      }

      insertedRoles.push(role);

      // Clear existing role permissions
      await db
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id));

      // Insert role permissions
      for (const permissionString of rolePermissionsList) {
        const [action, resource] = permissionString.split(":");
        
        const permission = insertedPermissions.find(
          (p) => p.action === action && p.resource === resource
        );

        if (permission) {
          await db.insert(rolePermissions).values({
            roleId: role.id,
            permissionId: permission.id,
          });
        }
      }
    }

    console.log(`✅ Inserted ${insertedRoles.length} roles with permissions`);

    // Assign default roles to existing users based on userType
    console.log("🔗 Assigning roles to existing users...");
    
    const users = await db.select().from(user);
    
    for (const currentUser of users) {
      const role = insertedRoles.find((r) => r.name === currentUser.userType);
      
      if (role) {
        // Check if user already has this role
        const [existingUserRole] = await db
          .select()
          .from(userRoles)
          .where(
            and(
              eq(userRoles.userId, currentUser.id),
              eq(userRoles.roleId, role.id)
            )
          );

        if (!existingUserRole) {
          await db.insert(userRoles).values({
            userId: currentUser.id,
            roleId: role.id,
          });
        }
      }
    }

    console.log("✅ RBAC seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding RBAC data:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedRBAC()
    .then(() => {
      console.log("🎉 RBAC seeding finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 RBAC seeding failed:", error);
      process.exit(1);
    });
}
