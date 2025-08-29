import axiosInstance from '../axios';
import {ENDPOINT} from '../constant/urls';

const getReviewsList = async (params: any) => {
  try {
    console.log(' Get Reviews List Request:', params);
    const response = await axiosInstance.get(
      `${ENDPOINT.get_reviews}?agent_id=${params.agent_id}`,
    );
    console.log('Get Reviews List Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Reviews List Error:', error);
    throw error;
  }
};

const AddNewReview = async (payload: any) => {
  try {
    console.log('➕ Add New Review Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.add_reviews, payload);
    console.log('✅ Add New Review Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Add New Review Error:', error);
    throw error;
  }
};

const updateReview = async (payload: any) => {
  try {
    console.log('✏️ Update Review Request:', payload);
    let response;
    
    try {
      // First try: PATCH with review_id in URL (most common pattern)
      response = await axiosInstance.patch(`${ENDPOINT.get_reviews}/${payload.review_id}`, {
        rating: payload.rating,
        comment: payload.comment,
      });
      console.log('✅ Update Review Success (PATCH with ID in URL):', response);
      return response;
    } catch (error: any) {
      console.log('❌ PATCH with ID in URL failed:', error.response?.status);
      
      try {
        // Second try: PUT with review_id in URL
        response = await axiosInstance.put(`${ENDPOINT.get_reviews}/${payload.review_id}`, {
          rating: payload.rating,
          comment: payload.comment,
        });
        console.log('✅ Update Review Success (PUT with ID in URL):', response);
        return response;
      } catch (secondError: any) {
        console.log('❌ PUT with ID in URL failed:', secondError.response?.status);
        
        try {
          // Third try: PATCH with review_id in body
          response = await axiosInstance.patch(ENDPOINT.get_reviews, payload);
          console.log('✅ Update Review Success (PATCH with ID in body):', response);
          return response;
        } catch (thirdError: any) {
          console.log('❌ PATCH with ID in body failed:', thirdError.response?.status);
          
          try {
            // Fourth try: PUT with review_id in body
            response = await axiosInstance.put(ENDPOINT.get_reviews, payload);
            console.log('✅ Update Review Success (PUT with ID in body):', response);
            return response;
          } catch (fourthError: any) {
            console.log('❌ PUT with ID in body failed:', fourthError.response?.status);
            
            try {
              // Fifth try: POST to add_reviews endpoint (some APIs use POST for updates)
              response = await axiosInstance.post(ENDPOINT.add_reviews, payload);
              console.log('✅ Update Review Success (POST to add endpoint):', response);
              return response;
            } catch (fifthError: any) {
              console.log('❌ All update methods failed');
              throw fifthError;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Update Review Error:', error);
    throw error;
  }
};

const deleteReview = async (payload: any) => {
  try {
    console.log('🗑️ Delete Review Request:', payload);
    let response;
    
    // Try different userId parameter names
    const userIdVariations = [
      `userId=${payload.userId}`,
      `user_id=${payload.userId}`,
      `id=${payload.userId}`,
    ];
    
    for (const userIdParam of userIdVariations) {
      try {
        // Try DELETE with review_id and userId as query parameters
        response = await axiosInstance.delete(`${ENDPOINT.delete_review}?review_id=${payload.review_id}&${userIdParam}`);
        console.log('✅ Delete Review Success (query param):', response);
        return response;
      } catch (error: any) {
        console.log(`❌ Delete with query param (${userIdParam}) failed:`, error.response?.status);
        continue;
      }
    }
    
    // If query params failed, try body with different userId field names
    const bodyVariations = [
      { review_id: payload.review_id, userId: payload.userId },
      { review_id: payload.review_id, user_id: payload.userId },
      { review_id: payload.review_id, id: payload.userId },
    ];
    
    for (const bodyPayload of bodyVariations) {
      try {
        response = await axiosInstance.delete(ENDPOINT.delete_review, {
          data: bodyPayload,
        });
        console.log('✅ Delete Review Success (body data):', response);
        return response;
      } catch (error: any) {
        console.log(`❌ Delete with body data failed:`, error.response?.status);
        continue;
      }
    }
    
    throw new Error('All delete methods failed');
  } catch (error) {
    console.error('❌ Delete Review Error (all methods failed):', error);
    throw error;
  }
};

const handleAddBookmark = async (payload: any) => {
  try {
    console.log('🔖 Add Bookmark Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.bookmark, payload);
    console.log('✅ Add Bookmark Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Add Bookmark Error:', error);
    throw error;
  }
};

const handleGetAgentBookmark = async () => {
  try {
    console.log('🔖 Get Agent Bookmark Request');
    const response = await axiosInstance.get(ENDPOINT.bookmark);
    console.log('✅ Get Agent Bookmark Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Agent Bookmark Error:', error);
    throw error;
  }
};

const handleDeleteAgentBookmark = async (payload: any) => {
  try {
    console.log('🗑️ Delete Agent Bookmark Request:', payload);
    const response = await axiosInstance.delete(ENDPOINT.bookmark, {
      data: payload,
    });
    console.log('✅ Delete Agent Bookmark Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Delete Agent Bookmark Error:', error);
    throw error;
  }
};

const handleSliderData = async (cityId: number) => {
  try {
    console.log('🎠 Get Slider Data Request:', {cityId});
    let url = ENDPOINT.slider_info;
    if (cityId) {
      url += `?city_id=${cityId}`;
    }
    const response = await axiosInstance.get(url);
    console.log('✅ Get Slider Data Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Slider Data Error:', error);
    throw error;
  }
};

/**
 * Get the total number of ratings/reviews for an agent
 */
const getAgentRatingCount = async (agentId: number): Promise<number> => {
  try {
    console.log('📊 Get Agent Rating Count Request:', {agentId});
    const params = {agent_id: agentId};
    const response = await getReviewsList(params);
    
    if (response?.data && Array.isArray(response.data)) {
      const totalCount = response.data.length;
      console.log('✅ Agent Rating Count Success:', {agentId, totalCount});
      return totalCount;
    }
    
    console.log('⚠️ No reviews data found for agent:', agentId);
    return 0;
  } catch (error) {
    console.error('❌ Get Agent Rating Count Error:', error);
    return 0; // Return 0 instead of throwing to prevent crashes
  }
};

export {
  getReviewsList,
  AddNewReview,
  updateReview,
  deleteReview,
  handleAddBookmark,
  handleGetAgentBookmark,
  handleDeleteAgentBookmark,
  handleSliderData,
  getAgentRatingCount,
};
