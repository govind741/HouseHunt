import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';

type DotComponentType = {
  currentIndex?: any;
  index?: any;
  style?: StyleProp<ViewStyle>;
  activeColor?: string;
  InActiveColor?: string;
};
const DotComponent = ({
  currentIndex,
  index,
  style,
  activeColor,
  InActiveColor,
}: DotComponentType) => {
  return (
    <View style={styles.container}>
      <View
        key={index}
        style={[
          style,
          {
            backgroundColor:
              currentIndex === index ? activeColor : InActiveColor,
          },
          styles.dotStyle,
        ]}
      />
    </View>
  );
};

export default DotComponent;

const styles = StyleSheet.create({
  container: {
    width: 14,
    marginRight: 6,
  },
  dotStyle: {
    marginRight: 12,
    width: 8,
    height: 8,
    borderRadius: 8,
  },
});
