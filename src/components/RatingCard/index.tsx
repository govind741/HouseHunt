import React from 'react';
import {StyleProp, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import {StarIcon} from '../../assets/icons';

type GreenComponentType = {
  componentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  label?: any;
  family?: any;
  rating?: string;
};
const RatingCard = ({
  componentStyle,
  labelStyle,
  label,
  family,
  rating,
}: GreenComponentType) => {
  return (
    <View style={[styles.component, componentStyle]}>
      <View style={styles.container}>
        <MagicText style={[styles.text, labelStyle]} family={family}>
          {Number(rating)?.toFixed(1)}
        </MagicText>
        <StarIcon />
        {label && (
          <MagicText style={[styles.text, labelStyle]} family={family}>
            {label}
          </MagicText>
        )}
      </View>
    </View>
  );
};

export default RatingCard;

const styles = StyleSheet.create({
  component: {
    padding: 4,
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 6,
    height: 28,
  },
  text: {
    fontSize: 14,
    color: COLORS.WHITE,
    marginRight: 4,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 4,
  },
});
