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
  totalRatings?: number; // New prop for total number of ratings
  showTotalRatings?: boolean; // New prop to control display
};

const RatingCard = ({
  componentStyle,
  labelStyle,
  label,
  family,
  rating,
  totalRatings,
  showTotalRatings = false,
}: GreenComponentType) => {
  const ratingValue = Number(rating) || 0;
  const displayRating = ratingValue.toFixed(1);
  
  return (
    <View style={[styles.component, componentStyle]}>
      <View style={styles.container}>
        <MagicText style={[styles.text, labelStyle]} family={family}>
          {displayRating}
        </MagicText>
        <StarIcon />
        {label && (
          <MagicText style={[styles.text, labelStyle]} family={family}>
            {label}
          </MagicText>
        )}
      </View>
      {/* Display total ratings count below the rating if enabled */}
      {showTotalRatings && totalRatings !== undefined && (
        <View style={styles.totalRatingsContainer}>
          <MagicText style={styles.totalRatingsText}>
            ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
          </MagicText>
        </View>
      )}
    </View>
  );
};

export default RatingCard;

const styles = StyleSheet.create({
  component: {
    padding: 4,
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 6,
    minHeight: 28,
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
  totalRatingsContainer: {
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  totalRatingsText: {
    fontSize: 10,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
});
