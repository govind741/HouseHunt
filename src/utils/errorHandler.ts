import {AxiosError} from 'axios';
import Toast from 'react-native-toast-message';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
  endpoint?: string;
}

export const handleApiError = (error: AxiosError, endpoint?: string): ApiError => {
  console.log('🚨 API Error Details:', {
    endpoint,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    headers: error.response?.headers,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      headers: error.config?.headers,
    },
  });

  const status = error.response?.status || 0;
  let message = 'An unexpected error occurred';
  let details = null;

  switch (status) {
    case 400:
      message = 'Bad Request - Please check your input';
      details = error.response?.data;
      break;
    case 401:
      message = 'Unauthorized - Please login again';
      break;
    case 403:
      message = 'Forbidden - You don\'t have permission';
      break;
    case 404:
      message = 'Not Found - The requested resource was not found';
      break;
    case 422:
      message = 'Validation Error - Please check your input';
      details = error.response?.data;
      break;
    case 500:
      message = 'Server Error - Please try again later';
      details = error.response?.data;
      console.error('🔥 500 Server Error Details:', {
        endpoint,
        serverResponse: error.response?.data,
        requestData: error.config?.data,
        timestamp: new Date().toISOString(),
      });
      break;
    case 502:
      message = 'Bad Gateway - Server is temporarily unavailable';
      break;
    case 503:
      message = 'Service Unavailable - Server is down for maintenance';
      break;
    default:
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        message = 'Network Error - Please check your internet connection';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request Timeout - Please try again';
      }
      break;
  }

  return {
    status,
    message,
    details,
    endpoint,
  };
};

export const showErrorToast = (apiError: ApiError) => {
  Toast.show({
    type: 'error',
    text1: `Error ${apiError.status}`,
    text2: apiError.message,
    visibilityTime: 4000,
  });
};

export const logErrorForDebugging = (apiError: ApiError, context?: string) => {
  console.group(`🐛 Error Debug Info ${context ? `- ${context}` : ''}`);
  console.log('Status:', apiError.status);
  console.log('Message:', apiError.message);
  console.log('Endpoint:', apiError.endpoint);
  console.log('Details:', apiError.details);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
};
