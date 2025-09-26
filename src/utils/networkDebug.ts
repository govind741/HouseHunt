import {BASE_URL} from '../constant/urls';

export const testAPIConnection = async () => {
  try {
    console.log(`🔗 Testing API connection to ${BASE_URL}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(BASE_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('🔗 API Connection Test Result:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });
    
    return response.ok;
  } catch (error: any) {
    console.error('API Connection Test Failed:', {
      name: error.name,
      message: error.message,
    });
    return false;
  }
};

export const debugNetworkError = (error: any) => {
  console.log('Network Error Debug Info:', {
    errorType: error.constructor.name,
    message: error.message,
    code: error.code,
    status: error.status,
    response: error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    } : 'No response object',
    config: error.config ? {
      url: error.config.url,
      method: error.config.method,
      baseURL: error.config.baseURL,
      timeout: error.config.timeout,
    } : 'No config object',
  });
};
