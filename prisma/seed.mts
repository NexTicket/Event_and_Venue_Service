import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingTenant = await prisma.tenant.findFirst({
    where: { name: "Dummy Organizer" }
  });

  if (!existingTenant) {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Dummy Organizer"
      }
    });

    await prisma.venue.createMany({
      data: [
        {
          name: "Savoy Cinema - Hall A",
          seatMap: { rows: 6, cols: 10 },
          tenantId: tenant.id
        },
        {
          name: "Savoy Cinema - Hall B",
          seatMap: { rows: 8, cols: 12 },
          tenantId: tenant.id
        },
        {
          name: "Colombo City Center Hall",
          seatMap: { rows: 5, cols: 15 },
          tenantId: tenant.id
        }
      ]
    });

    console.log('✅ Dummy data inserted!');
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
