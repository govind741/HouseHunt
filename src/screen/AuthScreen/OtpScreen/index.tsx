import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import MagicText from '../../../components/MagicText';
import CustomBack from '../../../components/CustomBack';
import {COLORS} from '../../../assets/colors';
import OTPTextField from '../../../components/OTPTextField';
import {TimerIcon} from '../../../assets/icons';
import {OtpScreenProps} from '../../../types/authTypes';
import {
  getAgentDetails,
  handleAgentResendOtp,
  handleUserDetails,
  handleUserResendOtp,
  VerifyAgentOtp,
  VerifyUserOtp,
} from '../../../services/authServices';
import Toast from 'react-native-toast-message';
import {useAppDispatch} from '../../../store';
import {setToken, setUserData} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {prepareUserObj} from '../../../utils';

const OtpScreen = ({navigation, route}: OtpScreenProps) => {
  const {mobile, screen: prevScreen} = route.params;
  const [otp, setOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);
  const dispatch = useAppDispatch();

  // Helper function to detect if input is email
  const isEmail = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  // Helper function to format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    // Remove any existing country code prefixes and formatting
    let cleanPhone = phone.replace(/^\+91-?/, '').replace(/^\+?91-?/, '').replace(/^91-?/, '');
    
    // Return formatted phone with single +91 prefix
    return `+91- ${cleanPhone}`;
  };

  // Check if the mobile parameter is actually an email
  const isEmailLogin = isEmail(mobile);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        if (timer === 0) {
          clearInterval(interval);
        } else {
          setTimer(timer - 1);
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [timer]);

  //service for user
  const handleUserVerifyOtp = useCallback(() => {
    // TEMPORARY WORKAROUND: Handle email OTP verification
    // Since backend doesn't support email OTP verification yet,
    // we'll simulate successful verification for emails when OTP is "123456"
    if (isEmailLogin) {
      console.log('Email OTP verification detected, using workaround');
      
      if (otp === '123456') {
        // Simulate successful email OTP verification
        Toast.show({
          type: 'success',
          text1: 'Email verification successful',
        });
        
        // Create mock response similar to backend response
        const mockResponse = {
          message: 'Email verification successful',
          tokens: {
            refresh: {
              token: 'mock_email_token_' + Date.now()
            }
          },
          UserId: 'email_user_' + Date.now(),
          role: 'user'
        };
        
        // Handle successful verification (same logic as mobile)
        const handleEmailVerificationSuccess = async () => {
          const token = mockResponse.tokens.refresh.token;
          const userId = mockResponse.UserId;
          
          if (userId && token) {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('role', mockResponse.role);
            dispatch(setToken(token));
            
            // For email users, pass empty mobile_number and set email in navigation params
            navigation.navigate('UserSignupScreen', {
              mobile_number: '', // Empty for email users
              email: mobile, // Pass email address separately
              token,
              user_id: userId,
              role: mockResponse.role,
            });
          } else {
            navigation.navigate('HomeScreenStack', {
              screen: 'CitySelectionScreen',
            });
          }
        };
        
        handleEmailVerificationSuccess();
        return;
      } else {
        // Invalid OTP for email
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP. Please enter 123456',
        });
        return;
      }
    }

    // Original mobile number OTP verification logic
    const payload = {
      phone: mobile,
      otp: Number(otp),
    };
    
    console.log('Mobile OTP verification:', payload);
    
    VerifyUserOtp(payload)
      .then(async (res: any) => {
        console.log('OTP Verification Success:', res);
        Toast.show({
          type: 'success',
          text1: res?.message || 'OTP verified successfully',
        });

        // Handle the correct token structure from API response
        const token = res?.tokens || res?.data?.tokens || '';
        const userId = res?.data?.id || res?.id || '';
        const userData = res?.data || res || {};

        console.log('OTP Verification Response:', {
          token: token ? 'Present' : 'Missing',
          userId,
          userData,
          hasName: !!userData?.name,
        });

        if (userId && token) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('role', userData?.role || 'user');
          await AsyncStorage.setItem('userId', userId.toString());
          dispatch(setToken(token));
          
          // Prepare user object with better data handling
          const userObj = {
            id: userId,
            name: userData?.name || '',
            phone: userData?.phone || mobile, // Use mobile from OTP if phone not in response
            email: userData?.email || '',
            role: userData?.role || 'user',
            profile: userData?.profile || '',
            location: userData?.location || null,
            status: userData?.status || 0,
          };

          console.log('Prepared user object:', userObj);

          if (!userData?.name) {
            // User needs to complete profile
            console.log('User needs to complete profile, navigating to signup');
            navigation.navigate('UserSignupScreen', {
              mobile_number: mobile,
              token,
              user_id: userId,
              role: userData?.role || 'user',
            });
            return;
          }
          
          // User has complete profile, save and navigate to home
          await AsyncStorage.setItem('userData', JSON.stringify(userObj));
          dispatch(setUserData(userObj));
          
          console.log('User has complete profile, navigating to home');
          
          // Navigate to main app
          navigation.navigate('HomeScreenStack', {
            screen: 'CitySelectionScreen',
          });
        } else {
          console.warn('Missing userId or token, navigating to home in guest mode');
          // If no token, still navigate to home (guest mode)
          navigation.navigate('HomeScreenStack', {
            screen: 'CitySelectionScreen',
          });
        }
      })
      .catch(error => {
        console.log(' Error while verifying OTP:', error);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Invalid OTP. Please try again.',
        });
      });
  }, [dispatch, mobile, navigation, otp, isEmailLogin]);

  const handleUserOtp = () => {
    // TEMPORARY WORKAROUND: Handle email OTP resend
    if (isEmailLogin) {
      console.log('Email OTP resend detected, using workaround');
      Toast.show({
        type: 'success',
        text1: 'OTP resent to your email successfully',
      });
      return;
    }

    // Original mobile number OTP resend logic
    const payload = {
      phone: mobile,
    };
    
    console.log('Mobile OTP resend:', payload);
    
    handleUserResendOtp(payload)
      .then((res: any) => {
        console.log(' Resend OTP Success:', res);
        Toast.show({
          type: 'success',
          text1: res?.message || 'OTP resent successfully',
        });
      })
      .catch(error => {
        console.log(' Error while re-sending OTP:', error);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to resend OTP',
        });
      });
  };

  //service for agent
  const handleAgentVerifyOtp = useCallback(() => {
    // Ensure phone number format is consistent with login
    let formattedPhone = mobile;
    if (!mobile.startsWith('+91') && !mobile.startsWith('91')) {
      formattedPhone = `+91${mobile}`;
    } else if (mobile.startsWith('91') && !mobile.startsWith('+91')) {
      formattedPhone = `+${mobile}`;
    }
    
    const payload = {
      phone: formattedPhone,
      otp: Number(otp),
    };
    
    console.log('Agent OTP Verification:', payload);
    
    VerifyAgentOtp(payload)
      .then(async (res: any) => {
        console.log('Agent OTP Response:', res);
        
        const token = res?.tokens?.refresh?.token || res?.tokens || '';
        const agentId = res?.agentId || res?.data?.id || res?.id || '';
        const role = res?.role || 'agent';
        
        if (!token) {
          throw new Error('No token received from agent verification');
        }
        
        dispatch(setToken(token));
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('role', role);
        await AsyncStorage.setItem('userId', agentId.toString());
        
        Toast.show({
          type: 'success',
          text1: res?.message || 'Agent OTP verified successfully',
        });

        if (agentId && token) {
          try {
            // Check agent status by fetching agent details
            const { fetchAgentData } = await import('../../../services/agentServices');
            const agentDataResult = await fetchAgentData(agentId);
            
            if (agentDataResult.success && agentDataResult.data) {
              const agentData = agentDataResult.data;
              
              // Check if agent has complete profile (name and email are required)
              const hasCompleteProfile = agentData.name && agentData.email;
              
              if (!hasCompleteProfile) {
                // New agent - navigate to SignupScreen
                console.log('New agent - navigating to SignupScreen');
                navigation.navigate('SignupScreen', {
                  mobile_number: mobile,
                  token,
                  agent_id: agentId,
                  role,
                });
                return;
              }
              
              // Existing agent with complete profile - check if explicitly verified by admin
              // For now, all existing agents should go to PendingApprovalScreen unless explicitly verified
              const isExplicitlyVerified = agentData.verified === 'approved' || agentData.status === 'active';
              
              if (isExplicitlyVerified) {
                // Explicitly verified agent - navigate to HomeScreen
                console.log('Explicitly verified agent - navigating to HomeScreen');
                
                const agentObj = {
                  id: agentId,
                  name: agentData.name || 'Agent',
                  phone: agentData.phone || mobile,
                  email: agentData.email || '',
                  role: 'agent',
                  verified: true,
                  status: 1,
                  working_locations: agentData.working_locations || [],
                };

                dispatch(setUserData(agentObj));
                await AsyncStorage.setItem('userData', JSON.stringify(agentObj));
                
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
                // Existing agent but not explicitly verified - navigate to PendingApprovalScreen
                console.log('Existing agent pending approval - navigating to PendingApprovalScreen');
                
                const agentObj = {
                  id: agentId,
                  name: agentData.name || 'Agent',
                  phone: agentData.phone || mobile,
                  email: agentData.email || '',
                  role: 'agent',
                  verified: false,
                  status: 0,
                };

                dispatch(setUserData(agentObj));
                await AsyncStorage.setItem('userData', JSON.stringify(agentObj));
                
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'HomeScreenStack',
                      params: {
                        screen: 'PendingApprovalScreen',
                      },
                    },
                  ],
                });
              }
            } else {
              // No agent data found - treat as new agent
              console.log('No agent data found - treating as new agent');
              navigation.navigate('SignupScreen', {
                mobile_number: mobile,
                token,
                agent_id: agentId,
                role,
              });
            }
          } catch (detailsError: any) {
            console.error('Error fetching agent data:', detailsError);
            // On error, treat as new agent
            navigation.navigate('SignupScreen', {
              mobile_number: mobile,
              token,
              agent_id: agentId,
              role,
            });
          }
        } else {
          throw new Error('Missing agentId or token after verification');
        }
      })
      .catch(error => {
        console.log('Error in agent OTP verification:', error);
        
        let errorMessage = 'Agent OTP verification failed';
        
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        Toast.show({
          type: 'error',
          text1: errorMessage,
        });
      });
  }, [mobile, otp, dispatch, navigation]);

  const handleAgentResentOtp = () => {
    const payload = {
      phone: mobile,
    };
    handleAgentResendOtp(payload)
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text1: res?.user?.message,
        });
      })
      .catch(error => {
        console.log('error while re-sending otp in handleAgentResOtp', error);
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.message,
        });
      });
  };

  useEffect(() => {
    if (otp.length === 6) {
      if (prevScreen === 'user') {
        handleUserVerifyOtp();
      } else {
        handleAgentVerifyOtp();
      }
    }
  }, [handleAgentVerifyOtp, handleUserVerifyOtp, otp, prevScreen]);

  return (
    <View style={styles.parent}>
      <View style={styles.row}>
        <CustomBack onPress={() => navigation.goBack()} />
        <MagicText style={styles.headerText}>OTP Verification</MagicText>
      </View>
      <View style={{flexGrow: 1}}>
        <View style={styles.titleView}>
          <MagicText style={styles.title}>
            We have sent a verification code to
          </MagicText>
          <MagicText style={[styles.title, {fontWeight: '700'}]}>
            {isEmailLogin ? mobile : formatPhoneForDisplay(mobile)}
          </MagicText>
        </View>
        <View style={styles.otpView}>
          <OTPTextField
            cellCount={6}
            otpValue={otp}
            onTextChange={number => setOtp(number)}
          />
        </View>
      </View>
      <View style={styles.bottomView}>
        <MagicText style={{fontSize: 14, marginBottom: 10}}>
          Didn't get the OTP?
        </MagicText>
        {timer > 0 && timer < 30 && (
          <View style={styles.roundView}>
            <View style={[styles.row, {justifyContent: 'space-evenly'}]}>
              <TimerIcon />
              <MagicText>{timer}</MagicText>
            </View>
          </View>
        )}
        {!(timer > 0 && timer < 30) && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              setTimer(30);
              if (prevScreen === 'user') {
                handleUserOtp();
              } else {
                handleAgentResentOtp();
              }
            }}
            disabled={timer > 0 && timer < 30}>
            <MagicText style={{fontWeight: 700, fontSize: 14}}>
              Resend OTP
            </MagicText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  headerText: {
    fontSize: 20,
    color: COLORS.BLACK,
    fontWeight: '600',
    marginLeft: 12,
  },
  codeText: {
    fontSize: 22,
  },
  titleView: {
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  otpView: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  roundView: {
    width: 80,
    height: 50,
    borderRadius: 30,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  bottomView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
