import { PrismaClient } from "../../generated/prisma/index.js";

// Lazy-load Prisma client
let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Auto-create tenant for user if it doesn't exist
 * This ensures all users with specific roles become tenants in the system
 */
export const ensureTenantExists = async (user: any) => {
  if (!user || !user.uid) {
    throw new Error('User information required');
  }

  console.log('🏢 ensureTenantExists called for user:', {
    uid: user.uid,
    email: user.email,
    role: user.role,
    name: user.name
  });

  // Only create tenants for specific roles (including customer since they can create events)
  const tenantRoles = ['organizer', 'venue_owner', 'event_admin', 'checkin_officer', 'customer'];
  if (!tenantRoles.includes(user.role)) {
    console.log(`⚠️ User role '${user.role}' does not require tenant creation`);
    return null; // Other roles don't need to be tenants
  }

  try {
    // Check if tenant already exists
    let tenant = await getPrisma().tenant.findUnique({
      where: { firebaseUid: user.uid }
    });

    // Create tenant if it doesn't exist
    if (!tenant) {
      tenant = await getPrisma().tenant.create({
        data: {
          firebaseUid: user.uid,
          name: user.name || user.email || `${user.role} User`
        }
      });
      
      console.log(`✅ Auto-created tenant for ${user.role}: ${user.email} (${user.uid}) - ID: ${tenant.id}`);
    } else {
      console.log(`✅ Found existing tenant for ${user.role}: ${user.email} (${user.uid}) - ID: ${tenant.id}`);
    }

    return tenant;
  } catch (error) {
    console.error('Failed to ensure tenant exists:', error);
    throw error;
  }
};
