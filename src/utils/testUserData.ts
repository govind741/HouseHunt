import AsyncStorage from '@react-native-async-storage/async-storage';

export const testUserDataFlow = async () => {
  try {
    console.log('🧪 === USER DATA FLOW TEST ===');
    
    // Test 1: Check AsyncStorage
    const storedUserData = await AsyncStorage.getItem('userData');
    const storedToken = await AsyncStorage.getItem('token');
    const storedRole = await AsyncStorage.getItem('role');
    
    console.log('📱 AsyncStorage Test:');
    console.log('  Token:', storedToken ? 'Present' : 'Missing');
    console.log('  Role:', storedRole);
    
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      console.log('  UserData:', {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        role: userData.role,
        hasName: !!userData.name,
        nameLength: userData.name ? userData.name.length : 0,
      });
    } else {
      console.log('  UserData: Missing');
    }
    
    // Test 2: Create mock user data to verify the flow
    const mockUserData = {
      id: '12345',
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      role: 'user',
      profile: '',
      status: 1,
      location: null,
    };
    
    console.log('🧪 Testing with mock data:', mockUserData);
    await AsyncStorage.setItem('userData', JSON.stringify(mockUserData));
    
    // Verify it was saved
    const savedMockData = await AsyncStorage.getItem('userData');
    if (savedMockData) {
      const parsedMockData = JSON.parse(savedMockData);
      console.log('✅ Mock data saved and retrieved:', parsedMockData);
    }
    
    return {
      hasToken: !!storedToken,
      hasUserData: !!storedUserData,
      userData: storedUserData ? JSON.parse(storedUserData) : null,
    };
    
  } catch (error) {
    console.error('❌ Error in user data flow test:', error);
    return null;
  }
};

export const clearAllUserData = async () => {
  try {
    await AsyncStorage.multiRemove(['userData', 'token', 'role', 'userId']);
    console.log('🧹 Cleared all user data');
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
  }
};
