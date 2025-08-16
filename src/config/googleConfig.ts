// Google Sign-In Configuration
import { BASE_URL, ENDPOINT } from '../constant/urls';

export const GOOGLE_CONFIG = {
  // Web Client ID from Google Cloud Console
  // This is required for React Native Google Sign-In
  // TODO: Replace with your actual Web Client ID
  WEB_CLIENT_ID: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
  
  // Your backend API endpoint for Google authentication
  BACKEND_AUTH_URL: `${BASE_URL}${ENDPOINT.google_auth}`,
  
  // Optional: iOS Client ID (if you plan to support iOS)
  IOS_CLIENT_ID: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
};

// Validation function to check if configuration is set up
export const validateGoogleConfig = (): boolean => {
  if (GOOGLE_CONFIG.WEB_CLIENT_ID === '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com') {
    console.warn('⚠️ Google Sign-In: Please update WEB_CLIENT_ID in src/config/googleConfig.ts');
    return false;
  }
  return true;
};

export default GOOGLE_CONFIG;
