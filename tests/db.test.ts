import { PrismaClient } from '../generated/prisma-test';
import { execSync } from 'child_process';

describe('Database Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Set up test DB
    execSync('npx prisma db push --schema=prisma/schema.test.prisma --accept-data-loss', { stdio: 'inherit' });
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await prisma.events.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it('should create and find a tenant', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant' },
    });
    expect(tenant.name).toBe('Test Tenant');

    const found = await prisma.tenant.findUnique({ where: { id: tenant.id } });
    expect(found?.name).toBe('Test Tenant');
  });

  it('should create an event', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant' },
    });
    const event = await prisma.events.create({
      data: {
        tenantId: tenant.id,
        title: 'Test Event',
        description: 'A test',
        category: 'Test',
        type: 'EVENT',
      },
    });
    expect(event.title).toBe('Test Event');
  });
});
