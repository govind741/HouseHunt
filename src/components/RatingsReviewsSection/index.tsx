import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import StarRating from 'react-native-star-rating-widget';
import EnhancedReviewCard from '../EnhancedReviewCard';
import HR from '../HR';
import {
  getReviewsList,
  AddNewReview,
  updateReview,
  deleteReview,
} from '../../services/PropertyServices';
import {useAppSelector} from '../../store';
import Toast from 'react-native-toast-message';

type SortOption = 'newest' | 'highest' | 'lowest';

interface RatingsReviewsSectionProps {
  agentId: number;
}

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

const RatingsReviewsSection = ({agentId}: RatingsReviewsSectionProps) => {
  const {user, userData} = useAppSelector(state => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Safe StarRating wrapper to prevent precision errors
  const SafeStarRating = ({rating, onChange, ...props}: any) => {
    // Ensure rating is always a valid number between 0 and 5
    let safeRating = 0;
    
    try {
      const numRating = Number(rating);
      if (isFinite(numRating) && !isNaN(numRating)) {
        safeRating = Math.max(0, Math.min(5, numRating));
      }
    } catch (error) {
      console.warn('Error processing rating:', rating, error);
      safeRating = 0;
    }
    
    // Round to avoid precision issues
    const finalRating = Math.round(safeRating * 100) / 100;
    
    console.log('SafeStarRating:', {
      originalRating: rating,
      safeRating,
      finalRating,
      type: typeof finalRating,
      isFinite: isFinite(finalRating)
    });
    
    // Safe onChange wrapper
    const safeOnChange = onChange ? (newRating: number) => {
      const safeNewRating = Math.max(0, Math.min(5, Number(newRating) || 0));
      onChange(safeNewRating);
    } : () => {};
    
    return (
      <StarRating
        {...props}
        rating={finalRating}
        onChange={safeOnChange}
      />
    );
  };
  const calculateRatingsFromReviews = useCallback((reviewsList: Review[]) => {
    if (!reviewsList || reviewsList.length === 0) {
      setAverageRating(0);
      setTotalReviews(0);
      setRatingBreakdown({5: 0, 4: 0, 3: 0, 2: 0, 1: 0});
      return;
    }

    // Calculate total reviews
    const total = reviewsList.length;
    setTotalReviews(total);

    // Calculate rating breakdown
    const breakdown = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    let totalRatingSum = 0;
    let validRatingsCount = 0;

    reviewsList.forEach((review: Review) => {
      console.log('Processing review:', {
        id: review.id,
        rating: review.rating,
        ratingType: typeof review.rating,
        comment: review.comment?.substring(0, 50)
      });

      // Handle different rating formats
      let rating = 0;
      if (typeof review.rating === 'number') {
        rating = review.rating;
      } else if (typeof review.rating === 'string') {
        rating = parseFloat(review.rating);
      }

      // Ensure rating is valid
      if (!isNaN(rating) && rating > 0 && rating <= 5) {
        const roundedRating = Math.round(rating); // Use round instead of floor for better accuracy
        if (roundedRating >= 1 && roundedRating <= 5) {
          breakdown[roundedRating as keyof typeof breakdown]++;
          totalRatingSum += rating; // Use original rating for average calculation
          validRatingsCount++;
        }
      }
    });

    // Calculate average rating
    const avgRating = validRatingsCount > 0 ? totalRatingSum / validRatingsCount : 0;
    // Ensure average rating is within valid range (0-5) and round to nearest 0.25
    const validAvgRating = Math.max(0, Math.min(5, avgRating));
    setAverageRating(Math.round(validAvgRating * 4) / 4); // Round to nearest 0.25 for proper star display
    setRatingBreakdown(breakdown);

    console.log('📊 Calculated ratings:', {
      total,
      validRatingsCount,
      avgRating: avgRating.toFixed(2),
      breakdown,
      totalRatingSum
    });
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {agent_id: agentId};
      const response = await getReviewsList(params);
      
      console.log('📊 Raw API response:', JSON.stringify(response, null, 2));
      
      if (response?.data) {
        // Validate and clean the reviews data
        const validatedReviews = response.data.map((review: any) => {
          // Handle different rating formats and field names
          let rating = 0;
          
          // Try different possible rating field names
          const possibleRatingFields = ['rating', 'star_rating', 'stars', 'rate', 'review_rating'];
          
          for (const field of possibleRatingFields) {
            if (review[field] !== undefined && review[field] !== null) {
              if (typeof review[field] === 'number') {
                rating = review[field];
                break;
              } else if (typeof review[field] === 'string') {
                const parsed = parseFloat(review[field]);
                if (!isNaN(parsed)) {
                  rating = parsed;
                  break;
                }
              }
            }
          }
          
          // Ensure rating is valid, default to 0 if invalid
          if (isNaN(rating) || rating < 0 || rating > 5) {
            console.warn('Invalid rating found:', {
              reviewId: review.id,
              originalRating: review.rating,
              allFields: Object.keys(review)
            });
            rating = 0;
          }

          return {
            ...review,
            rating: rating,
            user_name: review.user_name || 'Anonymous User',
            comment: review.comment || 'No comment provided',
            total_comments: review.total_comments || 0,
            created_at: review.created_at || new Date().toISOString(),
          };
        });
        
        console.log('📊 Validated reviews with ratings:', validatedReviews.map(r => ({
          id: r.id,
          rating: r.rating,
          user_name: r.user_name,
          comment: r.comment?.substring(0, 30)
        })));
        
        setReviews(validatedReviews);
        
        // Always calculate ratings locally to ensure accuracy
        calculateRatingsFromReviews(validatedReviews);
        
        // Only use API average if local calculation fails
        if (validatedReviews.length === 0 && (response.avergeReview || response.averageReview)) {
          const apiRating = response.avergeReview || response.averageReview || 0;
          // Ensure API rating is also within valid range
          const validApiRating = Math.max(0, Math.min(5, Number(apiRating) || 0));
          setAverageRating(validApiRating);
        }
      }
    } catch (error) {
      console.log('❌ Error fetching reviews:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load reviews',
      });
    } finally {
      setIsLoading(false);
    }
  }, [agentId, calculateRatingsFromReviews]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const sortedReviews = React.useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
      case 'highest':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'lowest':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  const handleAddReview = async () => {
    if (newRating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select a rating',
      });
      return;
    }

    if (newComment.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please write a comment',
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        agent_id: agentId,
        rating: newRating,
        comment: newComment.trim(),
      };

      await AddNewReview(payload);
      
      Toast.show({
        type: 'success',
        text1: 'Review added successfully',
      });

      setShowAddReview(false);
      setNewRating(0);
      setNewComment('');
      
      // Immediately update local state with new review
      const newReview: Review = {
        id: Date.now(), // Temporary ID until refresh
        user_id: user?.id || userData?.id || 0,
        user_name: user?.name || userData?.name || 'You',
        rating: newRating,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        total_comments: 0,
        profile: user?.profile || userData?.profile,
      };
      
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      calculateRatingsFromReviews(updatedReviews);
      
      // Fetch fresh data from server
      setTimeout(() => fetchReviews(), 500);
    } catch (error) {
      console.log('Error adding review:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add review',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReview = async () => {
    if (!editingReview) return;

    if (newRating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select a rating',
      });
      return;
    }

    if (newComment.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please write a comment',
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        review_id: editingReview.id,
        rating: newRating,
        comment: newComment.trim(),
      };

      await updateReview(payload);
      
      Toast.show({
        type: 'success',
        text1: 'Review updated successfully',
      });

      setEditingReview(null);
      setNewRating(0);
      setNewComment('');
      
      // Immediately update local state with edited review
      const updatedReviews = reviews.map(review => 
        review.id === editingReview.id 
          ? { ...review, rating: newRating, comment: newComment.trim() }
          : review
      );
      setReviews(updatedReviews);
      calculateRatingsFromReviews(updatedReviews);
      
      // Fetch fresh data from server
      setTimeout(() => fetchReviews(), 500);
    } catch (error) {
      console.log('Error updating review:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update review',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteReview({review_id: reviewId});
              
              Toast.show({
                type: 'success',
                text1: 'Review deleted successfully',
              });

              // Immediately update local state by removing the deleted review
              const updatedReviews = reviews.filter(review => review.id !== reviewId);
              setReviews(updatedReviews);
              calculateRatingsFromReviews(updatedReviews);
              
              // Fetch fresh data from server
              setTimeout(() => fetchReviews(), 500);
            } catch (error) {
              console.log('Error deleting review:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to delete review',
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewComment(review.comment);
    setShowAddReview(true);
  };

  const closeModal = () => {
    setShowAddReview(false);
    setEditingReview(null);
    setNewRating(0);
    setNewComment('');
  };

  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === option && styles.activeSortButton,
      ]}
      onPress={() => setSortBy(option)}>
      <MagicText
        style={[
          styles.sortButtonText,
          sortBy === option && styles.activeSortButtonText,
        ]}>
        {label}
      </MagicText>
    </TouchableOpacity>
  );

  const renderRatingBar = (stars: number) => {
    const count = ratingBreakdown[stars as keyof typeof ratingBreakdown];
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    
    return (
      <View key={stars} style={styles.ratingBarContainer}>
        <MagicText style={styles.ratingBarLabel}>{stars}</MagicText>
        <View style={styles.starIconContainer}>
          <MagicText style={styles.starIcon}>★</MagicText>
        </View>
        <View style={styles.ratingBarTrack}>
          <View 
            style={[
              styles.ratingBarFill, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
        <MagicText style={styles.ratingBarPercentage}>
          {percentage.toFixed(0)}%
        </MagicText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Overall Rating Section */}
      <View style={styles.overallRatingContainer}>
        <MagicText style={styles.sectionTitle}>Ratings & Reviews</MagicText>
        
        <View style={styles.ratingMainContainer}>
          {/* Left side - Average Rating */}
          <View style={styles.averageRatingContainer}>
            <MagicText style={styles.ratingNumber}>
              {averageRating.toFixed(1)}
            </MagicText>
            {/* Debug logging */}
            {console.log('🌟 About to render StarRating with:', {
              averageRating,
              type: typeof averageRating,
              isFinite: isFinite(averageRating),
              isNaN: isNaN(averageRating)
            })}
            <SafeStarRating
              onChange={() => {}}
              enableHalfStar={true}
              rating={averageRating}
              maxStars={5}
              starSize={20}
              emptyColor={COLORS.GRAY}
              starStyle={styles.overviewStarStyle}
            />
            <MagicText style={styles.totalReviewsText}>
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </MagicText>
          </View>

          {/* Right side - Rating Breakdown */}
          <View style={styles.ratingBreakdownContainer}>
            {[5, 4, 3, 2, 1].map(stars => renderRatingBar(stars))}
          </View>
        </View>

        {/* Write Review Button */}
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => setShowAddReview(true)}>
          <MagicText style={styles.writeReviewButtonText}>
            Write Review
          </MagicText>
        </TouchableOpacity>
      </View>

      <HR />

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <MagicText style={styles.sortLabel}>Sort by:</MagicText>
        <View style={styles.sortButtons}>
          {renderSortButton('newest', 'Newest')}
          {renderSortButton('highest', 'Highest')}
          {renderSortButton('lowest', 'Lowest')}
        </View>
      </View>

      {/* Reviews List */}
      <FlatList
        data={sortedReviews}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({item}) => {
          // Additional safety check before rendering
          if (!item || !item.id) {
            console.warn('⚠️ Invalid review item:', item);
            return null;
          }
          
          return (
            <EnhancedReviewCard
              item={item}
              currentUserId={user?.id || userData?.id}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDeleteReview(item.id)}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MagicText style={styles.emptyText}>
              No reviews yet. Be the first to review!
            </MagicText>
          </View>
        }
      />

      {/* Add/Edit Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MagicText style={styles.modalTitle}>
                {editingReview ? 'Edit Review' : 'Write Review'}
              </MagicText>
              <TouchableOpacity onPress={closeModal}>
                <MagicText style={styles.closeButton}>✕</MagicText>
              </TouchableOpacity>
            </View>

            <View style={styles.ratingSection}>
              <MagicText style={styles.ratingLabel}>Your Rating:</MagicText>
              <SafeStarRating
                onChange={setNewRating}
                enableHalfStar={false}
                rating={newRating}
                maxStars={5}
                starSize={32}
                emptyColor={COLORS.GRAY}
                starStyle={styles.modalStarStyle}
              />
            </View>

            <View style={styles.commentSection}>
              <MagicText style={styles.commentLabel}>Your Review:</MagicText>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                placeholder="Share your experience..."
                value={newComment}
                onChangeText={setNewComment}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}>
                <MagicText style={styles.cancelButtonText}>Cancel</MagicText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={editingReview ? handleEditReview : handleAddReview}
                disabled={isLoading}>
                <MagicText style={styles.submitButtonText}>
                  {isLoading ? 'Saving...' : editingReview ? 'Update' : 'Submit'}
                </MagicText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overallRatingContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  ratingMainContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  averageRatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  overviewStarStyle: {
    width: 14, // Use integer instead of Math.round(14)
    marginLeft: 0,
    marginRight: 2, // Use integer instead of Math.round(2)
  },
  totalReviewsText: {
    fontSize: 13,
    color: COLORS.TEXT_GRAY,
    marginTop: 6,
    textAlign: 'center',
  },
  ratingBreakdownContainer: {
    flex: 2,
    paddingLeft: 12,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabel: {
    fontSize: 13,
    color: COLORS.BLACK,
    width: 10,
    textAlign: 'right',
  },
  starIconContainer: {
    width: 16,
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    color: '#FFD700',
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.WHITE_SMOKE,
    borderRadius: 3,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  ratingBarPercentage: {
    fontSize: 11,
    color: COLORS.TEXT_GRAY,
    width: 30,
    textAlign: 'right',
  },
  writeReviewButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  writeReviewButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sortLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE_SMOKE,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  activeSortButton: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  sortButtonText: {
    fontSize: 13,
    color: COLORS.TEXT_GRAY,
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  closeButton: {
    fontSize: 28,
    color: COLORS.TEXT_GRAY,
    fontWeight: 'bold',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 28,
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  modalStarStyle: {
    width: 28, // Use integer instead of Math.round(28)
    marginLeft: 0,
    marginRight: 12, // Use integer instead of Math.round(12)
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 2,
    borderColor: COLORS.WHITE_SMOKE,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: COLORS.WHITE,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE_SMOKE,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default RatingsReviewsSection;
