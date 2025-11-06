import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import {MoreOptionIcon, ProfileIcon} from '../../assets/icons';
import StarRating from 'react-native-star-rating-widget';

interface Review {
  id: number;
  user_id: number;
  user_name: string;
  rating?: number; // Make rating optional
  comment: string;
  created_at: string;
  total_comments: number;
  profile?: any;
  reviewImage?: any;
}

interface EnhancedReviewCardProps {
  item: Review;
  currentUserId?: number;
  onEdit: () => void;
}

const EnhancedReviewCard = ({
  item,
  currentUserId,
  onEdit,
}: EnhancedReviewCardProps) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  const isOwnReview = currentUserId && item.user_id === currentUserId;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Today';
      } else if (diffDays === 2) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
      } else if (diffDays <= 30) {
        const weeks = Math.floor((diffDays - 1) / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Unknown date';
    }
  };

  const handleOptionsPress = () => {
    if (isOwnReview) {
      setShowOptionsModal(true);
    }
  };

  const handleEdit = () => {
    setShowOptionsModal(false);
    onEdit();
  };

  return (
    <View style={styles.parent}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {item?.profile ? (
            <Image source={item?.profile} style={styles.profileStyle} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <ProfileIcon />
            </View>
          )}
          <View style={styles.reviewerView}>
            <MagicText style={styles.reviewerName}>
              {item?.user_name || 'Anonymous User'}
            </MagicText>
            <View style={styles.reviewMetadata}>
              <MagicText style={styles.totalReviewsText}>
                {item?.total_comments || 0} reviews
              </MagicText>
              <MagicText style={styles.dateText}>
                • {formatDate(item?.created_at)}
              </MagicText>
            </View>
          </View>
        </View>
        
        {isOwnReview && (
          <TouchableOpacity
            onPress={handleOptionsPress}
            style={styles.optionsButton}>
            <MoreOptionIcon />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ratingContainer}>
        <StarRating
          onChange={() => {}}
          enableHalfStar={true}
          rating={Math.max(0, Math.min(5, Number(item?.rating) || 0))} // Ensure valid range
          maxStars={5}
          starSize={16} // Already an integer
          emptyColor={COLORS.GRAY}
          starStyle={styles.starStyle}
        />
        <MagicText style={styles.ratingText}>
          {item?.rating ? Number(item.rating).toFixed(1) : '0.0'}
        </MagicText>
      </View>

      <MagicText style={styles.reviewText}>
        {item?.comment || 'No comment provided'}
      </MagicText>

      {item?.reviewImage && (
        <Image source={item?.reviewImage} style={styles.mediaStyle} />
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}>
          <View style={styles.optionsModal}>
            <TouchableOpacity style={styles.optionItem} onPress={handleEdit}>
              <MagicText style={styles.optionText}>Edit Review</MagicText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  parent: {
    backgroundColor: COLORS.WHITE_SMOKE,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileStyle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerView: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  reviewMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalReviewsText: {
    fontSize: 12,
    color: COLORS.TEXT_GRAY,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.TEXT_GRAY,
    marginLeft: 4,
  },
  optionsButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starStyle: {
    width: 14,
    marginLeft: 0,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  mediaStyle: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    minWidth: 150,
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionDivider: {
    height: 1,
    backgroundColor: COLORS.GRAY,
    marginHorizontal: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
});

export default EnhancedReviewCard;
