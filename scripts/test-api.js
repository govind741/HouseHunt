#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://houseapp.in:81/';

async function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');

  // Test 1: Basic connectivity
  try {
    console.log('1. Testing basic connectivity...');
    const response = await axios.get(BASE_URL, { timeout: 10000 });
    console.log('✅ Basic connectivity: OK');
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    console.log('❌ Basic connectivity: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: User registration endpoint
  try {
    console.log('\n2. Testing user registration endpoint...');
    const response = await axios.post(`${BASE_URL}v1/auth/users/register`, {
      phone: 1234567890,
      name: 'Test User'
    }, { 
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    console.log('✅ User registration endpoint: Reachable');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ User registration endpoint: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: User profile endpoint
  try {
    console.log('\n3. Testing user profile endpoint...');
    const response = await axios.get(`${BASE_URL}v1/auth/users/profile`, {
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    console.log('✅ User profile endpoint: Reachable');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ User profile endpoint: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  // Test 4: User login endpoint
  try {
    console.log('\n4. Testing user login endpoint...');
    const response = await axios.post(`${BASE_URL}v1/auth/users/login`, {
      phone: '1234567890'
    }, { 
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    console.log('✅ User login endpoint: Reachable');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ User login endpoint: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🏁 API endpoint testing completed!');
}

testAPIEndpoints().catch(console.error);
