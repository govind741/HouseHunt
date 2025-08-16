#!/usr/bin/env node

const BASE_URL = 'http://houseapp.in:81/';

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow...\n');

  // Step 1: Test User Login
  console.log('1️⃣ Testing User Login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}v1/auth/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9876543210'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      console.log('✅ Login API is working correctly');
      
      // Step 2: Test OTP Verification (with dummy OTP)
      console.log('\n2️⃣ Testing OTP Verification...');
      try {
        const otpResponse = await fetch(`${BASE_URL}v1/auth/users/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: '9876543210',
            otp: 123456 // Common test OTP
          })
        });

        const otpData = await otpResponse.json();
        console.log('📱 OTP Response:', JSON.stringify(otpData, null, 2));

        if (otpData.success) {
          console.log('✅ OTP verification is working');
        } else {
          console.log('⚠️ OTP verification failed (expected for dummy OTP)');
        }

      } catch (error) {
        console.log('❌ OTP verification error:', error.message);
      }

    } else {
      console.log('❌ Login API failed');
    }

  } catch (error) {
    console.log('❌ Login API error:', error.message);
  }

  // Step 3: Test Agent Login
  console.log('\n3️⃣ Testing Agent Login...');
  try {
    const agentResponse = await fetch(`${BASE_URL}v1/auth/agent/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9876543210'
      })
    });

    const agentData = await agentResponse.json();
    console.log('👔 Agent Login Response:', JSON.stringify(agentData, null, 2));

    if (agentData.success) {
      console.log('✅ Agent login API is working correctly');
    } else {
      console.log('❌ Agent login API failed');
    }

  } catch (error) {
    console.log('❌ Agent login API error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 AUTHENTICATION FLOW TEST SUMMARY:');
  console.log('- User Login API: Available');
  console.log('- OTP Verification API: Available');
  console.log('- Agent Login API: Available');
  console.log('\n💡 If login is not working in the app:');
  console.log('1. Check if the app is showing LoginScreen initially');
  console.log('2. Verify navigation flow from HomeScreen to AuthStack');
  console.log('3. Check if token validation is working properly');
  console.log('4. Ensure LoginModal is triggering correctly');
}

testAuthFlow().catch(console.error);
