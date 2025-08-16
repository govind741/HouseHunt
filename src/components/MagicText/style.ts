import {StyleSheet} from 'react-native';
import {COLORS} from '../../assets/colors';
import {FONTS} from '../../assets/font';

const MagicTextStyle = StyleSheet.create({
  opensansRegular: {
    fontSize: 12,
    fontFamily: FONTS.OPENSANS_REGULAR,
    color: COLORS.BLACK,
  },
  opensansBold: {
    fontSize: 16,
    fontFamily: FONTS.OPENSANS_BOLD,
    color: COLORS.BLACK,
  },
  opensansMedium: {
    fontSize: 12,
    fontFamily: FONTS.OPENSANS_MEDIUM,
    color: COLORS.BLACK,
  },
  opensansSemiBold: {
    fontSize: 16,
    fontFamily: FONTS.OPENSANS_SEMIBOLD,
    color: COLORS.BLACK,
  },
});

export {MagicTextStyle};
