<<<<<<< HEAD
export const PrismaClient = jest.fn().mockImplementation(() => ({
  events: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  venue: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tenant: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}));

export default {
  PrismaClient,
};
=======
// Mock Prisma Client for testing

const createMockPrismaClient = () => {
  return {
    tenant: {
      create: async (args) => ({
        id: 1,
        name: 'Test Tenant',
        createdAt: new Date(),
        firebaseUid: 'test-uid-123'
      }),
      findUnique: async (args) => ({
        id: 1,
        name: 'Test Tenant',
        createdAt: new Date(),
        firebaseUid: 'test-uid-123'
      }),
      findFirst: async (args) => ({
        id: 1,
        name: 'Test Tenant',
        createdAt: new Date(),
        firebaseUid: 'test-uid-123'
      }),
      findMany: async (args) => ([
        {
          id: 1,
          name: 'Test Tenant',
          createdAt: new Date(),
          firebaseUid: 'test-uid-123'
        }
      ]),
      update: async (args) => ({
        id: 1,
        name: 'Updated Tenant',
        createdAt: new Date(),
        firebaseUid: 'test-uid-123'
      }),
      delete: async (args) => ({
        id: 1,
        name: 'Test Tenant',
        createdAt: new Date(),
        firebaseUid: 'test-uid-123'
      })
    },
    venue: {
      create: async (args) => ({
        id: 1,
        name: args.data.name || 'Test Venue',
        location: args.data.location || 'Test Location',
        capacity: args.data.capacity || 100,
        seatMap: args.data.seatMap || { rows: 10, columns: 10 },
        tenantId: args.data.tenantId || 1,
        ownerUid: args.data.ownerUid || 'test-uid-123',
        type: args.data.type || 'Conference Hall',
        latitude: args.data.latitude || 6.9271,
        longitude: args.data.longitude || 79.8612,
        description: args.data.description || 'A test venue',
        availability: args.data.availability || null,
        amenities: args.data.amenities || null,
        image: args.data.image || null,
        featuredImage: args.data.featuredImage || null,
        images: args.data.images || []
      }),
      findUnique: async (args) => {
        // Return null if looking for non-existent IDs (for 404 tests) or invalid IDs (NaN)
        if (args.where.id === 999 || args.where.id > 100 || isNaN(args.where.id)) {
          return null;
        }
        return {
          id: args.where.id || 1,
          name: 'Test Venue',
          location: 'Test Location',
          capacity: 100,
          seatMap: { rows: 10, columns: 10 },
          tenantId: 1,
          ownerUid: 'venue-owner-uid-123',
          type: 'Conference Hall',
          latitude: 6.9271,
          longitude: 79.8612,
          description: 'A test venue',
          availability: null,
          amenities: null,
          image: null,
          featuredImage: null,
          images: [],
          tenant: {
            id: 1,
            name: 'Test Tenant',
            createdAt: new Date(),
            firebaseUid: 'venue-owner-uid-123'  // Match venue owner's UID for authorization
          }
        };
      },
      findFirst: async (args) => ({
        id: 1,
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 },
        tenantId: 1,
        ownerUid: 'test-uid-123',
        type: 'Conference Hall',
        latitude: 6.9271,
        longitude: 79.8612,
        description: 'A test venue',
        availability: null,
        amenities: null,
        image: null,
        featuredImage: null,
        images: [],
        tenant: {
          id: 1,
          name: 'Test Tenant',
          createdAt: new Date(),
          firebaseUid: 'test-uid-123'
        }
      }),
      findMany: async (args) => ([
        {
          id: 1,
          name: 'Test Venue',
          location: 'Test Location',
          capacity: 100,
          seatMap: { rows: 10, columns: 10 },
          tenantId: 1,
          ownerUid: 'test-uid-123',
          type: 'Conference Hall',
          latitude: 6.9271,
          longitude: 79.8612,
          description: 'A test venue',
          availability: null,
          amenities: null,
          image: null,
          featuredImage: null,
          images: [],
          tenant: {
            id: 1,
            name: 'Test Tenant',
            createdAt: new Date(),
            firebaseUid: 'test-uid-123'
          }
        }
      ]),
      update: async (args) => {
        // Get existing venue to merge with updates
        const existing = {
          id: args.where.id || 1,
          name: 'Test Venue',
          location: 'Test Location',
          capacity: 100,
          seatMap: { rows: 10, columns: 10 },
          tenantId: 1,
          ownerUid: 'venue-owner-uid-123',
          type: 'Conference Hall',
          latitude: 6.9271,
          longitude: 79.8612,
          description: 'A test venue',
          availability: null,
          amenities: null,
          image: null,
          featuredImage: null,
          images: [],
          tenant: {
            id: 1,
            name: 'Test Tenant',
            createdAt: new Date(),
            firebaseUid: 'venue-owner-uid-123'
          }
        };
        
        // Build the updated object with only provided fields
        const updated = { ...existing };
        if (args.data.name !== undefined) updated.name = args.data.name;
        if (args.data.location !== undefined) updated.location = args.data.location;
        if (args.data.capacity !== undefined) updated.capacity = args.data.capacity;
        if (args.data.seatMap !== undefined) updated.seatMap = args.data.seatMap;
        if (args.data.type !== undefined) updated.type = args.data.type;
        if (args.data.latitude !== undefined) updated.latitude = args.data.latitude;
        if (args.data.longitude !== undefined) updated.longitude = args.data.longitude;
        if (args.data.description !== undefined) updated.description = args.data.description;
        if (args.data.availability !== undefined) updated.availability = args.data.availability;
        if (args.data.amenities !== undefined) updated.amenities = args.data.amenities;
        if (args.data.image !== undefined) updated.image = args.data.image;
        if (args.data.featuredImage !== undefined) updated.featuredImage = args.data.featuredImage;
        if (args.data.images !== undefined) updated.images = args.data.images;
        
        return updated;
      },
      delete: async (args) => ({
        id: args.where.id || 1,
        name: 'Test Venue',
        location: 'Test Location',
        capacity: 100,
        seatMap: { rows: 10, columns: 10 },
        tenantId: 1,
        ownerUid: 'venue-owner-uid-123'
      })
    },
    events: {
      create: async (args) => ({
        id: 1,
        tenantId: args.data.tenantId || 1,
        title: args.data.title || 'Test Event',
        description: args.data.description || 'Test Description',
        category: args.data.category || 'Technology',
        type: args.data.type || 'EVENT',
        startDate: args.data.startDate ? new Date(args.data.startDate) : new Date('2025-10-01'),
        endDate: args.data.endDate ? new Date(args.data.endDate) : new Date('2025-10-02'),
        startTime: args.data.startTime || '09:00',
        endTime: args.data.endTime || '17:00',
        status: args.data.status || 'PENDING',
        venueId: args.data.venueId || 1,
        image: args.data.image || null,
        created_at: new Date(),
        checkinOfficerUids: args.data.checkinOfficerUids || [],
        eventAdminUid: args.data.eventAdminUid || null
      }),
      findUnique: async (args) => {
        // Return null if looking for non-existent IDs (for 404 tests) or invalid IDs (NaN)
        if (args.where.id === 999 || args.where.id > 100 || isNaN(args.where.id)) {
          return null;
        }
        return {
          id: args.where.id || 1,
          tenantId: 1,
          title: 'Test Event',
          description: 'Test Description',
          category: 'Technology',
          type: 'EVENT',
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-02'),
          startTime: '09:00',
          endTime: '17:00',
          status: 'APPROVED',
          venueId: 1,
          image: null,
          created_at: new Date(),
          checkinOfficerUids: [],
          eventAdminUid: null,
          Tenant: {
            id: 1,
            name: 'Test Tenant',
            firebaseUid: 'organizer-uid-123' // Match organizer's UID for authorization
          },
          venue: {
            id: 1,
            name: 'Test Venue',
            location: 'Test Location',
            capacity: 100
          }
        };
      },
      findFirst: async (args) => ({
        id: 1,
        tenantId: 1,
        title: 'Test Event',
        description: 'Test Description',
        category: 'Technology',
        type: 'EVENT',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-02'),
        startTime: '09:00',
        endTime: '17:00',
        status: 'APPROVED',
        venueId: 1,
        image: null,
        created_at: new Date(),
        checkinOfficerUids: [],
        eventAdminUid: null,
        Tenant: {
          id: 1,
          name: 'Test Tenant'
        },
        venue: {
          id: 1,
          name: 'Test Venue',
          location: 'Test Location',
          capacity: 100
        }
      }),
      findMany: async (args) => ([
        {
          id: 1,
          tenantId: 1,
          title: 'Test Event',
          description: 'Test Description',
          category: 'Technology',
          type: 'EVENT',
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-02'),
          startTime: '09:00',
          endTime: '17:00',
          status: 'APPROVED',
          venueId: 1,
          image: null,
          created_at: new Date(),
          checkinOfficerUids: [],
          eventAdminUid: null,
          Tenant: {
            id: 1,
            name: 'Test Tenant'
          },
          venue: {
            id: 1,
            name: 'Test Venue',
            location: 'Test Location',
            capacity: 100
          }
        }
      ]),
      update: async (args) => {
        // Get existing event to merge with updates
        const existing = {
          id: args.where.id || 1,
          tenantId: 1,
          title: 'Test Event',
          description: 'Original Description',
          category: 'Technology',
          type: 'EVENT',
          startDate: new Date('2025-10-01'),
          endDate: new Date('2025-10-02'),
          startTime: '09:00',
          endTime: '17:00',
          status: 'APPROVED',
          venueId: 1,
          image: null,
          created_at: new Date(),
          checkinOfficerUids: [],
          eventAdminUid: null,
          Tenant: {
            id: 1,
            name: 'Test Tenant',
            firebaseUid: 'organizer-uid-123'
          },
          venue: {
            id: 1,
            name: 'Test Venue',
            location: 'Test Location',
            capacity: 100
          }
        };
        
        // Build the updated object with only provided fields
        const updated = { ...existing };
        if (args.data.title !== undefined) updated.title = args.data.title;
        if (args.data.description !== undefined) updated.description = args.data.description;
        if (args.data.category !== undefined) updated.category = args.data.category;
        if (args.data.type !== undefined) updated.type = args.data.type;
        if (args.data.startDate !== undefined) updated.startDate = new Date(args.data.startDate);
        if (args.data.endDate !== undefined) updated.endDate = new Date(args.data.endDate);
        if (args.data.startTime !== undefined) updated.startTime = args.data.startTime;
        if (args.data.endTime !== undefined) updated.endTime = args.data.endTime;
        if (args.data.status !== undefined) updated.status = args.data.status;
        if (args.data.venueId !== undefined) updated.venueId = args.data.venueId;
        if (args.data.image !== undefined) updated.image = args.data.image;
        if (args.data.checkinOfficerUids !== undefined) updated.checkinOfficerUids = args.data.checkinOfficerUids;
        if (args.data.eventAdminUid !== undefined) updated.eventAdminUid = args.data.eventAdminUid;
        
        return updated;
      },
      delete: async (args) => ({
        id: args.where.id || 1,
        tenantId: 1,
        title: 'Test Event',
        description: 'Test Description',
        category: 'Technology',
        type: 'EVENT',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-02'),
        status: 'APPROVED',
        venueId: 1
      })
    },
    $connect: async () => {},
    $disconnect: async () => {}
  };
};

// Create and export the mock client
const mockPrismaClient = createMockPrismaClient();

// Make it available globally for tests
if (typeof global !== 'undefined') {
  global.mockPrismaClient = mockPrismaClient;
}

// Export PrismaClient as a class that returns the mock
export class PrismaClient {
  constructor() {
    return mockPrismaClient;
  }
}

// Export default
export default { PrismaClient };
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
