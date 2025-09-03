import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import MagicText from './MagicText';

interface GoogleSignInButtonProps {
  onPress: () => void;
  style?: any;
}

const GoogleSignInButton = ({onPress, style}: GoogleSignInButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <View style={styles.logoContainer}>
        <MagicText style={styles.logo}>G</MagicText>
      </View>
      <MagicText style={styles.text}>Sign in with Google</MagicText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 2,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
});

export default GoogleSignInButton;
