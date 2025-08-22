import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAgentData } from '../services/agentServices';
import axiosInstance from '../axios';
import { ENDPOINT } from '../constant/urls';

/**
 * Debug script for agent authentication issues
 * Call this function to get detailed information about the current auth state
 */
export const debugAgentAuthentication = async () => {
  console.log('🔍 === AGENT AUTHENTICATION DEBUG START ===');
  
  try {
    // 1. Check stored authentication data
    console.log('📱 1. Checking stored authentication data...');
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role');
    const userId = await AsyncStorage.getItem('userId');
    const userData = await AsyncStorage.getItem('userData');
    
    console.log('📱 Stored Auth Data:', {
      hasToken: !!token,
      tokenLength: token?.length,
      role,
      userId,
      hasUserData: !!userData,
      userDataKeys: userData ? Object.keys(JSON.parse(userData)) : [],
    });
    
    if (!token) {
      console.log('❌ No token found - user needs to login');
      return { success: false, reason: 'No token' };
    }
    
    if (role !== 'agent') {
      console.log('❌ Role is not agent:', role);
      return { success: false, reason: 'Not an agent role' };
    }
    
    // 2. Test token validity with a simple request
    console.log('🔐 2. Testing token validity...');
    try {
      const testResponse = await axiosInstance.get(ENDPOINT.agent_profile);
      console.log('✅ Token is valid - agent profile accessible');
    } catch (tokenError: any) {
      console.log('❌ Token test failed:', {
        status: tokenError?.response?.status,
        message: tokenError?.message,
        responseData: tokenError?.response?.data,
      });
      
      if (tokenError?.response?.status === 401) {
        console.log('🔐 Token expired or invalid');
        return { success: false, reason: 'Invalid token' };
      } else if (tokenError?.response?.status === 403) {
        console.log('🚫 Token valid but access forbidden');
      }
    }
    
    // 3. Test all agent endpoints
    console.log('🌐 3. Testing all agent endpoints...');
    const endpoints = [
      { name: 'Agent Profile', url: ENDPOINT.agent_profile },
      { name: 'Agent Office Address', url: ENDPOINT.agent_office_address },
      { name: 'Agent Working Locations', url: ENDPOINT.agent_working_locations },
      { name: 'Agent Details (Legacy)', url: `${ENDPOINT.get_agent_details}/${userId}` },
    ];
    
    const endpointResults = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Testing ${endpoint.name}...`);
        const response = await axiosInstance.get(endpoint.url);
        console.log(`✅ ${endpoint.name} - Success:`, {
          hasData: !!response,
          dataType: typeof response,
          dataKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        });
        endpointResults.push({
          name: endpoint.name,
          success: true,
          data: response,
        });
      } catch (error: any) {
        console.log(`❌ ${endpoint.name} - Failed:`, {
          status: error?.response?.status,
          message: error?.message,
          responseData: error?.response?.data,
        });
        endpointResults.push({
          name: endpoint.name,
          success: false,
          error: {
            status: error?.response?.status,
            message: error?.message,
            data: error?.response?.data,
          },
        });
      }
    }
    
    // 4. Use the comprehensive agent data fetcher
    console.log('🔍 4. Using comprehensive agent data fetcher...');
    try {
      const agentDataResult = await fetchAgentData(userId ? parseInt(userId) : undefined);
      console.log('✅ Agent data fetcher result:', {
        success: agentDataResult.success,
        source: agentDataResult.source,
        hasData: !!agentDataResult.data,
        dataKeys: agentDataResult.data ? Object.keys(agentDataResult.data) : [],
      });
    } catch (fetchError: any) {
      console.log('❌ Agent data fetcher failed:', {
        message: fetchError?.message,
        details: fetchError?.toString(),
      });
    }
    
    // 5. Summary
    console.log('📊 5. Debug Summary:');
    const successfulEndpoints = endpointResults.filter(r => r.success);
    const failedEndpoints = endpointResults.filter(r => !r.success);
    
    console.log('📊 Endpoint Results:', {
      total: endpointResults.length,
      successful: successfulEndpoints.length,
      failed: failedEndpoints.length,
      successfulEndpoints: successfulEndpoints.map(e => e.name),
      failedEndpoints: failedEndpoints.map(e => ({
        name: e.name,
        status: e.error?.status,
        message: e.error?.message,
      })),
    });
    
    // 6. Recommendations
    console.log('💡 6. Recommendations:');
    if (failedEndpoints.length === endpointResults.length) {
      console.log('💡 All endpoints failed - likely authentication or server issue');
      console.log('💡 Recommended action: Re-login or check server status');
    } else if (failedEndpoints.some(e => e.error?.status === 403)) {
      console.log('💡 Some endpoints return 403 - possible permission or profile completion issue');
      console.log('💡 Recommended action: Complete agent profile or check account status');
    } else if (successfulEndpoints.length > 0) {
      console.log('💡 Some endpoints work - authentication is likely valid');
      console.log('💡 Recommended action: Use working endpoints and handle failed ones gracefully');
    }
    
    console.log('🔍 === AGENT AUTHENTICATION DEBUG END ===');
    
    return {
      success: true,
      results: {
        authData: { hasToken: !!token, role, userId },
        endpointResults,
        recommendations: successfulEndpoints.length > 0 ? 'partial_success' : 'all_failed',
      },
    };
    
  } catch (error: any) {
    console.error('❌ Debug script error:', error);
    console.log('🔍 === AGENT AUTHENTICATION DEBUG END (ERROR) ===');
    return { success: false, reason: 'Debug script error', error: error?.message };
  }
};

/**
 * Quick agent auth status check
 */
export const quickAgentAuthCheck = async () => {
  const token = await AsyncStorage.getItem('token');
  const role = await AsyncStorage.getItem('role');
  const userId = await AsyncStorage.getItem('userId');
  
  console.log('⚡ Quick Agent Auth Check:', {
    authenticated: !!token && role === 'agent',
    hasToken: !!token,
    role,
    userId,
    timestamp: new Date().toISOString(),
  });
  
  return {
    authenticated: !!token && role === 'agent',
    token: !!token,
    role,
    userId,
  };
};
