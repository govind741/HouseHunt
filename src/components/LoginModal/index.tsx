import React from 'react';
import {Image, Modal, Pressable, StyleSheet, View} from 'react-native';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import {IMAGE} from '../../assets/images';
import Button from '../Button';
import {useNavigation} from '@react-navigation/native';

interface LoginModalProps {
  isVisible?: boolean;
  closeModal?: () => void;
}

const LoginModal = ({
  isVisible = false,
  closeModal = () => {},
}: LoginModalProps) => {
  const navigation = useNavigation<any>();

  const handleLoginPress = () => {
    closeModal();
    // Navigate to AuthStack with LoginScreen
    navigation.navigate('AuthStack', {
      screen: 'LoginScreen',
    });
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={closeModal}
      statusBarTranslucent>
      {/* Blur Background Container */}
      <View style={styles.blurContainer}>
        {/* Multiple layers for blur effect */}
        <View style={styles.blurLayer1} />
        <View style={styles.blurLayer2} />
        <View style={styles.blurLayer3} />

        {/* Backdrop for closing modal */}
        <Pressable style={styles.backdrop} onPress={closeModal} />

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <View style={styles.cardContainer}>
            {/* Header with Icon and Title */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Image source={IMAGE.LockIcon} style={styles.lockIcon} />
              </View>
              <MagicText style={styles.titleText}>Login Required</MagicText>
            </View>

            {/* Message Section */}
            <View style={styles.messageSection}>
              <MagicText style={styles.messageText}>
                Login to view all details and access all the features
              </MagicText>
            </View>

            {/* Button Section */}
            <View style={styles.buttonSection}>
              <Button
                label="Login"
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                onPress={handleLoginPress}
              />

              <Pressable style={styles.cancelButton} onPress={closeModal}>
                <MagicText style={styles.cancelButtonText}>Cancel</MagicText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  blurLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  blurLayer3: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#E3F2FD',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lockIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    tintColor: '#1976D2',
  },
  titleText: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  messageSection: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  buttonSection: {
    gap: 14,
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#1976D2',
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.WHITE,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
  },
});

export default LoginModal;
