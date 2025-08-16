// @flow
import React, {ReactElement, ReactNode} from 'react';
import {
  View,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
  StyleProp,
  TouchableOpacityProps,
  ActivityIndicator,
  ColorValue,
} from 'react-native';
import {COLORS} from '../../assets/colors';
import {getButtonStyle} from './utils';
import ButtonStyle from './style';
import MagicText from '../MagicText';

type ButtonPropType = {
  type?: 'PRIMARY' | 'OUTLINE' | 'DISABLE';
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftIcon?: ReactNode | ReactElement;
  rightIcon?: ReactNode | ReactElement;
  loading?: boolean;
  loaderColor?: ColorValue;
  iconContainerStyle?: StyleProp<ViewStyle>;
  activeOpacity?: any;
  isGoogleLoading?: boolean;
} & TouchableOpacityProps;

const Button = ({
  type = 'PRIMARY',
  label,
  onPress = () => {},
  disabled = false,
  style,
  labelStyle,
  contentStyle,
  leftIcon,
  rightIcon,
  loading = false,
  loaderColor = COLORS.WHITE,
  iconContainerStyle,
  activeOpacity,
  isGoogleLoading,
}: ButtonPropType) => {
  const newStyle = getButtonStyle(type);

  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={activeOpacity ?? 0.75}
      style={[
        ButtonStyle.containerStyle,
        newStyle[0],
        disabled
          ? type === 'OUTLINE'
            ? {opacity: 0.6}
            : {backgroundColor: COLORS.APP_RED, opacity: 0.6}
          : {},
        style,
      ]}
      onPress={onPress}>
      {loading && !disabled ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <View style={[ButtonStyle.buttonContentStyle, contentStyle]}>
          {leftIcon ? (
            <View
              style={[
                ButtonStyle.buttonIconContainer,
                label ? {} : {marginRight: 0},
                iconContainerStyle,
              ]}>
              {leftIcon}
            </View>
          ) : null}
          <MagicText
            style={[
              newStyle[1],
              labelStyle,
              disabled ? {color: COLORS.WHITE} : {},
            ]}>
            {label}
          </MagicText>
          {rightIcon ? (
            <View style={[label ? {marginLeft: 8} : {}, iconContainerStyle]}>
              {rightIcon}
            </View>
          ) : null}
          {isGoogleLoading ? (
            <View style={[label ? {marginLeft: 8} : {}, iconContainerStyle]}>
              <ActivityIndicator />
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
