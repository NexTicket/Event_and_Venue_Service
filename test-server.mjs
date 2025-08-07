#!/usr/bin/env node

// Simple test script to verify EVMS server is running and tenant API works
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';

async function testServer() {
  console.log('🔍 Testing EVMS Server...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${API_URL}/`);
    
    if (healthResponse.ok) {
      const healthText = await healthResponse.text();
      console.log('✅ Server is running:', healthText);
    } else {
      console.log('❌ Server health check failed:', healthResponse.status);
      return;
    }

    // Test 2: Check if tenant endpoint exists (without auth - should get 401)
    console.log('\n2. Testing tenant endpoint availability...');
    const tenantResponse = await fetch(`${API_URL}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebaseUid: 'test',
        name: 'test',
        role: 'venue_owner'
      })
    });

    console.log('Response status:', tenantResponse.status);
    const responseText = await tenantResponse.text();
    console.log('Response body:', responseText);

    if (tenantResponse.status === 401) {
      console.log('✅ Tenant endpoint exists but requires authentication (expected)');
    } else if (tenantResponse.status === 404) {
      console.log('❌ Tenant endpoint not found - check routes configuration');
    } else {
      console.log('🤔 Unexpected response from tenant endpoint');
    }

  } catch (error) {
    console.error('❌ Error testing server:', error.message);
    console.log('\n💡 Make sure EVMS server is running with: npm run dev');
  }
}

testServer();
