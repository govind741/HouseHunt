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
import {LoginScreenProps} from '../../../types/authTypes';
import {handleUserLogin} from '../../../services/authServices';
import Toast from 'react-native-toast-message';
import {BASE_URL} from '../../../constant/urls';

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const [mobile, setMobile] = useState('');
  const [selectedTab, setSelectedTab] = useState<'phone' | 'gmail'>('phone');

  useEffect(() => {
    // Handle hardware back button
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
            <TouchableOpacity
              style={styles.googleSignInButton}
              onPress={() => {
                Alert.alert(
                  'Google Sign-In Not Available',
                  'Google sign-in is currently not available. Please use phone number to continue.',
                  [
                    {
                      text: 'Use Phone Number',
                      onPress: () => setSelectedTab('phone'),
                      style: 'default',
                    },
                    {
                      text: 'OK',
                      style: 'cancel',
                    },
                  ]
                );
              }}>
              <View style={styles.googleButtonContent}>
                <View style={styles.googleIconContainer}>
                  <MagicText style={styles.googleIcon}>G</MagicText>
                </View>
                <MagicText style={styles.googleButtonText}>
                  Sign in with Google
                </MagicText>
              </View>
            </TouchableOpacity>
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
  googleSignInButton: {
    marginHorizontal: 15,
    marginTop: 25,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 6,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3c4043',
  },
});
