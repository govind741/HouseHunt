import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {IMAGE} from '../../../assets/images';
import TextField from '../../../components/TextField';
import Button from '../../../components/Button';
import {AgentLoginScreenProps} from '../../../types/authTypes';
import Toast from 'react-native-toast-message';
import {handleAgentLogin} from '../../../services/authServices';

import {BASE_URL} from '../../../constant/urls';
import CustomBack from '../../../components/CustomBack';

const AgentLoginScreen = ({navigation}: AgentLoginScreenProps) => {
  const [mobile, setMobile] = useState('');

  // Remove the individual BackHandler - now handled centrally
  // The centralized back handler will show exit prompt on AgentLoginScreen

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

    // Format phone number consistently
    let formattedPhone = mobile;
    if (!mobile.startsWith('+91') && !mobile.startsWith('91')) {
      formattedPhone = `+91${mobile}`;
    } else if (mobile.startsWith('91') && !mobile.startsWith('+91')) {
      formattedPhone = `+${mobile}`;
    }

    const payload = {
      phone: formattedPhone,
    };

    handleAgentLogin(payload)
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res?.user?.message || 'OTP sent to your mobile',
        });
        // Pass the formatted phone number to OTP screen
        navigation.navigate('OtpScreen', {mobile: formattedPhone, screen: 'agent'});
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.message || 'Agent login failed. Please try again.',
        });
      });
  };

  return (
    <View style={styles.parent}>
      <View>
        <View style={styles.headerView}>
          <View style={styles.topRow}>
            <View style={styles.backButtonContainer}>
              <CustomBack onPress={() => navigation.navigate('LoginScreen')} />
            </View>
            <View style={styles.logoContainer}>
              <Image source={IMAGE.HouseAppLogo} style={styles.logoImage} />
            </View>
          </View>
          <View style={styles.titleContainer}>
            <Image source={IMAGE.AGENT_POSTER} style={styles.posterImage} />
          </View>
          
          {/* Login or Sign Up text - styled same as LoginScreen */}
          <View style={styles.row}>
            <View style={styles.hr} />
            <MagicText style={styles.continueText}>Log in or sign up</MagicText>
            <View style={styles.hr} />
          </View>
          
          <MagicText style={styles.welcomeText}>Let's Go</MagicText>
        </View>

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
      </View>
      <View style={styles.bottomView}>
        <MagicText style={styles.termsHeaderText}>
          By continuing, you agree to our
        </MagicText>
        <View style={styles.textRow}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`${BASE_URL}/v1/auth/terms`);
            }}>
            <MagicText style={styles.termsText}>Terms of Service</MagicText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.horizontalView}
            onPress={() => {
              Linking.openURL(`${BASE_URL}v1/auth/privacy-policy`);
            }}>
            <MagicText style={styles.termsText}>Privacy Policy</MagicText>
          </TouchableOpacity>
          <TouchableOpacity>
            <MagicText style={styles.termsText}>Content Policy</MagicText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AgentLoginScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  logoStyle: {
    width: '100%',
    height: 380,
    resizeMode: 'contain',
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
  hr: {
    flex: 1,
    borderWidth: 0.2,
    borderColor: COLORS.GRAY,
    marginHorizontal: 10,
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
  horizontalView: {
    marginHorizontal: 8,
  },
  headerView: {
    padding: 15,
    marginBottom: 50,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40, // Offset to center the logo considering back button width
  },
  logoImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  titleContainer: {
    alignItems: 'center',
  },
  posterImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 15,
    marginBottom: 0,
    textAlign: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 40,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subTitle: {
    fontSize: 30,
    lineHeight: 40,
    color: COLORS.BLACK,
    fontWeight: 'bold',
  },
});
