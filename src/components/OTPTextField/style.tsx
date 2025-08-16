import {StyleSheet} from 'react-native';
import {COLORS} from '../../assets/colors';

const OTPTextFieldStyles = StyleSheet.create({
  cell: {
    height: 54,
    width: 54,
    fontSize: 16,
    padding: 12,
    lineHeight: 24,
    borderRadius: 10,
    textAlign: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },

  errorCell: {
    borderColor: COLORS.RED,
  },

  containerStyle: {
    flexDirection: 'column',
  },

  errorImageStyle: {
    marginRight: 8,
    height: 24,
    width: 24,
  },

  errorTextStyle: {
    color: COLORS.RED,
    fontSize: 14,
  },

  errorContainerStyle: {
    flexDirection: 'row',
  },

  spacingStyle: {
    marginRight: 11,
  },
});

export default OTPTextFieldStyles;
