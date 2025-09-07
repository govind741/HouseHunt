import axiosInstance from '../axios';
import {ENDPOINT} from '../constant/urls';

export const testApiEndpoints = async () => {
  console.log('🧪 Starting API Endpoint Tests...');
  
  const testResults: any[] = [];
  
  // Test 1: Basic server health check
  try {
    console.log('🏥 Testing server health...');
    const healthResponse = await fetch('http://houseapp.in:81/');
    const healthText = await healthResponse.text();
    testResults.push({
      test: 'Server Health',
      status: healthResponse.status,
      success: healthResponse.ok,
      response: healthText,
    });
    console.log('Server is responding');
  } catch (error) {
    console.error('Server health check failed:', error);
    testResults.push({
      test: 'Server Health',
      status: 0,
      success: false,
      error: error,
    });
  }

  // Test 2: User login endpoint with minimal data
  try {
    console.log('Testing user login endpoint...');
    const loginResponse = await axiosInstance.post(ENDPOINT.user_login, {
      phone: '1234567890', // Test phone number
    });
    testResults.push({
      test: 'User Login',
      status: 200,
      success: true,
      response: loginResponse,
    });
    console.log('User login endpoint is working');
  } catch (error: any) {
    console.log('User login endpoint response:', error);
    testResults.push({
      test: 'User Login',
      status: error.status || 0,
      success: false,
      error: error,
    });
  }

  // Test 3: Agent login endpoint
  try {
    console.log('👔 Testing agent login endpoint...');
    const agentResponse = await axiosInstance.post(ENDPOINT.agent_login, {
      phone: '1234567890', // Test phone number
    });
    testResults.push({
      test: 'Agent Login',
      status: 200,
      success: true,
      response: agentResponse,
    });
    console.log('Agent login endpoint is working');
  } catch (error: any) {
    console.log('Agent login endpoint response:', error);
    testResults.push({
      test: 'Agent Login',
      status: error.status || 0,
      success: false,
      error: error,
    });
  }

  // Print summary
  console.log('API Test Results Summary:');
  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.success ? 'PASS' : 'FAIL'} (Status: ${result.status})`);
  });

  return testResults;
};

export const testSpecificEndpoint = async (endpoint: string, data: any = {}) => {
  console.log(`Testing specific endpoint: ${endpoint}`);
  
  try {
    const response = await axiosInstance.post(endpoint, data);
    console.log('Endpoint test successful:', response);
    return { success: true, response };
  } catch (error: any) {
    console.log('Endpoint test failed:', error);
    return { success: false, error };
  }
};

// Quick debug function you can call from your component
export const debugCurrentError = (error: any, context: string) => {
  console.group(`🐛 Debug Error - ${context}`);
  console.log('Error Type:', typeof error);
  console.log('Error Object:', error);
  console.log('Error Status:', error?.status || error?.response?.status);
  console.log('Error Message:', error?.message);
  console.log('Error Data:', error?.details || error?.response?.data);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
};
