import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {IMAGE} from '../../../assets/images';
import TextField from '../../../components/TextField';
import Button from '../../../components/Button';
import {LoginScreenProps} from '../../../types/authTypes';
import {handleUserLogin} from '../../../services/authServices';
import Toast from 'react-native-toast-message';
import {BASE_URL} from '../../../constant/urls';
import {GoogleIcon} from '../../../assets/icons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {handleGoogleAuth} from '../../../services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch} from '../../../store';
import {setToken, setUserData, setGuestMode} from '../../../store/slice/authSlice';

// Configuration for Google Sign-In button style
// 'white' - White background with border (recommended for most cases)
// 'blue' - Blue background with white text (alternative official style)
const GOOGLE_BUTTON_VARIANT: 'white' | 'blue' = 'white'; // Change to 'blue' for blue variant

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '1083768578728-v4hihcrlbmvg2j4i2p2tc9988tnddu8m.apps.googleusercontent.com',
  offlineAccess: true,
  hostedDomain: '', // specify a domain if needed
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
});

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const [mobile, setMobile] = useState('');
  const [selectedTab, setSelectedTab] = useState<'phone' | 'gmail'>('phone');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('🔵 Starting Google Sign-In...');
      
      // Check if device supports Google Play Services
      console.log('🔵 Checking Google Play Services...');
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      console.log('✅ Google Play Services available');
      
      // Sign in with Google
      console.log('🔵 Attempting Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful:', {
        hasIdToken: !!userInfo.data?.idToken,
        userEmail: userInfo.data?.user?.email,
        userName: userInfo.data?.user?.name
      });
      
      if (userInfo.data?.idToken) {
        console.log('🔵 Sending token to backend...');
        // Send Google token to your backend
        const response = await handleGoogleAuth(userInfo.data.idToken);
        console.log('✅ Backend response:', response.data);
        
        if (response.data && response.data.success) {
          // User exists or was created successfully
          await AsyncStorage.setItem('token', response.data.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
          await AsyncStorage.setItem('role', 'user');
          
          // Update Redux state
          dispatch(setToken(response.data.data.token));
          dispatch(setUserData(response.data.data.user));
          dispatch(setGuestMode(false));
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: response.data.message || 'Signed in with Google successfully!',
          });
          
          // Navigate to app
          navigation.reset({
            index: 0,
            routes: [{name: 'AppRoutes'}],
          });
        } else {
          console.error('❌ Backend rejected Google auth:', response.data);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.data?.message || 'Google authentication failed',
          });
        }
      } else {
        console.error('❌ No ID token received from Google');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to get authentication token from Google',
        });
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', {
        code: error.code,
        message: error.message,
        responseData: error?.response?.data
      });
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('ℹ️ User cancelled Google Sign-In');
        return;
      }
      
      // Handle specific backend errors
      if (error?.response?.data) {
        const backendError = error.response.data;
        
        if (backendError.message?.includes('not registered') || backendError.message?.includes('signup required')) {
          // User needs to sign up first
          Toast.show({
            type: 'info',
            text1: 'Account Not Found',
            text2: 'Please sign up first with Google',
          });
          
          // Navigate to signup screen with Google data
          navigation.navigate('SignupScreen', {
            googleUserInfo: userInfo?.data?.user,
            googleToken: userInfo?.data?.idToken
          });
          return;
        }
      }
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      switch (error.code) {
        case 'PLAY_SERVICES_NOT_AVAILABLE':
          errorMessage = 'Google Play Services not available. Please update Google Play Services.';
          break;
        case 'IN_PROGRESS':
          errorMessage = 'Sign-in already in progress. Please wait.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Error',
        text2: errorMessage,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Remove the individual BackHandler - now handled centrally
  // The centralized back handler will show exit prompt on LoginScreen

  const handleSignIn = () => {
    // Basic validation
    if (!mobile.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter mobile number',
      });
      return;
    }

    // Validate mobile number (exactly 10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid 10-digit mobile number',
      });
      return;
    }

    // Handle mobile number login
    const payload = {
      phone: mobile
    };

    if (__DEV__) console.log('Sending login request:', payload);

    handleUserLogin(payload)
      .then((res: any) => {
        if (__DEV__) console.log('Login success:', res);
        Toast.show({
          type: 'success',
          text1: res?.message || 'OTP sent to your mobile',
        });
        navigation.navigate('OtpScreen', {mobile, screen: 'user'});
      })
      .catch(error => {
        if (__DEV__) console.log('Login error:', error);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Something went wrong. Please try again.',
        });
      });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.parent} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Image source={IMAGE.COMPANY_LOGO} style={styles.logoStyle} />
        <View style={styles.row}>
          <View style={styles.hr} />
          <MagicText style={styles.continueText}>Log in or sign up</MagicText>
          <View style={styles.hr} />
        </View>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'phone' && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab('phone')}
            activeOpacity={0.8}>
            <MagicText
              style={[
                styles.tabText,
                selectedTab === 'phone' && styles.activeTabText,
              ]}>
              Phone
            </MagicText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'gmail' && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab('gmail')}
            activeOpacity={0.8}>
            <MagicText
              style={[
                styles.tabText,
                selectedTab === 'gmail' && styles.activeTabText,
              ]}>
              Email
            </MagicText>
          </TouchableOpacity>
        </View>

        {/* Conditional Content Based on Selected Tab */}
        {selectedTab === 'phone' ? (
          <>
            <TextField
              placeholder="Enter Mobile Number"
              inputStyle={styles.inputStyle}
              style={styles.input}
              onChangeText={number => setMobile(number)}
              maxLength={10}
              showCountryCode={true}
              keyboardType="number-pad"
              value={mobile}
            />
            <Button
              label="Continue"
              style={styles.btnStyle}
              labelStyle={styles.btnLabel}
              onPress={() => handleSignIn()}
            />
          </>
        ) : (
          <>
            {/* Google Sign-In Button - Following Official Google Design Guidelines */}
            <TouchableOpacity
              style={
                GOOGLE_BUTTON_VARIANT === 'blue'
                  ? styles.googleSignInButtonBlue
                  : styles.googleSignInButton
              }
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
              activeOpacity={0.8}>
              <View style={styles.googleButtonContent}>
                <View
                  style={
                    GOOGLE_BUTTON_VARIANT === 'blue'
                      ? styles.googleIconContainer
                      : styles.googleIconContainerWhite
                  }>
                  <GoogleIcon width={18} height={18} />
                </View>
                <MagicText
                  style={
                    GOOGLE_BUTTON_VARIANT === 'blue'
                      ? styles.googleButtonTextWhite
                      : styles.googleButtonText
                  }>
                  {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
                </MagicText>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomView}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AgentLoginScreen')}
            style={styles.agentBtn}>
            <MagicText style={styles.agentText}>Agent</MagicText>
          </TouchableOpacity>
          <MagicText style={styles.termsHeaderText}>
            By continuing, you agree to our
          </MagicText>
          <View style={styles.textRow}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`${BASE_URL}/v1/auth/terms`);
            }}>
            <MagicText style={styles.termsText}>Terms of Service </MagicText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.horizontalView}
            onPress={() => {
              Linking.openURL(`${BASE_URL}v1/auth/privacy-policy`);
            }}>
            <MagicText style={styles.termsText}>Privacy Policy </MagicText>
          </TouchableOpacity>
          <TouchableOpacity>
            <MagicText style={styles.termsText}>Content Policy</MagicText>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  logoStyle: {
    width: '100%',
    height: 380,
    resizeMode: 'cover',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  continueText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.TEXT_GRAY,
    fontWeight: '800',
  },
  inputStyle: {
    marginLeft: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 0.4,
    backgroundColor: COLORS.WHITE_SMOKE,
    marginHorizontal: 15,
  },
  btnStyle: {
    paddingVertical: 12,
    marginTop: 25,
    marginHorizontal: 15,
  },
  bottomView: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  btnLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  hr: {
    flex: 1,
    borderWidth: 0.2,
    borderColor: COLORS.GRAY,
    marginHorizontal: 10,
  },
 agentBtn: {
   borderRadius: 25,
   backgroundColor: '#007BFF',
   paddingHorizontal: 20,
   paddingVertical: 8,
   marginBottom: 25,
   alignItems: 'center',
 },

 agentText: {
   fontSize: 14,
   lineHeight: 21,
   color: COLORS.WHITE,
   fontWeight: '600',
 },

  termsHeaderText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.BLACK,
    textDecorationLine: 'underline',
  },
  horizontalView: {marginHorizontal: 8},
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },

  activeTabButton: {
    backgroundColor: COLORS.WHITE,
    // subtle “raised” feel
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  activeTabText: {
    color: '#111827',
    fontWeight: '700',
  },

  // Google Sign-In Button Styles (White variant - Official Google Design)
  googleSignInButton: {
    marginHorizontal: 15,
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // Hover and focus states would be handled by activeOpacity
  },
  
  // Alternative Blue Google Sign-In Button (also official)
  googleSignInButtonBlue: {
    marginHorizontal: 15,
    marginTop: 25,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // White background for icon in blue button
    borderRadius: 2,
    padding: 1,
  },
  googleIconContainerWhite: {
    width: 20,
    height: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
    fontFamily: 'Roboto', // Google's preferred font
    letterSpacing: 0.25,
  },
  googleButtonTextWhite: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Roboto', // Google's preferred font
    letterSpacing: 0.25,
  },
});
