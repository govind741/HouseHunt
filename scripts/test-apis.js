#!/usr/bin/env node

const BASE_URL = 'http://houseapp.in:81/';

const testEndpoints = [
  {
    name: 'Get Cities',
    method: 'GET',
    url: `${BASE_URL}v1/auth/cities`,
    expectedFields: ['success', 'message', 'formattedData']
  },
  {
    name: 'Get Areas (Noida)',
    method: 'GET',
    url: `${BASE_URL}v1/auth/areas?cityId=1`,
    expectedFields: ['success', 'message', 'formattedData']
  },
  {
    name: 'Get Localities (Noida)',
    method: 'GET',
    url: `${BASE_URL}v1/auth/localities?cityId=1`,
    expectedFields: ['success', 'message', 'formattedData']
  },
  {
    name: 'Search Localities',
    method: 'GET',
    url: `${BASE_URL}v1/auth/search/localities?name=noida&cityId=1`,
    expectedFields: ['success', 'message', 'data']
  },
  {
    name: 'Get Public Agents',
    method: 'GET',
    url: `${BASE_URL}v1/auth/users/public/by-location?locationId=21`,
    expectedFields: ['success', 'message', 'user']
  },
  {
    name: 'Get Banners/Slider',
    method: 'GET',
    url: `${BASE_URL}v1/auth/users/banners/active?city_id=1`,
    expectedFields: ['success', 'message', 'data']
  },
  {
    name: 'User Login',
    method: 'POST',
    url: `${BASE_URL}v1/auth/users/login`,
    body: { phone: '1234567890' },
    expectedFields: ['success', 'message', 'data']
  },
  {
    name: 'Agent Login',
    method: 'POST',
    url: `${BASE_URL}v1/auth/agent/login`,
    body: { phone: '1234567890' },
    expectedFields: ['success', 'message', 'data']
  }
];

async function testAPI(endpoint) {
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`📡 ${endpoint.method} ${endpoint.url}`);
    
    const response = await fetch(endpoint.url, options);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(data, null, 2));
    
    // Check if response has expected fields
    const hasExpectedFields = endpoint.expectedFields.every(field => 
      data.hasOwnProperty(field)
    );
    
    if (response.ok && hasExpectedFields) {
      console.log(`✅ ${endpoint.name}: PASSED`);
      return { name: endpoint.name, status: 'PASSED', response: data };
    } else {
      console.log(`❌ ${endpoint.name}: FAILED`);
      return { name: endpoint.name, status: 'FAILED', response: data };
    }
    
  } catch (error) {
    console.log(`💥 ${endpoint.name}: ERROR - ${error.message}`);
    return { name: endpoint.name, status: 'ERROR', error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests for HouseApp Backend');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('=' * 50);
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testAPI(endpoint);
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' * 50);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 50);
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`💥 Errors: ${errors}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0 || errors > 0) {
    console.log('\n🔍 Failed/Error Details:');
    results.filter(r => r.status !== 'PASSED').forEach(result => {
      console.log(`- ${result.name}: ${result.status}`);
    });
  }
  
  console.log('\n🎉 API Testing Complete!');
}

// Run the tests
runAllTests().catch(console.error);
