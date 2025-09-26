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
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set default headers
    if (config.headers && !config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }
    
    if (config.headers && !config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    // Handle 401 errors
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'userData', 'role', 'userId']);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
