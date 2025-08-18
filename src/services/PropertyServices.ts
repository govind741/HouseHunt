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
    // Try different approaches for update
    let response;
    
    try {
      // First try: PUT with review_id in URL
      response = await axiosInstance.put(`${ENDPOINT.update_review}/${payload.review_id}`, {
        rating: payload.rating,
        comment: payload.comment,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Second try: PUT with review_id in body
        response = await axiosInstance.put(ENDPOINT.update_review, payload);
      } else {
        throw error;
      }
    }
    
    console.log('✅ Update Review Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Update Review Error:', error);
    throw error;
  }
};

const deleteReview = async (payload: any) => {
  try {
    console.log('🗑️ Delete Review Request:', payload);
    let response;
    
    try {
      // First try: DELETE with review_id as query parameter
      response = await axiosInstance.delete(`${ENDPOINT.delete_review}?review_id=${payload.review_id}`);
      console.log('✅ Delete Review Success (query param):', response);
      return response;
    } catch (error: any) {
      console.log('❌ Delete with query param failed:', error.response?.status);
      
      try {
        // Second try: DELETE with review_id in URL path
        response = await axiosInstance.delete(`${ENDPOINT.delete_review}/${payload.review_id}`);
        console.log('✅ Delete Review Success (URL path):', response);
        return response;
      } catch (secondError: any) {
        console.log('❌ Delete with URL path failed:', secondError.response?.status);
        
        try {
          // Third try: DELETE with data in body
          response = await axiosInstance.delete(ENDPOINT.delete_review, {
            data: payload,
          });
          console.log('✅ Delete Review Success (body data):', response);
          return response;
        } catch (thirdError: any) {
          console.log('❌ Delete with body data failed:', thirdError.response?.status);
          
          try {
            // Fourth try: POST to delete endpoint
            response = await axiosInstance.post(ENDPOINT.delete_review, payload);
            console.log('✅ Delete Review Success (POST):', response);
            return response;
          } catch (fourthError: any) {
            console.log('❌ POST delete failed:', fourthError.response?.status);
            
            // Fifth try: Use the base reviews endpoint with DELETE method
            try {
              response = await axiosInstance.delete(`${ENDPOINT.get_reviews}/${payload.review_id}`);
              console.log('✅ Delete Review Success (base endpoint):', response);
              return response;
            } catch (fifthError: any) {
              console.log('❌ Base endpoint delete failed:', fifthError.response?.status);
              throw fifthError;
            }
          }
        }
      }
    }
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

export {
  getReviewsList,
  AddNewReview,
  updateReview,
  deleteReview,
  handleAddBookmark,
  handleGetAgentBookmark,
  handleDeleteAgentBookmark,
  handleSliderData,
};
