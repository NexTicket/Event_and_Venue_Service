// Mock environment variables FIRST
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock Firebase Admin SDK BEFORE any imports
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  cert: jest.fn()
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockImplementation(async (token: string) => {
      if (token && token.startsWith('test-token')) {
        // Default to admin for most tests (bypasses authorization)
        return {
          uid: 'test-venue-owner-uid',
          email: 'owner@test.com',
          role: 'admin'
        };
      }
      if (token && token.startsWith('venue-owner-token')) {
        // Specific token for venue owner tests
        return {
          uid: 'test-venue-owner-uid',
          email: 'owner@test.com',
          role: 'venue_owner'
        };
      }
      if (token && token.startsWith('customer-token')) {
        // Customer role token (should be denied for venue operations)
        return {
          uid: 'test-customer-uid',
          email: 'customer@test.com',
          role: 'customer'
        };
      }
      if (token && token.startsWith('no-role-token')) {
        // User without role (should be denied)
        return {
          uid: 'test-no-role-uid',
          email: 'norole@test.com'
          // No role property
        };
      }
      if (token && token.startsWith('valid-token')) {
        // For backwards compatibility with existing tests, default to venue_owner
        return {
          uid: 'test-venue-owner-uid',
          email: 'owner@test.com',
          role: 'venue_owner'
        };
      }
      throw new Error('Invalid token');
    })
  }))
}));

// Mock dotenv to prevent real environment loading
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock Prisma Client globally BEFORE any imports
const mockPrismaClient = {
  tenant: {
    findUnique: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Tenant',
      firebaseUid: 'test-venue-owner-uid',
      createdAt: new Date(),
    }),
    create: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Tenant',
      firebaseUid: 'test-venue-owner-uid',
      createdAt: new Date(),
    }),
  },
  venue: {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 },
        tenantId: 1,
        tenant: {
          id: 1,
          name: 'Test Tenant',
          firebaseUid: 'test-venue-owner-uid',
          createdAt: new Date(),
        }
      }
    ]),
    findUnique: jest.fn(),
    create: jest.fn().mockImplementation((data) => ({
      id: 1,
      ...data.data,
      createdAt: new Date(),
    })),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
}));

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

beforeAll(async () => {
  // Setup test environment
});

afterAll(async () => {
  // Cleanup after tests
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
});
