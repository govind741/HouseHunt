import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {COLORS} from '../../assets/colors';

type HRType = {
  style?: StyleProp<ViewStyle>;
  hrStyle?: StyleProp<ViewStyle>;
};
const HR = ({style, hrStyle}: HRType) => {
  return (
    <View style={[styles.parent, style]}>
      <View style={[styles.hr, hrStyle]} />
    </View>
  );
};

export default HR;

const styles = StyleSheet.create({
  parent: {alignItems: 'center', marginTop: 12, marginBottom: 12},
  hr: {width: '100%', height: 0.7, backgroundColor: COLORS.GRAY},
});
