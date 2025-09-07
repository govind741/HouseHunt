import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import {PendingApprovalScreenProps} from '../../../types/appTypes';
import {COLORS} from '../../../assets/colors';
import MagicText from '../../../components/MagicText';
import {HouseAppIcon} from '../../../assets/icons';
import {useAppDispatch, useAppSelector} from '../../../store';
import {clearAuthState} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleAgentDetails} from '../../../services/authServices';

const PendingApprovalScreen = ({navigation}: PendingApprovalScreenProps) => {
  const dispatch = useAppDispatch();
  const {token, userData} = useAppSelector(state => state.auth);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check approval status periodically
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!token || !userData?.id || checkingStatus) return;
      
      setCheckingStatus(true);
      try {
        const agentDetails = await handleAgentDetails(userData.id);
        
        // Check if agent is now approved
        if (agentDetails && (agentDetails.verified === 1 || agentDetails.status === 1)) {
          console.log('Agent approved, redirecting to city selection');
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'HomeScreenStack',
                params: {
                  screen: 'CitySelectionScreen',
                },
              },
            ],
          });
        }
      } catch (error) {
        console.log('Error checking approval status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Check immediately
    checkApprovalStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkApprovalStatus, 30000);
    
    return () => clearInterval(interval);
  }, [token, userData?.id, navigation, checkingStatus]);

  // Allow back button to close the application
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear specific auth-related items from AsyncStorage
            await AsyncStorage.multiRemove(['token', 'userData', 'role', 'userId']);
            
            // Clear Redux auth state
            dispatch(clearAuthState());
            
            // Navigate to CitySelectionScreen
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'HomeScreenStack',
                  params: {
                    screen: 'CitySelectionScreen',
                  },
                },
              ],
            });
          } catch (error) {
            console.error('Error during logout:', error);
            // Fallback: still clear Redux state and navigate
            dispatch(clearAuthState());
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'HomeScreenStack',
                  params: {
                    screen: 'CitySelectionScreen',
                  },
                },
              ],
            });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.parent}>
      <View style={styles.container}>
        <HouseAppIcon />
        <MagicText style={styles.titleText}>Request in Process</MagicText>

        <MagicText style={styles.subText}>
          Please wait until our team approves your request.
        </MagicText>

        <ActivityIndicator size={'large'} />

        <MagicText style={styles.subText}>
           You will receive a notification once you request is approved.
        </MagicText>

        <TouchableOpacity onPress={handleLogout}>
          <MagicText style={styles.logoutText}>Log Out</MagicText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE_SMOKE,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: COLORS.WHITE,
    width: '100%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  titleText: {
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.BLACK,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 30,
  },
  logoutText: {
    fontSize: 18,
    color: COLORS.RED,
    fontWeight: '800',
  },
});

export default PendingApprovalScreen;
