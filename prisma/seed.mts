import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const existingEvent = await prisma.events.findFirst({
    where: { name: "Sample Concert" }
  });

  if (!existingEvent) {
    await prisma.events.createMany({
      data: [
        {
          name: "Sample Concert",
          description: "A sample concert event for testing",
          date: new Date("2024-12-31T20:00:00Z"),
          type: "Concert"
        },
        {
          name: "Tech Conference 2024",
          description: "Annual technology conference",
          date: new Date("2024-11-15T09:00:00Z"),
          type: "Conference"
        },
        {
          name: "Art Exhibition",
          description: "Modern art exhibition",
          date: new Date("2024-10-20T10:00:00Z"),
          type: "Exhibition"
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
