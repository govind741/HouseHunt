import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import {FONTS} from '../../assets/font';

type LoadingAndErrorComponentType = {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorMessage?: string;
  visible?: boolean;
} & ActivityIndicatorProps;

const LoadingAndErrorComponent = ({
  style,
  labelStyle,
  errorMessage = '',
}: LoadingAndErrorComponentType) => {
  return (
    <View style={[styles.parent, style]}>
      {errorMessage ? (
        <View>
          <MagicText style={[styles.errorMsg, labelStyle]}>
            {errorMessage}
          </MagicText>
        </View>
      ) : (
        <View style={[styles.parent, style]}>
          <ActivityIndicator size={'large'} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 100,
    height: 100,
  },
  errorMsg: {
    fontSize: 16,
    color: COLORS.RED,
    fontFamily: FONTS.OPENSANS_SEMIBOLD,
  },
});
export default LoadingAndErrorComponent;
