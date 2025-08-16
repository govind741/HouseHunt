import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {IMAGE} from '../../../assets/images';
import TextField from '../../../components/TextField';
import Button from '../../../components/Button';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import {LoginScreenProps} from '../../../types/authTypes';
import {handleUserLogin} from '../../../services/authServices';
import Toast from 'react-native-toast-message';
import {BASE_URL} from '../../../constant/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch} from '../../../store';
import {setToken, setUserData} from '../../../store/slice/authSlice';


// Conditional imports for Google Sign-In to prevent crashes
let GoogleAuthService: any = null;
let GoogleIcon: any = null;
let GOOGLE_CONFIG: any = null;

try {
  GoogleAuthService = require('../../../services/googleAuthService').default;
  GoogleIcon = require('../../../components/GoogleIcon').default;
  GOOGLE_CONFIG = require('../../../config/googleConfig').default;
} catch (error) {
  // Google Sign-In components not available
}

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const [mobile, setMobile] = useState('');
  const [selectedTab, setSelectedTab] = useState<'phone' | 'gmail'>('phone');
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only attempt Google Sign-In configuration if everything is properly available
    let shouldConfigureGoogle = false;
    
    try {
      // Check if all required components are available
      if (GoogleAuthService && 
          GOOGLE_CONFIG && 
          GoogleAuthService.isAvailable && 
          typeof GoogleAuthService.isAvailable === 'function') {
        
        // Test availability
        const isAvailable = GoogleAuthService.isAvailable();
        if (isAvailable) {
          shouldConfigureGoogle = true;
        } else {
          // Google Sign-In not available
        }
      } else {
        // Google Sign-In components missing or invalid
      }
    } catch (error) {
      // Error checking Google Sign-In availability
      shouldConfigureGoogle = false;
    }

    // Only configure if all checks passed
    if (shouldConfigureGoogle) {
      try {
        const configSuccess = GoogleAuthService.configure(GOOGLE_CONFIG.WEB_CLIENT_ID);
        if (configSuccess) {
          // Google Sign-In configured successfully
        } else {
          // Google Sign-In configuration returned false
        }
      } catch (error) {
        // Exception during Google Sign-In configuration
      }
    } else {
      // Skipping Google Sign-In configuration - not available
    }
    
    const backAction = () => {
      Alert.alert('Are you sure want to exit?', '', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Exit', onPress: () => BackHandler.exitApp(), style: 'default'},
      ]);
      return true;
    };
    
    const backhandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backhandler.remove();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!GoogleAuthService) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In not available',
        text2: 'Please use mobile number login',
      });
      return;
    }

    if (!GoogleAuthService.isAvailable()) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In not configured',
        text2: 'Please use mobile number login or install Google Play Services',
      });
      return;
    }

    try {
      // Complete Google Sign-In with backend authentication
      const {googleAuth, backendAuth} = await GoogleAuthService.completeGoogleSignIn();
      
      if (!backendAuth.success) {
        throw new Error(backendAuth.message || 'Backend authentication failed');
      }

      Toast.show({
        type: 'success',
        text1: 'Google Sign-In successful!',
        text2: `Welcome ${googleAuth.user.name}`,
      });

      // Handle the response based on the backend data
      if (backendAuth.data && backendAuth.data.id) {
        // User exists in backend, save data and navigate to home
        const userData = {
          id: backendAuth.data.id,
          name: backendAuth.data.name || googleAuth.user.name,
          email: backendAuth.data.email || googleAuth.user.email,
          phone: backendAuth.data.phone || '',
          profile: backendAuth.data.profile || googleAuth.user.photo || '',
          role: backendAuth.data.role || 'user',
          status: backendAuth.data.status || 1,
        };

        // Save to AsyncStorage and Redux
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('token', backendAuth.tokens || backendAuth.token || '');
        await AsyncStorage.setItem('role', userData.role);
        
        // Update Redux state
        dispatch(setUserData(userData));
        dispatch(setToken(backendAuth.tokens || backendAuth.token || ''));

        // Navigate to home
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'HomeScreenStack',
              params: {
                screen: 'HomeScreen',
              },
            },
          ],
        });
      } else {
        // New user, navigate to signup screen
        navigation.navigate('UserSignupScreen', {
          mobile_number: '', // No mobile for Google login
          email: googleAuth.user.email,
          googleUser: googleAuth.user,
          isGoogleLogin: true,
          token: backendAuth.tokens || backendAuth.token || '',
        });
      }
      
    } catch (error: any) {
      
      let errorMessage = 'Google Sign-In failed';
      let errorTitle = 'Google Sign-In Failed';
      
      // Handle specific error types
      if (error.message && error.message.includes('not available')) {
        errorTitle = 'Google Sign-In Unavailable';
        errorMessage = 'Google Sign-In is not available on this device. Please use mobile number login.';
      } else if (error.message && error.message.includes('NativeModule')) {
        errorTitle = 'Google Services Missing';
        errorMessage = 'Google Play Services not installed. Please use mobile number login.';
      } else if (error.code === 'SIGN_IN_CANCELLED') {
        errorTitle = 'Sign-In Cancelled';
        errorMessage = 'Google Sign-In was cancelled by user';
      } else if (error.code === 'IN_PROGRESS') {
        errorTitle = 'Sign-In In Progress';
        errorMessage = 'Google Sign-In is already in progress';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorTitle = 'Google Play Services Required';
        errorMessage = 'Please install Google Play Services or use mobile number login';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
      });
    }
  };
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
    <View style={styles.parent}>
      <View>
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
              Gmail
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
            {/* Google Sign-In Section - Only show if available and properly configured */}
            {GoogleAuthService && GoogleIcon && GoogleAuthService.isAvailable && GoogleAuthService.isAvailable() ? (
              <GoogleSignInButton onPress={handleGoogleSignIn} />
            ) : (
              <View style={styles.unavailableContainer}>
                <MagicText style={styles.unavailableText}>
                  Google Sign-In is not available on this device
                </MagicText>
                <MagicText style={styles.unavailableSubText}>
                  Please use phone number login instead
                </MagicText>
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.bottomView}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AgentLoginScreen')}
          style={styles.agentBtn}>
          <MagicText style={styles.agentText}>Agent Log in</MagicText>
        </TouchableOpacity>
        <MagicText style={styles.termsHeaderText}>
          By continuing, you agree to our
        </MagicText>
        <View style={styles.textRow}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`${BASE_URL}/v1/auth/terms`);
            }}>
            <MagicText style={styles.termsText}>Terms of Service ,</MagicText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.horizontalView}
            onPress={() => {
              Linking.openURL(`${BASE_URL}v1/auth/privacy-policy`);
            }}>
            <MagicText style={styles.termsText}>Privacy Policy ,</MagicText>
          </TouchableOpacity>
          <TouchableOpacity>
            <MagicText style={styles.termsText}>Content Policy</MagicText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  signinText: {
    fontSize: 16,
  },
  signinView: {
    flex: 1,
    alignItems: 'center',
    marginRight: 22,
  },
  moibleText: {
    fontSize: 14,
    marginBottom: 12,
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
  orText: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    fontWeight: '600',
    paddingHorizontal: 15,
  },
  socialContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  agentBtn: {
    borderWidth: 1,
    borderRadius: 25,
    borderColor: COLORS.GRAY,
    paddingHorizontal: 12,
    marginBottom: 25,
  },
  agentText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.GRAY,
    // fontWeight: '700',
  },
  agentText1: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: '700',
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
    backgroundColor: COLORS.WHITE_SMOKE,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_GRAY,
  },
  activeTabText: {
    color: COLORS.BLACK,
  },
  unavailableContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    padding: 20,
    backgroundColor: COLORS.WHITE_SMOKE,
    borderRadius: 8,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 8,
  },
  unavailableSubText: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
  },
});
