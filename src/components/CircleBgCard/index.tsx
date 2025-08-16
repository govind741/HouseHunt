import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React, {ReactNode} from 'react';
import {COLORS} from '../../assets/colors';
type CircleBgCardType = {
  roundViewStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};
const CircleBgCard = ({roundViewStyle, ...props}: CircleBgCardType) => {
  return (
    <View style={[styles.roundView, roundViewStyle]}>{props.children}</View>
  );
};

export default CircleBgCard;

const styles = StyleSheet.create({
  roundView: {
    backgroundColor: COLORS.WHITE_SMOKE,
    height: 46,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginRight: 7,
    marginLeft: 7,
  },
});
