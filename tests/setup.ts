import { PrismaClient } from '../generated/prisma-test';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Push the schema to the SQLite DB
  execSync('npx prisma db push --schema=prisma/schema.test.prisma --accept-data-loss', { stdio: 'inherit' });
  // Optional: Seed if needed
});

afterAll(async () => {
  await prisma.$disconnect();
  // Clean up test DB file if desired
  // execSync('rm -f prisma/test.db');
});

export { prisma };
