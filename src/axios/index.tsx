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
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing stored auth data');
      await AsyncStorage.multiRemove(['token', 'userData', 'role', 'userId']);
    }
    
    // Enhanced 403 error handling for agent endpoints
    if (error.response?.status === 403 && error.config?.url?.includes('agent')) {
      console.log('🚫 Agent endpoint forbidden - checking auth state');
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      const userId = await AsyncStorage.getItem('userId');
      
      console.log('🔍 Auth state check:', {
        hasToken: !!token,
        role,
        userId,
        endpoint: error.config.url,
      });
      
      // If we have a token but still get 403, it might be a role/permission issue
      if (token && role !== 'agent') {
        console.log('⚠️ Token exists but role is not agent - possible role mismatch');
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
