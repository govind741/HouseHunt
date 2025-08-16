import React from 'react';
import {Image, StyleProp, TextStyle, View, ViewProps} from 'react-native';
import MagicText from '../MagicText';
import {
  CodeField,
  useClearByFocusCell,
  useBlurOnFulfill,
  Cursor,
} from 'react-native-confirmation-code-field';
import OTPTextFieldStyles from './style';
import FastImage from 'react-native-fast-image';

interface OTPTextFieldType {
  cellCount?: any;
  otpValue?: any;
  onTextChange?: (e: any) => void;
  errorMessage?: any;
  errorIconSource?: any;
  errorOccurred?: any;
  cellStyle?: StyleProp<TextStyle>;
}

const OTPTextField = ({
  cellCount,
  otpValue,
  onTextChange = () => {},
  errorMessage,
  errorIconSource,
  errorOccurred,
  cellStyle,
}: OTPTextFieldType) => {
  const ref = useBlurOnFulfill({value: otpValue, cellCount: cellCount});

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    setValue: onTextChange,
    value: otpValue,
  });

  return (
    <View style={OTPTextFieldStyles.containerStyle}>
      <CodeField
        rootStyle={{justifyContent: 'flex-start'}}
        {...props}
        ref={ref}
        cellCount={cellCount}
        value={otpValue}
        onChangeText={onTextChange}
        textContentType="oneTimeCode"
        autoCapitalize="characters"
        renderCell={({index, symbol, isFocused}) => (
          <View style={{flexDirection: 'row-reverse'}} key={index}>
            <MagicText
              key={index}
              style={[
                OTPTextFieldStyles.cell,
                index + 1 !== cellCount && OTPTextFieldStyles.spacingStyle,
                cellStyle,
              ]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </MagicText>
          </View>
        )}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {errorOccurred && errorIconSource ? (
          <FastImage
            source={errorIconSource}
            style={OTPTextFieldStyles.errorImageStyle}
          />
        ) : null}
        {errorOccurred && errorMessage ? (
          <MagicText style={OTPTextFieldStyles.errorTextStyle}>
            {errorMessage}
          </MagicText>
        ) : null}
      </View>
    </View>
  );
};

export default OTPTextField;
