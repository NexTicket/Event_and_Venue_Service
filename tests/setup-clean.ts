// Test setup file - runs before all tests
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock global fetch for User-Service calls
global.fetch = async (url: string | URL | Request, init?: RequestInit) => {
  const urlString = url.toString();
  
  // Mock User-Service ensure-tenant endpoint
  if (urlString.includes('/api/users/ensure-tenant')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          tenantId: 1,
          userId: 'test-user-id',
          firebaseUid: 'organizer-uid-123'
        }
      }),
      text: async () => JSON.stringify({ success: true, data: { tenantId: 1 } })
    } as Response;
  }
  
  // Default mock response
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' }),
    text: async () => 'Not found'
  } as Response;
};

console.log('✅ Test setup loaded - environment configured');

