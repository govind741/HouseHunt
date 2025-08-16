import {ENDPOINT} from '../constant/urls';
import axiosInstance from '../axios';

export const handleAgentLogin = async (payload: {phone: string}) => {
  try {
    console.log('🔐 Agent Login Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.agent_login, payload);
    console.log('✅ Agent Login Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Agent Login Error:', error);
    throw error;
  }
};

export const handleUserLogin = async (payload: {phone: string}) => {
  try {
    console.log('🔐 User Login Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.user_login, payload);
    console.log('✅ User Login Success:', response);
    return response;
  } catch (error) {
    console.error('❌ User Login Error:', error);
    throw error;
  }
};

export const VerifyUserOtp = async (payload: {phone: string; otp: number}) => {
  try {
    console.log('🔢 User OTP Verification Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.verify_user, payload);
    console.log('✅ User OTP Verification Success:', response);
    return response;
  } catch (error) {
    console.error('❌ User OTP Verification Error:', error);
    throw error;
  }
};

export const VerifyAgentOtp = async (payload: {phone: string; otp: number}) => {
  try {
    console.log('🔢 Agent OTP Verification Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.verify_agent, payload);
    console.log('✅ Agent OTP Verification Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Agent OTP Verification Error:', error);
    throw error;
  }
};

export const handleUserResendOtp = async (payload: {phone: string}) => {
  try {
    console.log('🔄 User Resend OTP Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.resend_user_otp, payload);
    console.log('✅ User Resend OTP Success:', response);
    return response;
  } catch (error) {
    console.error('❌ User Resend OTP Error:', error);
    throw error;
  }
};

export const handleAgentResendOtp = async (payload: {phone: string}) => {
  try {
    console.log('🔄 Agent Resend OTP Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.resend_agent_otp, payload);
    console.log('✅ Agent Resend OTP Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Agent Resend OTP Error:', error);
    throw error;
  }
};

export const handleAgentSignup = async (payload: {phone: number; name: string}) => {
  try {
    console.log('📝 Agent Signup Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.agent_signup, payload);
    console.log('✅ Agent Signup Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Agent Signup Error:', error);
    throw error;
  }
};

export const handleUserSignup = async (payload: {phone: number; name: string}) => {
  try {
    console.log('📝 User Signup Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.user_signup, payload);
    console.log('✅ User Signup Success:', response);
    return response;
  } catch (error) {
    console.error('❌ User Signup Error:', error);
    throw error;
  }
};

export const handleUserDetails = async () => {
  try {
    console.log('👤 Get User Details Request');
    const response = await axiosInstance.get(ENDPOINT.get_user_details);
    console.log('✅ Get User Details Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get User Details Error:', error);
    throw error;
  }
};

export const getAgentDetails = async (agentId: number) => {
  try {
    console.log('🏢 Get Agent Details Request:', {agentId});
    const response = await axiosInstance.get(`${ENDPOINT.get_agent_details}/${agentId}`);
    console.log('✅ Get Agent Details Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Agent Details Error:', error);
    throw error;
  }
};

export const handleAgentDetails = async (agentId: number) => {
  try {
    console.log('🏢 Handle Agent Details Request:', {agentId});
    const response = await axiosInstance.get(`${ENDPOINT.get_agent_details}/${agentId}`);
    console.log('✅ Handle Agent Details Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Handle Agent Details Error:', error);
    throw error;
  }
};

export const getAgentPaymentDetails = async () => {
  try {
    console.log('💳 Get Agent Payment Details Request');
    const response = await axiosInstance.get(ENDPOINT.agent_payment_details);
    console.log('✅ Get Agent Payment Details Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Agent Payment Details Error:', error);
    throw error;
  }
};

export const updateAgentPaymentDetails = async (paymentData: any) => {
  try {
    console.log('💳 Update Agent Payment Details Request:', paymentData);
    const response = await axiosInstance.put(ENDPOINT.agent_payment_details, paymentData);
    console.log('✅ Update Agent Payment Details Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Update Agent Payment Details Error:', error);
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
    console.log('✅ Upload Agent Payment QR Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Upload Agent Payment QR Error:', error);
    throw error;
  }
};

export const handleGetWorkingLocations = async () => {
  try {
    console.log('📍 Get Working Locations Request');
    const response = await axiosInstance.get(ENDPOINT.work_location);
    console.log('✅ Get Working Locations Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Working Locations Error:', error);
    throw error;
  }
};

export const handleSaveWorkingLocations = async (locations: any[]) => {
  try {
    console.log('📍 Save Working Locations Request:', locations);
    const response = await axiosInstance.post(ENDPOINT.work_location, { location: locations });
    console.log('✅ Save Working Locations Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Save Working Locations Error:', error);
    throw error;
  }
};

export const handleGoogleAuth = async (googleData: {
  idToken: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
    familyName?: string;
    givenName?: string;
  };
}) => {
  try {
    console.log('🔐 Google Auth Request:', {
      hasIdToken: !!googleData.idToken,
      hasAccessToken: !!googleData.accessToken,
      userEmail: googleData.user.email,
      userName: googleData.user.name,
    });
    
    const response = await axiosInstance.post(ENDPOINT.google_auth, {
      idToken: googleData.idToken,
      accessToken: googleData.accessToken,
      user: googleData.user,
    });
    
    console.log('✅ Google Auth Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Google Auth Error:', error);
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
    console.log('✅ Update Agent Profile Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Update Agent Profile Error:', error);
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
    console.log('✅ Update User Profile Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Update User Profile Error:', error);
    throw error;
  }
};
