import {StyleSheet} from 'react-native';
import {COLORS} from '../../assets/colors';

const TextFieldStyle = StyleSheet.create({
  inputContainer: {
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE_SMOKE,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  inputStyle: {
    flex: 1,
    padding: 0,
  },
  errStyle: {
    color: COLORS.RED,
    marginTop: 8,
    fontSize: 12,
  },
  countryCodeView: {
    paddingHorizontal: 8,
  },
  countryCode: {fontWeight: '800', fontSize: 16},
});

export default TextFieldStyle;
