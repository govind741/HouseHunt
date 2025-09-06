import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {BackArrowIcon} from '../../assets/icons';
import {COLORS} from '../../assets/colors';
type CustomBackType = {
  onPress: () => void;
};
const CustomBack = ({onPress}: CustomBackType) => {
  return (
    <TouchableOpacity style={styles.roundView} onPress={onPress}>
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
