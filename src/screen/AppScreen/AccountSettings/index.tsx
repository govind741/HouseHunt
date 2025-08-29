import React, {useCallback, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, View, ActivityIndicator} from 'react-native';
import {AccountSettingsProps} from '../../../types/appTypes';
import {COLORS} from '../../../assets/colors';
import ScreenHeader from '../../../components/ScreenHeader';
import MagicText from '../../../components/MagicText';
import WhiteCardView from '../../../components/WhiteCardView';
import NotificationToggle from '../../../components/NotificationToggle';
import {ContactUsIcon, RightArrowIcon} from '../../../assets/icons';
import {deleteUser} from '../../../services/HomeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearAuthState} from '../../../store/slice/authSlice';
import Toast from 'react-native-toast-message';
import {useAppDispatch, useAppSelector} from '../../../store';
import {useAuthGuard} from '../../../hooks/useAuthGuard';
import {useFocusEffect} from '@react-navigation/native';

const AccountSettings = ({navigation}: AccountSettingsProps) => {
  const dispatch = useAppDispatch();
  const {userData} = useAppSelector(state => state.auth);
  const {requireAuth} = useAuthGuard();
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!requireAuth()) {
        return; // User will be redirected to login
      }
    }, [requireAuth])
  );

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsDeleting(false);
      Alert.alert(
        'Request Submitted',
        'Your request for deleting account has been sent successfully.',
        [{text: 'OK', style: 'default'}]
      );
    }, 2000);
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteUser,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.parent}>
      <ScreenHeader
        showBackBtn
        onPressProfile={() => {
          navigation.navigate('ProfileScreen');
        }}
        onBackPress={() => navigation.goBack()}
        onHomePress={() => navigation.navigate('CitySelectionScreen')}
      />

      <View style={styles.container}>
        <MagicText style={styles.titleText}>Settings</MagicText>

        {/* Notification Toggle */}
        <NotificationToggle 
          onToggle={(enabled) => {
            console.log('Notifications toggled:', enabled);
          }}
        />

        <WhiteCardView
          cardStyle={styles.cardStyle}
          onPress={() => {
            navigation.navigate('TermsConditionsScreen');
          }}>
          <View style={styles.row}>
            <ContactUsIcon />
            <MagicText style={styles.label}>Terms and Conditions</MagicText>
          </View>
          <RightArrowIcon />
        </WhiteCardView>

        <WhiteCardView
          cardStyle={styles.cardStyle}
          onPress={() => {
            navigation.navigate('PrivacyPolicyScreen');
          }}>
          <View style={styles.row}>
            <ContactUsIcon />
            <MagicText style={styles.label}>Privacy Policies</MagicText>
          </View>
          <RightArrowIcon />
        </WhiteCardView>

        {userData?.role !== 'agent' ? (
          <WhiteCardView
            cardStyle={[styles.cardStyle, styles.deleteAccountCardStyle]}
            onPress={showDeleteConfirmation}>
            <View style={styles.deleteAccountContainer}>
              {isDeleting ? (
                <View style={styles.deletingContainer}>
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                  <MagicText style={styles.deletingText}>Processing...</MagicText>
                </View>
              ) : (
                <MagicText style={styles.deleteAccountText}>
                  Delete Account
                </MagicText>
              )}
            </View>
          </WhiteCardView>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  titleText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
    marginHorizontal: 15,
    padding: 5,
  },
  deleteAccountCardStyle: {
    backgroundColor: COLORS.APP_RED,
    justifyContent: 'center',
  },
  deleteAccountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  deleteAccountText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 15,
  },
  deletingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.WHITE,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AccountSettings;
