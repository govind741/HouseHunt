import {ENDPOINT} from '../constant/urls';
import axiosInstance from '../axios';

/**
 * Agent Services - Handles all agent-specific API calls
 */

export const getAgentProfile = async () => {
  try {
    console.log('Get Agent Profile Request');
    const response = await axiosInstance.get(ENDPOINT.agent_profile);
    console.log('Get Agent Profile Success:', response);
    return response;
  } catch (error: any) {
    console.error('Get Agent Profile Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

export const updateAgentProfile = async (profileData: any) => {
  try {
    console.log('✏️ Update Agent Profile Request:', profileData);
    const response = await axiosInstance.put(ENDPOINT.agent_profile, profileData);
    console.log('Update Agent Profile Success:', response);
    return response;
  } catch (error: any) {
    console.error('Update Agent Profile Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

export const getAgentOfficeAddress = async () => {
  try {
    console.log('Get Agent Office Address Request');
    const response = await axiosInstance.get(ENDPOINT.agent_office_address);
    console.log('Get Agent Office Address Success:', response);
    return response;
  } catch (error: any) {
    console.error('Get Agent Office Address Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

export const updateAgentOfficeAddress = async (addressData: any) => {
  try {
    console.log('Update Agent Office Address Request:', addressData);
    const response = await axiosInstance.put(ENDPOINT.agent_office_address, addressData);
    console.log('Update Agent Office Address Success:', response);
    return response;
  } catch (error: any) {
    console.error('Update Agent Office Address Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

export const getAgentWorkingLocations = async () => {
  try {
    console.log('Get Agent Working Locations Request');
    const response = await axiosInstance.get(ENDPOINT.agent_working_locations);
    console.log('Get Agent Working Locations Success:', response);
    return response;
  } catch (error: any) {
    console.error('Get Agent Working Locations Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

export const updateAgentWorkingLocations = async (locationsData: any) => {
  try {
    console.log('Update Agent Working Locations Request:', locationsData);
    const response = await axiosInstance.put(ENDPOINT.agent_working_locations, locationsData);
    console.log('Update Agent Working Locations Success:', response);
    return response;
  } catch (error: any) {
    console.error('Update Agent Working Locations Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

/**
 * Comprehensive agent data fetcher - tries multiple endpoints to get agent data
 */
export const fetchAgentData = async (agentId?: number) => {
  const errors: any[] = [];
  
  // Try agent profile endpoint first (most reliable for authenticated agents)
  try {
    console.log('Trying agent profile endpoint...');
    const profileResponse = await getAgentProfile();
    console.log('Processing agent profile data...', {
      hasResponse: !!profileResponse,
      responseType: typeof profileResponse,
      responseKeys: profileResponse && typeof profileResponse === 'object' ? Object.keys(profileResponse) : [],
    });
    
    if (profileResponse && typeof profileResponse === 'object') {
      // Handle different response structures
      let agentData = null;
      
      if (profileResponse.data && typeof profileResponse.data === 'object') {
        agentData = profileResponse.data;
      } else if (profileResponse.id || profileResponse.name || profileResponse.phone || profileResponse.email) {
        agentData = profileResponse;
      } else if (Object.keys(profileResponse).length > 0) {
        agentData = profileResponse;
      }
      
      if (agentData) {
        // Ensure agent has an ID
        if (!agentData.id && agentId) {
          agentData.id = agentId;
        }
        
        console.log('Agent data retrieved from profile endpoint:', {
          hasId: !!agentData.id,
          hasName: !!agentData.name,
          hasPhone: !!agentData.phone,
          hasEmail: !!agentData.email,
          dataKeys: Object.keys(agentData),
        });
        
        return {
          success: true,
          data: agentData,
          source: 'profile'
        };
      }
    }
  } catch (error: any) {
    console.log('Agent profile endpoint failed:', error?.response?.status);
    errors.push({endpoint: 'profile', error});
  }

  // Try working locations endpoint
  try {
    console.log('Trying agent working locations endpoint...');
    const locationsResponse = await getAgentWorkingLocations();
    console.log('Processing working locations data...', {
      hasResponse: !!locationsResponse,
      responseType: typeof locationsResponse,
    });
    
    if (locationsResponse) {
      // Create agent data from working locations response
      const agentData = {
        id: agentId || 'unknown',
        name: 'Agent',
        phone: '',
        email: '',
        role: 'agent',
        working_locations: locationsResponse?.data || locationsResponse,
        // Use actual verification status - new agents should be unverified by default
        verified: 0,
        status: 0,
      };
      
      console.log('Agent data created from working locations endpoint');
      return {
        success: true,
        data: agentData,
        source: 'working_locations'
      };
    }
  } catch (error: any) {
    console.log('Agent working locations endpoint failed:', error?.response?.status);
    errors.push({endpoint: 'working_locations', error});
  }

  // Try office address endpoint
  try {
    console.log('Trying agent office address endpoint...');
    const addressResponse = await getAgentOfficeAddress();
    console.log('Processing office address data...', {
      hasResponse: !!addressResponse,
      responseType: typeof addressResponse,
    });
    
    if (addressResponse) {
      // Create agent data from office address response
      const agentData = {
        id: agentId || 'unknown',
        name: 'Agent',
        phone: '',
        email: '',
        role: 'agent',
        office_address: addressResponse?.data || addressResponse,
        // Use actual verification status - new agents should be unverified by default
        verified: 0,
        status: 0,
      };
      
      console.log('Agent data created from office address endpoint');
      return {
        success: true,
        data: agentData,
        source: 'office_address'
      };
    }
  } catch (error: any) {
    console.log('Agent office address endpoint failed:', error?.response?.status);
    errors.push({endpoint: 'office_address', error});
  }

  // If agentId is provided, try the legacy endpoint as last resort
  if (agentId) {
    try {
      console.log('Trying legacy agent details endpoint...');
      const response = await axiosInstance.get(`${ENDPOINT.get_agent_details}/${agentId}`);
      console.log('Processing legacy endpoint data...', {
        hasResponse: !!response,
        responseType: typeof response,
      });
      
      if (response && typeof response === 'object') {
        let agentData = response?.data || response;
        
        if (agentData && typeof agentData === 'object') {
          console.log('Agent data retrieved from legacy endpoint');
          return {
            success: true,
            data: agentData,
            source: 'legacy'
          };
        }
      }
    } catch (error: any) {
      console.log('Legacy agent details endpoint failed:', error?.response?.status);
      errors.push({endpoint: 'legacy', error});
    }
  }

  // All endpoints failed - create a minimal agent object to prevent app crashes
  console.log('All endpoints failed, creating minimal agent object');
  const minimalAgentData = {
    id: agentId || 'unknown',
    name: 'Agent',
    phone: '',
    email: '',
    role: 'agent',
    verified: 0,
    status: 0,
    // Mark as incomplete profile so user can complete it
    profile_incomplete: true,
  };
  
  return {
    success: true,
    data: minimalAgentData,
    source: 'minimal_fallback',
    errors: errors.map(e => ({
      endpoint: e.endpoint, 
      status: e.error?.response?.status,
      message: e.error?.message
    }))
  };
};

/**
 * Check if agent has complete profile data
 */
export const validateAgentProfile = (agentData: any) => {
  // If this is a minimal fallback object, mark as incomplete
  if (agentData?.profile_incomplete) {
    return {
      isComplete: false,
      hasAdditionalInfo: false,
      missingFields: ['name', 'phone', 'email'],
      score: 0.1,
      reason: 'Minimal fallback data - profile needs completion'
    };
  }
  
  const requiredFields = ['name', 'phone'];
  const optionalFields = ['agency_name', 'email', 'office_address'];
  
  const hasRequiredFields = requiredFields.every(field => 
    agentData?.[field] && agentData[field].toString().trim() !== '' && agentData[field] !== 'Agent'
  );
  
  const hasOptionalFields = optionalFields.some(field => 
    agentData?.[field] && agentData[field].toString().trim() !== ''
  );
  
  const missingFields = requiredFields.filter(field => 
    !agentData?.[field] || agentData[field].toString().trim() === '' || agentData[field] === 'Agent'
  );
  
  return {
    isComplete: hasRequiredFields,
    hasAdditionalInfo: hasOptionalFields,
    missingFields,
    score: (requiredFields.filter(field => 
      agentData?.[field] && agentData[field].toString().trim() !== '' && agentData[field] !== 'Agent'
    ).length + optionalFields.filter(field => 
      agentData?.[field] && agentData[field].toString().trim() !== ''
    ).length) / (requiredFields.length + optionalFields.length),
    reason: hasRequiredFields ? 'Profile complete' : `Missing: ${missingFields.join(', ')}`
  };
};
