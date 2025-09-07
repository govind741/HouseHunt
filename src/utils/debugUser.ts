import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugUserData = async () => {
  try {
    console.log('=== USER DATA DEBUG ===');
    
    // Check AsyncStorage
    const storedUserData = await AsyncStorage.getItem('userData');
    const storedToken = await AsyncStorage.getItem('token');
    const storedRole = await AsyncStorage.getItem('role');
    
    console.log('AsyncStorage Data:');
    console.log('  Token:', storedToken ? 'Present' : 'Missing');
    console.log('  Role:', storedRole);
    console.log('  UserData:', storedUserData ? JSON.parse(storedUserData) : 'Missing');
    
    return {
      token: storedToken,
      role: storedRole,
      userData: storedUserData ? JSON.parse(storedUserData) : null,
    };
  } catch (error) {
    console.error('Error debugging user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove(['userData', 'token', 'role', 'userId']);
    console.log('🧹 Cleared all user data from AsyncStorage');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
