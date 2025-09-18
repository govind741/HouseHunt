import {GoogleSignin} from '@react-native-google-signin/google-signin';

export const debugGoogleSignIn = async () => {
  console.log('=== Google Sign-In Debug ===');
  
  try {
    // Check if Google Play Services are available
    console.log('1. Checking Google Play Services...');
    const hasPlayServices = await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    console.log('✅ Google Play Services available:', hasPlayServices);
    
    // Check current configuration
    console.log('2. Checking configuration...');
    const isConfigured = GoogleSignin.isConfigured();
    console.log('✅ Google SignIn configured:', isConfigured);
    
    // Check if user is already signed in
    console.log('3. Checking current sign-in status...');
    const isSignedIn = await GoogleSignin.isSignedIn();
    console.log('✅ User already signed in:', isSignedIn);
    
    if (isSignedIn) {
      const currentUser = await GoogleSignin.getCurrentUser();
      console.log('✅ Current user:', currentUser?.user?.email);
    }
    
    console.log('=== Debug Complete ===');
    return true;
    
  } catch (error: any) {
    console.error('❌ Google Sign-In Debug Error:', {
      code: error.code,
      message: error.message,
      details: error
    });
    return false;
  }
};

export const getGoogleSignInErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'SIGN_IN_CANCELLED':
      return 'Sign-in was cancelled by user';
    case 'IN_PROGRESS':
      return 'Sign-in is already in progress';
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return 'Google Play Services not available';
    case 'SIGN_IN_REQUIRED':
      return 'User needs to sign in first';
    default:
      return error.message || 'Unknown Google Sign-In error';
  }
};
