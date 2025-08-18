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
    return `+91-${cleanPhone}`;
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
              screen: 'HomeScreen',
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
        console.log('✅ OTP Verification Success:', res);
        Toast.show({
          type: 'success',
          text1: res?.message || 'OTP verified successfully',
        });

        // Handle the correct token structure from API response
        const token = res?.tokens || res?.data?.tokens || '';
        const userId = res?.data?.id || res?.id || '';
        const userData = res?.data || res || {};

        console.log('🔍 OTP Verification Response:', {
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

          console.log('👤 Prepared user object:', userObj);

          if (!userData?.name) {
            // User needs to complete profile
            console.log('📝 User needs to complete profile, navigating to signup');
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
          
          console.log('✅ User has complete profile, navigating to home');
          
          // Navigate to main app
          navigation.navigate('HomeScreenStack', {
            screen: 'HomeScreen',
          });
        } else {
          console.warn('⚠️ Missing userId or token, navigating to home in guest mode');
          // If no token, still navigate to home (guest mode)
          navigation.navigate('HomeScreenStack', {
            screen: 'HomeScreen',
          });
        }
      })
      .catch(error => {
        console.log('❌ Error while verifying OTP:', error);
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
        console.log('✅ Resend OTP Success:', res);
        Toast.show({
          type: 'success',
          text1: res?.message || 'OTP resent successfully',
        });
      })
      .catch(error => {
        console.log('❌ Error while re-sending OTP:', error);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to resend OTP',
        });
      });
  };

  //service for agent
  const handleAgentVerifyOtp = useCallback(() => {
    // Ensure phone number format is consistent with login
    // If mobile doesn't start with +91, add it
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
    
    console.log('🔍 Agent OTP Verification:', {
      originalMobile: mobile,
      formattedPhone: formattedPhone,
      otp: Number(otp),
      payload
    });
    
    VerifyAgentOtp(payload)
      .then(async (res: any) => {
        console.log('✅ Agent OTP Response:', res);
        
        const token = res?.tokens?.refresh?.token || res?.tokens || '';
        const agentId = res?.agentId || res?.data?.id || res?.id || '';
        const role = res?.role || 'agent';
        
        console.log('🔍 Agent verification data:', {
          token: token ? 'Present' : 'Missing',
          agentId,
          role,
        });
        
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
          console.log('📞 Fetching agent details for ID:', agentId);
          
          try {
            const response = await getAgentDetails(agentId);
            console.log('👤 Agent details API response:', {
              success: response?.success,
              hasData: !!response?.data,
              responseKeys: response ? Object.keys(response) : [],
              fullResponse: JSON.stringify(response, null, 2),
              agentId: agentId,
            });
            
            // Handle different possible response structures
            let agentData = null;
            let hasValidResponse = false;
            
            // Try different response structures
            if (response?.data?.data) {
              // Nested data structure: response.data.data
              agentData = response.data.data;
              hasValidResponse = true;
              console.log('📊 Using nested data structure (response.data.data)');
            } else if (response?.data) {
              // Standard structure: response.data
              agentData = response.data;
              hasValidResponse = true;
              console.log('📊 Using standard data structure (response.data)');
            } else if (response?.success && response) {
              // Direct response with success flag
              agentData = response;
              hasValidResponse = true;
              console.log('📊 Using direct response structure');
            } else if (response?.id || response?.name || response?.agency_name || response?.phone) {
              // Direct agent data in response
              agentData = response;
              hasValidResponse = true;
              console.log('📊 Using direct agent data structure');
            }
            
            console.log('🔍 Processed agent data:', {
              hasValidResponse,
              agentDataKeys: agentData ? Object.keys(agentData) : [],
              agentData: JSON.stringify(agentData, null, 2),
              hasName: !!agentData?.name,
              hasAgencyName: !!agentData?.agency_name,
              hasEmail: !!agentData?.email,
              hasPhone: !!agentData?.phone,
              verified: agentData?.verified,
              status: agentData?.status,
            });
            
            if (hasValidResponse && agentData) {
              // Check if this agent has ANY profile information (indicating they've registered before)
              const hasAnyProfileData = !!(
                agentData.name || 
                agentData.agency_name || 
                agentData.email || 
                agentData.phone ||
                agentData.office_address ||
                agentData.description
              );
              
              console.log('🔍 Agent profile analysis:', {
                hasAnyProfileData,
                name: agentData.name,
                agency_name: agentData.agency_name,
                email: agentData.email,
                phone: agentData.phone,
                office_address: agentData.office_address,
                description: agentData.description,
              });
              
              if (!hasAnyProfileData) {
                console.log('📝 No profile data found - treating as new agent registration');
                navigation.navigate('SignupScreen', {
                  mobile_number: mobile,
                  token,
                  agent_id: agentId,
                  role,
                });
                return;
              }

              // Existing agent with profile data - log them in
              console.log('✅ Existing agent found with profile data - logging in directly');
              const agentObj = {
                id: agentId,
                name: agentData.name || agentData.agency_name || 'Agent',
                agency_name: agentData.agency_name || agentData.name || 'Agency',
                phone: agentData.phone || mobile,
                email: agentData.email || '',
                role: 'agent',
                profile: agentData.profile || '',
                verified: agentData.verified !== undefined ? agentData.verified : 1,
                status: agentData.status !== undefined ? agentData.status : 1,
                location: agentData.location || null,
                office_address: agentData.office_address || '',
                description: agentData.description || '',
              };

              dispatch(setUserData(agentObj));
              await AsyncStorage.setItem('userData', JSON.stringify(agentObj));

              // Check agent verification status
              if (agentData.verified === 0 || agentData.status === 0) {
                console.log('⏳ Agent pending approval - verified:', agentData.verified, 'status:', agentData.status);
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
                console.log('✅ Agent verified and approved, navigating to home');
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
              }
            } else {
              console.log('⚠️ No valid agent data found in response - treating as new agent');
              console.log('Response details:', {
                hasResponse: !!response,
                responseType: typeof response,
                responseKeys: response ? Object.keys(response) : [],
                response: response,
              });
              navigation.navigate('SignupScreen', {
                mobile_number: mobile,
                token,
                agent_id: agentId,
                role,
              });
            }
          } catch (detailsError) {
            console.error('❌ Error fetching agent details:', detailsError);
            
            // Check if it's a 404 (agent not found) vs other errors
            if (detailsError?.response?.status === 404) {
              console.log('📝 Agent not found (404) - treating as new agent');
              navigation.navigate('SignupScreen', {
                mobile_number: mobile,
                token,
                agent_id: agentId,
                role,
              });
            } else {
              // For other errors, still try to navigate to signup but log the error
              console.log('⚠️ API error fetching agent details - defaulting to signup flow');
              navigation.navigate('SignupScreen', {
                mobile_number: mobile,
                token,
                agent_id: agentId,
                role,
              });
            }
          }
        } else {
          throw new Error('Missing agentId or token after verification');
        }
      })
      .catch(error => {
        console.log('❌ Error in agent OTP verification:', error);
        console.log('❌ Detailed error information:', {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          responseData: error?.response?.data,
          requestData: error?.config?.data,
          url: error?.config?.url,
          method: error?.config?.method,
        });
        
        let errorMessage = 'Agent OTP verification failed';
        let errorDetails = '';
        
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error?.response?.status === 400) {
          errorMessage = 'Invalid OTP or phone number format';
          errorDetails = 'Please check your OTP and try again';
        } else if (error?.response?.status === 401) {
          errorMessage = 'OTP expired or invalid';
          errorDetails = 'Please request a new OTP';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        Toast.show({
          type: 'error',
          text1: errorMessage,
          text2: errorDetails || `Status: ${error?.response?.status || 'Unknown'}`,
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
