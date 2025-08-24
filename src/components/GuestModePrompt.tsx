import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import MagicText from './MagicText';
import {COLORS} from '../assets/colors';
import {useNavigation} from '@react-navigation/native';

interface GuestModePromptProps {
  message?: string;
  buttonText?: string;
  onPress?: () => void;
}

const GuestModePrompt: React.FC<GuestModePromptProps> = ({
  message = "Please log in to access this feature",
  buttonText = "Log In",
  onPress,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('AuthStack' as never, {screen: 'LoginScreen'} as never);
    }
  };

  return (
    <View style={styles.container}>
      <MagicText style={styles.message}>{message}</MagicText>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <MagicText style={styles.buttonText}>{buttonText}</MagicText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GuestModePrompt;
