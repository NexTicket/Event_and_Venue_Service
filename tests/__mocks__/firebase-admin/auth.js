<<<<<<< HEAD
export const auth = jest.fn().mockReturnValue({
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com',
  }),
  getUser: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com',
    customClaims: { role: 'admin' },
  }),
  setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
});

export const initializeApp = jest.fn();
export const credential = {
  cert: jest.fn(),
};

export default {
  auth,
  initializeApp,
  credential,
};
=======
// Mock for firebase-admin/auth module

const mockAuth = {
  verifyIdToken: async (token) => {
    // Map test tokens to user objects
    const now = Math.floor(Date.now() / 1000);
    const tokenMap = {
      'admin-token-123': {
        uid: 'admin-uid-123',
        email: 'admin@test.com',
        role: 'admin',
        name: 'Admin User',
        iat: now - 3600,
        exp: now + 3600
      },
      'organizer-token-123': {
        uid: 'organizer-uid-123',
        email: 'organizer@test.com',
        role: 'organizer',
        name: 'Organizer User',
        iat: now - 3600,
        exp: now + 3600
      },
      'venue-owner-token-123': {
        uid: 'venue-owner-uid-123',
        email: 'venue_owner@test.com',
        role: 'venue_owner',
        name: 'Venue Owner User',
        iat: now - 3600,
        exp: now + 3600
      },
      'event-admin-token-123': {
        uid: 'event-admin-uid-123',
        email: 'event_admin@test.com',
        role: 'event_admin',
        name: 'Event Admin User',
        iat: now - 3600,
        exp: now + 3600
      },
      'checkin-officer-token-123': {
        uid: 'checkin-officer-uid-123',
        email: 'checkin@test.com',
        role: 'checkin_officer',
        name: 'Checkin Officer User',
        iat: now - 3600,
        exp: now + 3600
      },
      'customer-token-123': {
        uid: 'customer-uid-123',
        email: 'customer@test.com',
        role: 'customer',
        name: 'Customer User',
        iat: now - 3600,
        exp: now + 3600
      },
      'test-token-123': {
        uid: 'test-uid-123',
        email: 'test@test.com',
        role: 'customer',
        name: 'Test User',
        iat: now - 3600,
        exp: now + 3600
      }
    };

    const user = tokenMap[token];
    if (user) {
      return user;
    }

    // Invalid token
    throw new Error('Invalid token');
  },
  
  createCustomToken: async (uid, claims) => {
    return `custom-token-${uid}`;
  },
  
  setCustomUserClaims: async (uid, claims) => {
    return;
  },
  
  getUser: async (uid) => {
    return {
      uid,
      email: `${uid}@test.com`,
      emailVerified: true
    };
  }
};

export const getAuth = () => mockAuth;
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
