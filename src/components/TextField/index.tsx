import React, {ReactNode} from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
  Platform,
  ActivityIndicator,
} from 'react-native';

import MagicText from '../MagicText';
import TextFieldStyle from './style';
import {COLORS} from '../../assets/colors';

export type TextFieldPropType = {
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  textInputLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rightIconText?: string;
  errorMessage?: string | null;
  isValid?: boolean;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  inputStyle?: StyleProp<TextStyle>;
  isRequired?: boolean;
  setRef?: (refObj: any) => void;
  isLoading?: boolean;
  rightIconDisabled?: boolean;
  LeftIconDisabled?: boolean;
  showCountryCode?: boolean;
  errorStyle?: StyleProp<TextStyle>;
} & TextInputProps;

const TextField = ({
  placeholder,
  style,
  leftIcon,
  rightIcon,
  rightIconText,
  errorMessage = '',
  isValid = true,
  inputStyle,
  onRightIconPress = () => {},
  onLeftIconPress = () => {},
  setRef = () => {},
  isLoading,
  rightIconDisabled,
  LeftIconDisabled,
  showCountryCode = false,
  errorStyle = {},
  ...TextInputProps
}: TextFieldPropType) => {
  return (
    <>
      <View
        style={[
          TextFieldStyle.inputContainer,
          style,
          isValid ? {} : {borderColor: COLORS.RED, borderWidth: 1},
        ]}>
        <View style={TextFieldStyle.row}>
          {leftIcon ? (
            <TouchableOpacity
              style={{marginLeft: 8}}
              onPress={onLeftIconPress}
              disabled={LeftIconDisabled}>
              {leftIcon}
            </TouchableOpacity>
          ) : null}
          {showCountryCode && (
            <View style={TextFieldStyle.countryCodeView}>
              <MagicText style={TextFieldStyle.countryCode}>+91</MagicText>
            </View>
          )}
          <TextInput
            ref={setRef}
            placeholder={placeholder}
            style={[
              TextFieldStyle.inputStyle,
              Platform.OS === 'ios' ? {padding: 8} : {},
              isValid ? {} : {color: COLORS.RED},
              inputStyle,
              leftIcon ? {marginLeft: 12} : {marginLeft: 0},
            ]}
            placeholderTextColor={COLORS.GRAY}
            {...TextInputProps}
          />
          {isLoading ? <ActivityIndicator /> : null}
          {rightIcon ? (
            <TouchableOpacity
              style={{marginLeft: 8, marginRight: rightIcon ? 12 : 0}}
              onPress={onRightIconPress}
              disabled={rightIconDisabled}>
              {rightIcon}
            </TouchableOpacity>
          ) : null}
          {rightIconText ? (
            <TouchableOpacity
              style={{marginLeft: 8}}
              onPress={onRightIconPress}>
              <MagicText>{rightIconText}</MagicText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {!isValid && errorMessage ? (
        <MagicText style={[TextFieldStyle.errStyle, errorStyle]}>
          {errorMessage}
        </MagicText>
      ) : null}
    </>
  );
};

export default TextField;
