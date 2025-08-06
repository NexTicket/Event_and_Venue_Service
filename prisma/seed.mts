import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // First, ensure we have a tenant
  let tenant = await prisma.tenant.findFirst({
    where: { name: "Sample Organizer" }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Sample Organizer",
        firebaseUid: "sample-firebase-uid-123"
      }
    });
    console.log('✅ Tenant created!');
  }

  // Check if events already exist
  const existingEvent = await prisma.events.findFirst({
    where: { title: "Sample Concert" }
  });

  if (!existingEvent) {
    await prisma.events.createMany({
      data: [
        {
          tenantId: tenant.id,
          title: "Sample Concert",
          description: "A sample concert event for testing",
          category: "MUSIC",
          type: "Concert",
          startDate: new Date("2024-12-31T20:00:00Z"),
          endDate: new Date("2024-12-31T23:00:00Z"),
          created_at: new Date()
        },
        {
          tenantId: tenant.id,
          title: "Tech Conference 2024",
          description: "Annual technology conference",
          category: "CONFERENCE",
          type: "Conference",
          startDate: new Date("2024-11-15T09:00:00Z"),
          endDate: new Date("2024-11-15T17:00:00Z"),
          created_at: new Date()
        },
        {
          tenantId: tenant.id,
          title: "Art Exhibition",
          description: "Modern art exhibition",
          category: "ART",
          type: "Exhibition",
          startDate: new Date("2024-10-20T10:00:00Z"),
          endDate: new Date("2024-10-20T18:00:00Z"),
          created_at: new Date()
        }
      ]
    });

    console.log('✅ Dummy events inserted!');
  } else {
    console.log('⚠️ Dummy data already exists. Skipping insert.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error inserting dummy data:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
