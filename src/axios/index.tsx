import axios, {AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../constant/urls';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Add token if available
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role');
    const userId = await AsyncStorage.getItem('userId');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set default headers only if not already set
    if (config.headers && !config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }
    
    // Only set Content-Type for non-FormData requests
    if (config.headers && !config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Add debug logging for agent requests
    if (config.url?.includes('agent')) {
      console.log('🔍 Agent API Request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        role,
        userId,
        headers: {
          Authorization: config.headers?.Authorization ? 'Bearer [PRESENT]' : 'MISSING',
          'Content-Type': config.headers?.['Content-Type'],
          Accept: config.headers?.Accept,
        }
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  },
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Add debug logging for agent responses
    if (response.config.url?.includes('agent')) {
      console.log('✅ Agent API Response:', {
        url: response.config.url,
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : [],
      });
    }
    return response.data;
  },
  async (error: AxiosError) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing stored auth data');
      await AsyncStorage.multiRemove(['token', 'userData', 'role', 'userId']);
    }
    
    // Enhanced 403 error handling for agent property access
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage?.includes('Agent is not allowed to view this property')) {
        // Provide user-friendly error message without redundant logging
        const enhancedError = {
          ...error,
          response: {
            ...error.response,
            data: {
              ...error.response.data,
              message: 'You do not have permission to view this property. Please contact support if you believe this is an error.',
              userFriendly: true
            }
          }
        };
        return Promise.reject(enhancedError);
      }
      
      // Log other 403 errors normally
      console.log('🚫 Access forbidden:', errorMessage);
    }

    // Only log errors that aren't the specific agent property permission error
    if (!(error.response?.status === 403 && error.response?.data?.message?.includes('Agent is not allowed to view this property'))) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
