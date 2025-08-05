import jwt from 'jsonwebtoken';

export interface MockUser {
  uid: string;
  email: string;
  role: string;
}

// Mock user data for testing
export const mockVenueOwner: MockUser = {
  uid: 'test-venue-owner-uid',
  email: 'owner@test.com',
  role: 'venue_owner'
};

export const mockRegularUser: MockUser = {
  uid: 'test-user-uid',
  email: 'user@test.com',
  role: 'user'
};

/**
 * Creates a mock JWT token for testing
 */
export async function initializeTestFirebaseUser(user: MockUser = mockVenueOwner): Promise<string> {
  // Create a mock JWT token
  const token = jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    },
    'test-secret', // In real tests, this should match your Firebase project secret
    { algorithm: 'HS256' }
  );

  return token;
}

/**
 * Mock Firebase Admin SDK for testing
 */
export const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: jest.fn().mockImplementation(async (token: string) => {
      try {
        const decoded = jwt.verify(token, 'test-secret') as any;
        return {
          uid: decoded.uid,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {
        throw new Error('Invalid token');
      }
    })
  })
};

// Mock the firebase-admin module
jest.mock('firebase-admin', () => mockFirebaseAdmin);
