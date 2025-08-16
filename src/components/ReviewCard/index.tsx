import {Image, StyleSheet, View} from 'react-native';
import React from 'react';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import {MoreOptionIcon, ProfileIcon} from '../../assets/icons';
import StarRating from 'react-native-star-rating-widget';
type ReviewCardType = {
  item: any;
};
const ReviewCard = ({item}: ReviewCardType) => {
  return (
    <View style={styles.parent}>
      <View style={styles.row}>
        <View style={[styles.row, {marginBottom: 4}]}>
          {item?.profile ? (
            <Image source={item?.profile} style={styles.profileStyle} />
          ) : (
            <ProfileIcon />
          )}
          <View style={styles.reviewerView}>
            <MagicText style={styles.reviewerName}>{item?.user_name}</MagicText>
            <MagicText style={styles.totalReviewsText}>
              {item?.total_comments} reviews
            </MagicText>
          </View>
        </View>
        <MoreOptionIcon />
      </View>
      <StarRating
        onChange={() => {}}
        enableHalfStar={true}
        rating={item?.rating}
        maxStars={5}
        starSize={20}
        emptyColor={COLORS.GRAY}
        starStyle={{width: 16, marginLeft: 0, marginRight: 2}}
        style={{
          marginBottom: 6,
        }}
      />
      <MagicText style={styles.reviewText}>{item?.comment}</MagicText>
      {item?.reviewImage && (
        <Image source={item?.reviewImage} style={styles.mediaStyle} />
      )}
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  parent: {
    backgroundColor: COLORS.WHITE_SMOKE,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 24,
  },
  profileStyle: {width: 34, height: 34, borderRadius: 30},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewerView: {marginLeft: 10},
  reviewerName: {fontSize: 14, fontWeight: '700', marginBottom: 2},
  mediaStyle: {width: '100%', height: 226, borderRadius: 20},
  reviewText: {fontSize: 14, marginBottom: 12},
  totalReviewsText: {fontSize: 12, color: COLORS.TEXT_GRAY},
});
