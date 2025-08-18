import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Validates if a token is legitimate (not mock/test data)
 */
export const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  
  // Check for mock tokens
  if (token.includes('mock_') || token.includes('test_')) return false;
  
  // Check for invalid values
  if (token === 'null' || token === 'undefined') return false;
  
  // Check minimum length (real tokens should be longer)
  if (token.length < 10) return false;
  
  return true;
};

/**
 * Clears all authentication data from storage
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['token', 'userData', 'role', 'userId']);
    console.log('🧹 Cleared all authentication data');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

/**
 * Validates and cleans up authentication state on app start
 */
export const validateAuthState = async (): Promise<{
  isValid: boolean;
  token: string | null;
  userData: any | null;
}> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('userData');
    
    // Check if token is valid
    if (!isValidToken(token)) {
      console.log('❌ Invalid token found, clearing auth data');
      await clearAuthData();
      return { isValid: false, token: null, userData: null };
    }
    
    // Check if userData exists with valid token
    if (!userData) {
      console.log('❌ Token exists but no user data, clearing auth data');
      await clearAuthData();
      return { isValid: false, token: null, userData: null };
    }
    
    try {
      const parsedUserData = JSON.parse(userData);
      
      // Basic validation of user data
      if (!parsedUserData.id && !parsedUserData.userId) {
        console.log('❌ Invalid user data structure, clearing auth data');
        await clearAuthData();
        return { isValid: false, token: null, userData: null };
      }
      
      console.log('✅ Valid authentication state found');
      return { isValid: true, token, userData: parsedUserData };
      
    } catch (parseError) {
      console.log('❌ Error parsing user data, clearing auth data');
      await clearAuthData();
      return { isValid: false, token: null, userData: null };
    }
    
  } catch (error) {
    console.error('❌ Error validating auth state:', error);
    await clearAuthData();
    return { isValid: false, token: null, userData: null };
  }
};
