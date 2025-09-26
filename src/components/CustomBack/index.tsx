import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {BackArrowIcon} from '../../assets/icons';
import {COLORS} from '../../assets/colors';
import {useNavigation} from '@react-navigation/native';
import {AppBackHandler} from '../../utils/backHandlerUtils';

type CustomBackType = {
  onPress?: () => void;
};

const CustomBack = ({onPress}: CustomBackType) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      AppBackHandler.navigateBack(navigation);
    }
  };

  return (
    <TouchableOpacity style={styles.roundView} onPress={handlePress}>
      <BackArrowIcon />
    </TouchableOpacity>
  );
};

export default CustomBack;

const styles = StyleSheet.create({
  roundView: {
    width: 40,
    height: 40,
    borderRadius: 30,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
  },
});
