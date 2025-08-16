import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import CustomBack from '../CustomBack';
import {IMAGE} from '../../assets/images';
import {useAppSelector} from '../../store';
import {BASE_URL} from '../../constant/urls';
import {COLORS} from '../../assets/colors';
import MagicText from '../MagicText';

interface ScreenHeaderProps {
  showBackBtn?: boolean;
  onBackPress?: () => void;
  onPressProfile?: () => void;
  onLoginPress?: () => void;
  onHomePress?: () => void;
}

const ScreenHeader = ({
  showBackBtn = false,
  onBackPress = () => {},
  onPressProfile = () => {},
  onLoginPress = () => {},
  onHomePress = () => {},
}: ScreenHeaderProps) => {
  const {token, userData} = useAppSelector(state => state.auth);

  const getInitial = () => {
    const name = userData?.name;
    if (typeof name === 'string' && name.trim().length > 0) {
      return name.trim()[0].toUpperCase();
    }
    return 'U'; // fallback if name is empty or undefined
  };

  const getProfileImage = () => {
    // Early return if no userData
    if (!userData) {
      return (
        <View style={styles.profileView}>
          <MagicText style={styles.userNameText}>U</MagicText>
        </View>
      );
    }

    if (userData?.role === 'agent') {
      const agencyInitial = userData?.agency_name && typeof userData.agency_name === 'string' 
        ? userData.agency_name.trim()[0]?.toUpperCase() || 'A'
        : 'A';
      
      return (
        <View style={styles.profileView}>
          <MagicText style={styles.userNameText}>
            {agencyInitial}
          </MagicText>
        </View>
      );
    }

    // Handle profile image for users
    const profilePath = userData?.profile;
    const data = profilePath ? profilePath.split('/') : [];

    if (data?.[2] && data?.[2] !== 'undefined' && profilePath) {
      const url = `${BASE_URL}public/${profilePath}`;
      return (
        <View style={styles.profileViewStyle}>
          <Image 
            source={{uri: url}} 
            style={styles.profileImgStyle}
            onError={() => {
              console.log('Profile image failed to load, falling back to initial');
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.profileView}>
        <MagicText style={styles.userNameText}>{getInitial()}</MagicText>
      </View>
    );
  };

  return (
    <View style={styles.parent}>
      {showBackBtn ? (
        <CustomBack onPress={onBackPress} />
      ) : (
        <View style={{width: 40}} />
      )}

      <TouchableOpacity style={styles.logoSection} onPress={onHomePress}>
        <Image source={IMAGE.HouseAppLogo} style={styles.image} />
      </TouchableOpacity>

      {token ? (
        <TouchableOpacity 
          key={`profile-${userData?.id || 'no-user'}-${userData?.name || 'no-name'}`}
          onPress={onPressProfile}
        >
          {getProfileImage()}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
          <MagicText style={styles.btnText}>Login</MagicText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  parent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
  },
  profileViewStyle: {
    width: 30,
    height: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
    padding: 2,
  },
  profileImgStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    resizeMode: 'cover',
  },
  image: {
    width: 100,
    height: 40,
    resizeMode: 'cover',
  },
  btnText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
  },
  profileView: {
    width: 40,
    height: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  userNameText: {
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.BLACK,
    fontWeight: 'bold',
  },
});

export default ScreenHeader;
