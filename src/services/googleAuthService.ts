import {GoogleSignin} from '@react-native-google-signin/google-signin';
import GOOGLE_CONFIG from '../config/googleConfig';

export interface GoogleUserInfo {
  id: string;
  name: string;
  email: string;
  photo?: string;
  familyName?: string;
  givenName?: string;
}

export interface GoogleAuthResponse {
  user: GoogleUserInfo;
  idToken: string;
  accessToken: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile?: string;
    role: string;
    status: number;
  };
  tokens?: string;
  token?: string;
}

class GoogleAuthService {
  /**
   * Configure Google Sign-In
   * Call this once in your app initialization
   */
  static configure(webClientId: string) {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  /**
   * Check if Google Sign-In is available
   */
  static isAvailable(): boolean {
    return true; // Assume available for now
  }

  /**
   * Sign in with Google
   */
  static async signIn(): Promise<GoogleAuthResponse> {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      return {
        user: {
          id: userInfo.user.id,
          name: userInfo.user.name || '',
          email: userInfo.user.email,
          photo: userInfo.user.photo || undefined,
          familyName: userInfo.user.familyName || undefined,
          givenName: userInfo.user.givenName || undefined,
        },
        idToken: userInfo.idToken || '',
        accessToken: userInfo.accessToken || '',
      };
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      throw error;
    }
  }

  /**
   * Sign out from Google
   */
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log('✅ Google Sign-Out successful');
    } catch (error) {
      console.error('❌ Google Sign-Out Error:', error);
      throw error;
    }
  }

  /**
   * Revoke access (complete sign out)
   */
  static async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
      console.log('✅ Google access revoked');
    } catch (error) {
      console.error('❌ Google Revoke Access Error:', error);
      throw error;
    }
  }

  /**
   * Get current user info if signed in
   */
  static async getCurrentUser(): Promise<GoogleUserInfo | null> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      if (userInfo) {
        return {
          id: userInfo.user.id,
          name: userInfo.user.name || '',
          email: userInfo.user.email,
          photo: userInfo.user.photo || undefined,
          familyName: userInfo.user.familyName || undefined,
          givenName: userInfo.user.givenName || undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Get Current User Error:', error);
      return null;
    }
  }

  /**
   * Check if user is signed in
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('❌ Is Signed In Error:', error);
      return false;
    }
  }

  /**
   * Send Google token to your backend for verification and authentication
   */
  static async authenticateWithBackend(googleAuthResponse: GoogleAuthResponse): Promise<BackendAuthResponse> {
    try {
      console.log('🔐 Authenticating with backend using axiosInstance...');
      
      // Import the auth service function
      const { handleGoogleAuth } = require('./authServices');
      
      const googleData = {
        idToken: googleAuthResponse.idToken,
        accessToken: googleAuthResponse.accessToken,
        user: {
          id: googleAuthResponse.user.id,
          name: googleAuthResponse.user.name,
          email: googleAuthResponse.user.email,
          photo: googleAuthResponse.user.photo,
          familyName: googleAuthResponse.user.familyName,
          givenName: googleAuthResponse.user.givenName,
        },
      };

      console.log('📤 Sending Google auth request...');
      const response = await handleGoogleAuth(googleData);
      
      console.log('✅ Backend authentication successful:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
        hasToken: !!(response.tokens || response.token),
      });

      return response;
    } catch (error) {
      console.error('❌ Backend Authentication Error:', error);
      throw error;
    }
  }

  /**
   * Complete Google Sign-In flow with backend authentication
   */
  static async completeGoogleSignIn(): Promise<{
    googleAuth: GoogleAuthResponse;
    backendAuth: BackendAuthResponse;
  }> {
    try {
      // Step 1: Sign in with Google
      console.log('🔐 Step 1: Google Sign-In...');
      const googleAuthResponse = await this.signIn();
      
      // Step 2: Authenticate with backend
      console.log('🔐 Step 2: Backend authentication...');
      const backendAuthResponse = await this.authenticateWithBackend(googleAuthResponse);
      
      return {
        googleAuth: googleAuthResponse,
        backendAuth: backendAuthResponse,
      };
    } catch (error) {
      console.error('❌ Complete Google Sign-In Error:', error);
      throw error;
    }
  }
}

export default GoogleAuthService;
