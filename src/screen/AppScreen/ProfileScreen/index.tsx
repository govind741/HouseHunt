import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {
  BookmarkIcon,
  LocationIcon,
  RightArrowIcon,
  EditIcon,
  ContactUsIcon,
  PaymentIcon,
} from '../../../assets/icons';
import {ProfileScreennProps} from '../../../types/appTypes';
import {useAppDispatch, useAppSelector} from '../../../store';
import {clearAuthState, setUserData} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  handleAgentDetails,
  handleUserDetails,
} from '../../../services/authServices';
import LoadingAndErrorComponent from '../../../components/LoadingAndErrorComponent';
import WhiteCardView from '../../../components/WhiteCardView';
import {AgentUserType, UserType} from '../../../types';
import {IMAGE} from '../../../assets/images';
import {BASE_URL} from '../../../constant/urls';
import AuthDebugger from '../../../components/AuthDebugger';
import {prepareUserObj} from '../../../utils';
import {debugUserData} from '../../../utils/debugUser';

const UserMenuOptions = ['experthelp', 'bookmarks', 'accountSettings', 'aboutUs', 'contactUs'];
const AgentMenuOptions = ['paymentOptions', 'locations', 'accountSettings', 'aboutUs', 'contactUs'];

const ProfileScreen = ({navigation}: ProfileScreennProps) => {
  const dispatch = useAppDispatch();
  const {token, userData} = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<
    AgentUserType | UserType | null
  >(null);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (token && userData?.id) {
      if (userData.role === 'agent') {
        setOptions(AgentMenuOptions);
      } else {
        setOptions(UserMenuOptions);
      }
    } else {
      setOptions([]);
    }
  }, [token, userData]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          dispatch(clearAuthState());
          await AsyncStorage.clear();
          navigation.navigate('HomeScreen');
        },
      },
    ]);
  };

  const getDetails = useCallback(
    (userId: number, role: string) => {
      console.log('🔍 Getting user details for:', {userId, role});
      setIsLoading(true);
      
      const API =
        role === 'agent' ? handleAgentDetails(userId) : handleUserDetails();

      API.then(async res => {
        console.log('✅ API response received:', res);
        setIsLoading(false);
        
        // Fix: Check for 'user' instead of 'users'
        if (role === 'user' || role === 'users') {
          console.log('👤 Processing user data...');
          const userObj = prepareUserObj(res);
          console.log('👤 Prepared user object:', userObj);
          
          // Only update if we got valid data
          if (userObj && userObj.id) {
            await AsyncStorage.setItem('userData', JSON.stringify(userObj));
            dispatch(setUserData(userObj));
            setUserDetails(userObj);
          } else {
            console.warn('⚠️ Invalid user object, keeping existing data');
            // Keep existing data if API returned invalid data
            if (userData) {
              setUserDetails(userData);
            }
          }
        } else {
          // For agents
          console.log('🏢 Processing agent data...');
          if (res && res.id) {
            setUserDetails(res);
            dispatch(setUserData(res));
            await AsyncStorage.setItem('userData', JSON.stringify(res));
          } else {
            console.warn('⚠️ Invalid agent data, keeping existing data');
            if (userData) {
              setUserDetails(userData);
            }
          }
        }
      }).catch(error => {
        setIsLoading(false);
        console.log('❌ Error in getDetails:', error);
        
        // Fallback: Use existing userData from Redux if API fails
        if (userData) {
          console.log('⚠️ Using fallback userData from Redux:', userData);
          setUserDetails(userData);
        } else {
          console.error('❌ No fallback data available');
        }
      });
    },
    [dispatch, userData],
  );

  useEffect(() => {
    if (token && userData?.id) {
      getDetails(userData.id, userData.role);
    }
  }, [getDetails, token, userData?.id, userData?.role]);

  // Initialize userDetails from Redux userData if not already set
  useEffect(() => {
    if (userData && !userDetails) {
      console.log('🔧 Initializing userDetails from Redux userData:', userData);
      setUserDetails(userData);
    }
  }, [userData, userDetails]);

  // Debug user data on component mount - only in development
  useEffect(() => {
    if (__DEV__) {
      const debugData = async () => {
        console.log('🔍 === PROFILE SCREEN DEBUG ===');
        const debugResult = await debugUserData();
        
        console.log('Redux userData:', userData);
        console.log('Local userDetails:', userDetails);
        
        // Additional debugging
        if (userData) {
          console.log('📊 User Data Analysis:', {
            id: userData.id,
            name: userData.name,
            phone: userData.phone,
            role: userData.role,
            hasName: !!userData.name,
          });
        }
        
        if (!userData && !userDetails) {
          console.log('🚨 CRITICAL: No user data available anywhere!');
        }
      };
      debugData();
    }
  }, [userData, userDetails]);

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }

  const renderOption = (option: string) => {
    switch (option) {
      case 'experthelp':
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('ExpertsScreen')}
            activeOpacity={0.7}>
            <View style={styles.getHelpView}>
              <MagicText style={styles.getHelpText}>Get Expert Help</MagicText>
              <MagicText style={styles.sellbuyText}>
                BUY | SELL | RENT
              </MagicText>
            </View>
          </TouchableOpacity>
        );

      case 'paymentOptions':
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('PaymentOptionsScreen')}
            activeOpacity={0.7}>
            <View style={styles.getHelpView}>
              <PaymentIcon color={COLORS.APP_RED} width={28} height={28} />
              <MagicText style={styles.getHelpText}>Payment Options</MagicText>
              <MagicText style={styles.sellbuyText}>
                UPI | BANK | QR CODE
              </MagicText>
            </View>
          </TouchableOpacity>
        );

      case 'bookmarks':
        return (
          <TouchableOpacity onPress={() => navigation.navigate('SavedScreen')}>
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <View style={styles.row}>
                <BookmarkIcon color={COLORS.BLACK} />
                <MagicText style={{marginLeft: 12, fontSize: 16}}>
                  Bookmarks
                </MagicText>
              </View>
              <RightArrowIcon />
            </View>
          </TouchableOpacity>
        );

      case 'locations':
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('WorkingLocationsListScreen')}>
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <View style={styles.row}>
                <LocationIcon />
                <MagicText style={{marginLeft: 12, fontSize: 16}}>
                  Working Locations
                </MagicText>
              </View>
              <RightArrowIcon />
            </View>
          </TouchableOpacity>
        );

      case 'accountSettings':
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('AccountSettings')}>
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <View style={styles.row}>
                <Image source={IMAGE.SettingsIcon} style={styles.icon} />
                <MagicText style={{marginLeft: 12, fontSize: 16}}>
                  Account Settings
                </MagicText>
              </View>
              <RightArrowIcon />
            </View>
          </TouchableOpacity>
        );

      case 'aboutUs':
        return (
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`${BASE_URL}v1/auth/about-us`);
            }}>
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <View style={styles.row}>
                <ContactUsIcon />
                <MagicText style={{marginLeft: 12, fontSize: 16}}>
                  About US
                </MagicText>
              </View>
              <RightArrowIcon />
            </View>
          </TouchableOpacity>
        );

      case 'contactUs':
        return (
          <TouchableOpacity onPress={() => {}}>
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <View style={styles.row}>
                <ContactUsIcon />
                <MagicText style={{marginLeft: 12, fontSize: 16}}>
                  Contact US
                </MagicText>
              </View>
              <RightArrowIcon />
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const getProfileImage = () => {
    // Use userDetails first, fallback to userData
    const currentUser = userDetails || userData;
    
    if (currentUser?.role === 'agent') {
      const agencyInitial =
        currentUser?.agency_name && currentUser.agency_name.length > 0
          ? currentUser.agency_name[0].toUpperCase()
          : 'A';

      return (
        <View style={styles.profileView}>
          <MagicText style={styles.userNameText}>{agencyInitial}</MagicText>
        </View>
      );
    }

    const data = currentUser?.profile ? currentUser.profile.split('/') : [];

    if (data?.[2] && data?.[2] !== 'undefined' && currentUser?.profile) {
      const url = `${BASE_URL}public${currentUser.profile}`;
      return (
        <View style={styles.profileViewStyle}>
          <Image source={{uri: url}} style={styles.profileImgStyle} />
        </View>
      );
    }

    const nameInitial =
      currentUser?.name && currentUser.name.length > 0
        ? currentUser.name[0].toUpperCase()
        : 'U';

    return (
      <View style={styles.profileView}>
        <MagicText style={styles.userNameText}>{nameInitial}</MagicText>
      </View>
    );
  };

  const renderUserInfo = () => {
    // Use userDetails first, fallback to userData
    const currentUser = userDetails || userData;
    
    // Only log in development
    if (__DEV__) {
      console.log('🖼️ Rendering user info with:', {
        userDetails: userDetails ? 'Present' : 'Missing',
        userData: userData ? 'Present' : 'Missing',
        hasCurrentUser: !!currentUser,
      });
    }
    
    const displayName = currentUser?.name || 'User Name';
    const displayPhone = currentUser?.phone || '';
    
    return (
      <WhiteCardView cardStyle={styles.cardStyle}>
        <View style={styles.formView}>
          <View style={styles.profileSection}>
            <View>{getProfileImage()}</View>
            <View style={styles.userInfoContainer}>
              <MagicText style={styles.userName}>
                {displayName}
              </MagicText>
              {displayPhone ? (
                <MagicText style={styles.userPhone}>
                  {displayPhone}
                </MagicText>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (currentUser) {
                navigation.navigate('ProfileDetailScreen', {
                  userDetails: currentUser,
                } as any);
              }
            }}>
            <EditIcon color={COLORS.APP_RED} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </WhiteCardView>
    );
  };

  return (
    <SafeAreaView style={styles.parentView}>
      <View style={styles.headerRow}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.header}>
          <MagicText style={styles.headerText}>Your Profile</MagicText>
        </View>
        <View style={{width: 30}} />
      </View>

      <ScrollView contentContainerStyle={styles.parent}>
        {renderUserInfo()}
        {options.map(option => {
          return (
            <WhiteCardView cardStyle={styles.cardStyle} key={option}>
              {renderOption(option)}
            </WhiteCardView>
          );
        })}

        <WhiteCardView
          cardStyle={[styles.cardStyle, styles.logoutCardStyle]}
          onPress={() => handleLogout()}>
          <View style={styles.logoutContainer}>
            <Image source={IMAGE.LogoutIcon} style={[styles.icon, styles.logoutIcon]} />
            <MagicText style={styles.logoutText}>Logout</MagicText>
          </View>
        </WhiteCardView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  parentView: {
    flex: 1,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  parent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerRow: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStyle: {
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  formView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfoContainer: {
    marginLeft: 15,
    flex: 1,
  },
  editButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE_SMOKE,
    borderWidth: 1,
    borderColor: COLORS.APP_RED,
    marginLeft: 10,
  },
  getHelpView: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.APP_RED,
    paddingVertical: 11,
  },
  getHelpText: {
    fontSize: 22,
    color: COLORS.APP_RED,
    marginBottom: 3,
    marginTop: 2,
    fontWeight: '800',
  },
  sellbuyText: {fontSize: 14, color: COLORS.APP_RED},
  logoutCardStyle: {
    backgroundColor: COLORS.APP_RED,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  logoutIcon: {
    tintColor: COLORS.WHITE,
  },
  profileView: {
    width: 60,
    height: 60,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  profileViewStyle: {
    width: 60,
    height: 60,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
    padding: 2,
  },
  profileImgStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    resizeMode: 'cover',
  },
  userNameText: {
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.BLACK,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    marginBottom: 6,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLACK,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'baseline',
  },
  editText: {
    fontSize: 14,
    color: COLORS.WHITE,
  },
  icon: {
    width: 18,
    height: 18,
  },
});
