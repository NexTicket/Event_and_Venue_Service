import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Delete in reverse order due to foreign key constraints
    await prisma.venue.deleteMany({});
    console.log('  ✓ Deleted all venues');
    
    await prisma.tenant.deleteMany({});
    console.log('  ✓ Deleted all tenants');
    
    console.log('✅ Database cleared successfully');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
