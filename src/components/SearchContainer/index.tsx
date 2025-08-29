import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import React, {ReactElement, ReactNode} from 'react';
import TextField from '../TextField';
import {COLORS} from '../../assets/colors';
import {SearchIcon} from '../../assets/icons';

type SearchContainerType = {
  rightIcon?: ReactNode | ReactElement;
  leftIcon?: ReactNode | ReactElement;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  rightIconDisabled?: boolean;
  editable?: boolean;
  searchValue?: string;
} & TextInputProps;
const SearchContainer = ({
  rightIcon,
  style,
  inputStyle,
  onRightIconPress = () => {},
  onLeftIconPress = () => {},
  rightIconDisabled,
  editable = true,
  searchValue = '',
  ...props
}: SearchContainerType) => {
  return (
    <TextField
      editable={editable}
      style={[styles.searchContainer, style]}
      inputStyle={[
        Platform.OS === 'ios' ? styles.iOSInputStyle : styles.androidInputStyle,
        inputStyle,
      ]}
      placeholderTextColor={COLORS.BLACK}
      leftIcon={<SearchIcon />}
      rightIcon={rightIcon}
      onRightIconPress={onRightIconPress}
      onLeftIconPress={onLeftIconPress}
      rightIconDisabled={rightIconDisabled}
      value={searchValue}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
};

export default SearchContainer;

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: COLORS.WHITE_SMOKE,
    height: 40,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  androidInputStyle: {
    flex: 1,
    paddingVertical: 0,
    color: COLORS.DARK_GRAY,
    fontSize: 16,
  },
  iOSInputStyle: {
    flex: 1,
    paddingVertical: 2,
    color: COLORS.DARK_GRAY,
    fontSize: 16,
  },
});
