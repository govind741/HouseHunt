import {ENDPOINT} from '../constant/urls';
import axiosInstance from '../axios';

export const handleAgentLogin = async (payload: {phone: string}) => {
  try {
    if (__DEV__) console.log('Agent Login Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.agent_login, payload);
    if (__DEV__) console.log('Agent Login Success:', response);
    return response;
  } catch (error) {
    if (__DEV__) console.error('Agent Login Error:', error);
    throw error;
  }
};

export const handleUserLogin = async (payload: {phone: string}) => {
  try {
    if (__DEV__) console.log('User Login Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.user_login, payload);
    if (__DEV__) console.log('User Login Success:', response);
    return response;
  } catch (error) {
    if (__DEV__) console.error('User Login Error:', error);
    throw error;
  }
};

export const handleGoogleAuth = async (googleToken: string) => {
  try {
    if (__DEV__) console.log('Google Auth Request');
    const response = await axiosInstance.post(ENDPOINT.google_auth, {
      token: googleToken
    });
    if (__DEV__) console.log('Google Auth Success:', response);
    return response;
  } catch (error) {
    if (__DEV__) console.error('Google Auth Error:', error);
    throw error;
  }
};

export const VerifyUserOtp = async (payload: {phone: string; otp: number}) => {
  try {
    if (__DEV__) console.log('User OTP Verification Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.verify_user, payload);
    if (__DEV__) console.log('User OTP Verification Success:', response);
    return response;
  } catch (error) {
    if (__DEV__) console.error('User OTP Verification Error:', error);
    throw error;
  }
};

export const VerifyAgentOtp = async (payload: {phone: string; otp: number | string}) => {
  try {
    console.log('Agent OTP Verification Request:', {
      payload,
      endpoint: ENDPOINT.verify_agent,
      payloadType: typeof payload.otp,
    });
    const response = await axiosInstance.post(ENDPOINT.verify_agent, payload);
    console.log('Agent OTP Verification Success:', response);
    return response;
  } catch (error: any) {
    console.error('Agent OTP Verification Error:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data,
      requestPayload: payload,
      endpoint: ENDPOINT.verify_agent,
    });
    throw error;
  }
};

export const handleUserResendOtp = async (payload: {phone: string}) => {
  try {
    console.log('User Resend OTP Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.resend_user_otp, payload);
    console.log('User Resend OTP Success:', response);
    return response;
  } catch (error) {
    console.error('User Resend OTP Error:', error);
    throw error;
  }
};

export const handleAgentResendOtp = async (payload: {phone: string}) => {
  try {
    console.log('Agent Resend OTP Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.resend_agent_otp, payload);
    console.log('Agent Resend OTP Success:', response);
    return response;
  } catch (error) {
    console.error('Agent Resend OTP Error:', error);
    throw error;
  }
};

export const handleAgentSignup = async (payload: {phone: number; name: string}) => {
  try {
    console.log('Agent Signup Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.agent_signup, payload);
    console.log('Agent Signup Success:', response);
    return response;
  } catch (error) {
    console.error('Agent Signup Error:', error);
    throw error;
  }
};

export const handleUserSignup = async (payload: {phone: number; name: string}) => {
  try {
    console.log('User Signup Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.user_signup, payload);
    console.log('User Signup Success:', response);
    return response;
  } catch (error) {
    console.error('User Signup Error:', error);
    throw error;
  }
};

export const handleUserDetails = async (userId: number) => {
  try {
    console.log('Get User Details Request:', {userId});
    const response = await axiosInstance.get(`${ENDPOINT.get_user_details}/${userId}`);
    console.log('Get User Details Success:', response);
    return response;
  } catch (error) {
    console.error('Get User Details Error:', error);
    throw error;
  }
};

export const getAgentDetails = async (agentId: number) => {
  try {
    console.log('Get Agent Details Request:', {agentId});
    const response = await axiosInstance.get(`${ENDPOINT.get_agent_details}/${agentId}`);
    console.log('Get Agent Details Success:', response);
    return response;
  } catch (error: any) {
    console.error('Get Agent Details Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    
    // If 403, try the agent profile endpoint instead
    if (error?.response?.status === 403) {
      console.log('Trying agent profile endpoint instead...');
      try {
        const profileResponse = await axiosInstance.get(ENDPOINT.agent_profile);
        console.log('Agent Profile Success:', profileResponse);
        
        // Ensure the response has the expected structure
        if (profileResponse && typeof profileResponse === 'object') {
          // If the profile response doesn't have an id, add the agentId
          if (!profileResponse.id && !profileResponse.data?.id) {
            if (profileResponse.data) {
              profileResponse.data.id = agentId;
            } else {
              profileResponse.id = agentId;
            }
          }
        }
        
        return profileResponse;
      } catch (profileError: any) {
        console.error('Agent Profile Error:', profileError);
        
        // If profile endpoint also fails, try working locations endpoint
        if (profileError?.response?.status === 403) {
          console.log('Trying agent working locations endpoint...');
          try {
            const locationsResponse = await axiosInstance.get(ENDPOINT.agent_working_locations);
            console.log('Agent Working Locations Success:', locationsResponse);
            
            // Create a minimal agent object from locations response
            const agentData = {
              id: agentId,
              name: 'Agent',
              phone: '',
              email: '',
              role: 'agent',
              working_locations: locationsResponse?.data || locationsResponse,
            };
            
            return { data: agentData };
          } catch (locationsError) {
            console.error('Agent Working Locations Error:', locationsError);
            throw locationsError;
          }
        }
        
        throw profileError;
      }
    }
    
    throw error;
  }
};

export const handleAgentDetails = async (agentId: number) => {
  try {
    console.log('Handle Agent Details Request:', {agentId});
    const response = await axiosInstance.get(`${ENDPOINT.get_agent_details}/${agentId}`);
    console.log('Handle Agent Details Success:', response);
    return response;
  } catch (error: any) {
    // Check if this is the specific agent property permission error (including user-friendly version)
    if (error?.response?.status === 403 && 
        (error?.response?.data?.message?.includes('Agent is not allowed to view this property') ||
         error?.response?.data?.userFriendly === true)) {
      // Don't log redundantly - axios interceptor already handles this
      throw error;
    }
    
    // Log other errors normally
    console.error('Handle Agent Details Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });
    
    // If 403, try the agent profile endpoint instead
    if (error?.response?.status === 403) {
      console.log('Trying agent profile endpoint instead...');
      try {
        const profileResponse = await axiosInstance.get(ENDPOINT.agent_profile);
        console.log('Agent Profile Success:', profileResponse);
        return profileResponse;
      } catch (profileError) {
        console.error('Agent Profile Error:', profileError);
        throw profileError;
      }
    }
    
    throw error;
  }
};

// New agent-specific API functions
export const getAgentProfile = async () => {
  try {
    console.log('Get Agent Profile Request');
    const response = await axiosInstance.get(ENDPOINT.agent_profile);
    console.log('Get Agent Profile Success:', response);
    return response;
  } catch (error) {
    console.error('Get Agent Profile Error:', error);
    throw error;
  }
};

export const getAgentOfficeAddress = async () => {
  try {
    if (__DEV__) console.log('Get Agent Office Address Request');
    const response = await axiosInstance.get(ENDPOINT.agent_office_address);
    if (__DEV__) console.log('Get Agent Office Address Success:', response);
    return response;
  } catch (error: any) {
    // Handle 500 errors gracefully by returning fallback data (no logging)
    if (error?.response?.status === 500) {
      return {
        data: {
          success: false,
          message: 'Office address temporarily unavailable',
          data: {
            address: '',
            city: '',
            state: '',
            pincode: '',
          }
        }
      };
    }
    
    // Only log non-500 errors
    if (__DEV__) console.error('Get Agent Office Address Error:', error);
    
    // For other errors, still throw
    throw error;
  }
};

export const getAgentWorkingLocations = async () => {
  try {
    console.log('Get Agent Working Locations Request');
    const response = await axiosInstance.get(ENDPOINT.agent_working_locations);
    console.log('Get Agent Working Locations Success:', response);
    return response;
  } catch (error) {
    console.error('Get Agent Working Locations Error:', error);
    throw error;
  }
};

export const getAgentPaymentDetails = async () => {
  try {
    console.log('💳 Get Agent Payment Details Request');
    const response = await axiosInstance.get(ENDPOINT.agent_payment_details);
    console.log('Get Agent Payment Details Success:', response);
    return response;
  } catch (error) {
    console.error('Get Agent Payment Details Error:', error);
    throw error;
  }
};

export const updateAgentPaymentDetails = async (paymentData: any) => {
  try {
    console.log('💳 Update Agent Payment Details Request:', paymentData);
    const response = await axiosInstance.put(ENDPOINT.agent_payment_details, paymentData);
    console.log('Update Agent Payment Details Success:', response);
    return response;
  } catch (error) {
    console.error('Update Agent Payment Details Error:', error);
    throw error;
  }
};

export const uploadAgentPaymentQR = async (formData: FormData) => {
  try {
    console.log('📷 Upload Agent Payment QR Request');
    const response = await axiosInstance.post(ENDPOINT.agent_payment_qr_upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload Agent Payment QR Success:', response);
    return response;
  } catch (error) {
    console.error('Upload Agent Payment QR Error:', error);
    throw error;
  }
};

export const handleGetWorkingLocations = async () => {
  try {
    console.log('Get Working Locations Request');
    const response = await axiosInstance.get(ENDPOINT.work_location);
    console.log('Get Working Locations Success:', response);
    return response;
  } catch (error) {
    console.error('Get Working Locations Error:', error);
    throw error;
  }
};

export const handleSaveWorkingLocations = async (locations: any[]) => {
  try {
    console.log('Save Working Locations Request:', locations);
    const response = await axiosInstance.post(ENDPOINT.work_location, { location: locations });
    console.log('Save Working Locations Success:', response);
    return response;
  } catch (error) {
    console.error('Save Working Locations Error:', error);
    throw error;
  }
};

export const handleAgentUpdateProfile = async (payload: any) => {
  try {
    console.log('✏️ Update Agent Profile Request');
    const response = await axiosInstance.patch(
      ENDPOINT.update_agent_profile,
      payload
    );
    console.log('Update Agent Profile Success:', response);
    return response;
  } catch (error) {
    console.error('Update Agent Profile Error:', error);
    throw error;
  }
};

export const handleUserUpdateProfile = async (payload: any) => {
  try {
    console.log('✏️ Update User Profile Request:', {
      dataType: payload instanceof FormData ? 'FormData' : typeof payload,
      isFormData: payload instanceof FormData
    });
    
    // Don't manually set Content-Type - let axios interceptor handle it properly
    const response = await axiosInstance.patch(
      ENDPOINT.update_user_profile,
      payload
    );
    console.log('Update User Profile Success:', response);
    return response;
  } catch (error) {
    console.error('Update User Profile Error:', error);
    throw error;
  }
};
