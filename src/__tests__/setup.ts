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
      const now = Math.floor(Date.now() / 1000);
      const future = now + 3600; // 1 hour from now
      
      if (token && token.startsWith('test-token')) {
        // Default to organizer for most tests
        return {
          uid: 'test-organizer-uid',
          email: 'organizer@test.com',
          role: 'organizer',
          iat: now,
          exp: future
        };
      }
      if (token && token.startsWith('venue-owner-token')) {
        // Specific token for venue owner tests
        return {
          uid: 'test-venue-owner-uid',
          email: 'owner@test.com',
          role: 'venue_owner',
          iat: now,
          exp: future
        };
      }
      if (token && token.startsWith('organizer-token')) {
        // Organizer role token for event creation
        return {
          uid: 'test-organizer-uid',
          email: 'organizer@test.com',
          role: 'organizer',
          iat: now,
          exp: future
        };
      }
      if (token && token.startsWith('customer-token')) {
        // Customer role token (should be denied for venue operations)
        return {
          uid: 'test-customer-uid',
          email: 'customer@test.com',
          role: 'customer',
          iat: now,
          exp: future
        };
      }
      if (token && token.startsWith('no-role-token')) {
        // Token without role (should default to customer)
        return {
          uid: 'test-no-role-uid',
          email: 'norole@test.com',
          role: undefined,
          iat: now,
          exp: future
        };
      }
      if (token && token.startsWith('valid-token')) {
        // For backwards compatibility with existing tests, default to venue_owner
        return {
          uid: 'test-venue-owner-uid',
          email: 'owner@test.com',
          role: 'venue_owner',
          iat: now,
          exp: future
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

// Mock Cloudinary
jest.mock('../utils/cloudinary', () => ({
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: 'test-image',
        secure_url: 'https://cloudinary.com/uploaded-image.jpg'
      })
    }
  }
}));

// Mock multer globally
jest.mock('multer', () => {
  return jest.fn((options: any) => {
    const middleware = (req: any, res: any, next: any) => {
      // Default behavior - no file
      next();
    };
    middleware.single = jest.fn(() => middleware);
    return middleware;
  });
});

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
    findUnique: jest.fn().mockImplementation((query) => {
      if (query.where.id === 1) {
        return Promise.resolve({
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
        });
      }
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((data) => ({
      id: 1,
      ...data.data,
      createdAt: new Date(),
    })),
    update: jest.fn(),
    delete: jest.fn(),
  },
  events: {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        category: 'Technology',
        type: 'Conference',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-02'),
        startTime: '09:00',
        endTime: '17:00',
        status: 'active',
        image: 'https://example.com/image.jpg',
        venueId: 1,
        tenantId: 1,
        Tenant: {
          id: 1,
          name: 'Test Tenant',
          firebaseUid: 'test-organizer-uid',
          createdAt: new Date(),
        },
        venue: {
          id: 1,
          name: 'Test Venue',
          location: 'Test Location'
        }
      }
    ]),
    findUnique: jest.fn().mockImplementation((query) => {
      if (query.where.id === 1) {
        return Promise.resolve({
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          category: 'Technology',
          type: 'Conference',
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-02'),
          startTime: '09:00',
          endTime: '17:00',
          status: 'active',
          image: 'https://example.com/image.jpg',
          venueId: 1,
          tenantId: 1,
          Tenant: {
            id: 1,
            name: 'Test Tenant',
            firebaseUid: 'test-organizer-uid',
            createdAt: new Date(),
          },
          venue: {
            id: 1,
            name: 'Test Venue',
            location: 'Test Location'
          }
        });
      }
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((data) => ({
      id: 1,
      ...data.data,
      tenantId: 1,
      status: 'active',
      createdAt: new Date(),
    })),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

// Mock Prisma Client globally BEFORE any imports
jest.mock('../../generated/prisma/index.js', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
}));

// Expose the mock instance globally for tests that need to modify it
(global as any).mockPrismaClient = mockPrismaClient;

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
