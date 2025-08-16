import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {PendingApprovalScreenProps} from '../../../types/appTypes';
import {COLORS} from '../../../assets/colors';
import MagicText from '../../../components/MagicText';
import {HouseAppIcon} from '../../../assets/icons';
import {useAppDispatch} from '../../../store';
import {clearAuthState} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PendingApprovalScreen = ({navigation}: PendingApprovalScreenProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Do you really want to exit?', [
        {text: 'Exit', onPress: () => BackHandler.exitApp()},
        {text: 'Wait'},
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
            
            // Navigate back to AuthStack instead of CitySelectionScreen
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'AuthStack',
                  params: {
                  screen: 'LoginScreen',
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
                  name: 'AuthStack',
                  params: {
                  screen: 'LoginScreen',
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
