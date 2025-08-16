import React from 'react';
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import GoogleIcon from './GoogleIcon';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const GoogleSignInButton = ({onPress, disabled = false}: GoogleSignInButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <GoogleIcon size={20} />
      </View>
      <Text style={styles.buttonText}>Sign in with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4', // Bright blue background
    borderRadius: 25, // More curved border
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 15,
    marginTop: 20,
    minHeight: 48, // Standard button height
  },
  buttonDisabled: {
    backgroundColor: '#9AA0A6',
    opacity: 0.6,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16, // Circular background
    backgroundColor: '#FFFFFF', // White circular background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buttonText: {
    flex: 1,
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'System', // Clean, modern sans-serif
  },
});

export default GoogleSignInButton;
