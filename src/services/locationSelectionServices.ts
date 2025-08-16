import axiosInstance from '../axios';
import {ENDPOINT} from '../constant/urls';

const getAllCityList = async () => {
  try {
    console.log('🏙️ Get All Cities Request');
    const response = await axiosInstance.get(ENDPOINT.get_city);
    console.log('✅ Get All Cities Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get All Cities Error:', error);
    throw error;
  }
};

const getAllAreasList = async (cityId?: number) => {
  try {
    console.log('🗺️ Get All Areas Request:', {cityId});
    
    // Only make the API call if we have a valid cityId
    if (!cityId || cityId <= 0) {
      console.warn('⚠️ Invalid cityId provided to getAllAreasList:', cityId);
      return {data: [], formattedData: []};
    }
    
    let url = ENDPOINT.get_areas;
    url += `?cityId=${cityId}`;
    
    const response = await axiosInstance.get(url);
    console.log('✅ Get All Areas Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get All Areas Error:', error);
    throw error;
  }
};

const getAllLocalitiesList = async (payload: {
  cityId: number;
  areaId: number | undefined;
}) => {
  try {
    console.log('📍 Get All Localities Request:', payload);
    let url = `${ENDPOINT.get_localities}?cityId=${payload?.cityId}`;
    if (payload?.areaId) {
      url = url + `&areaId=${payload?.areaId}`;
    }
    const response = await axiosInstance.get(url);
    console.log('✅ Get All Localities Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get All Localities Error:', error);
    throw error;
  }
};

// Simple retry function for search localities only
const retryRequest = async (fn: () => Promise<any>, maxRetries = 2): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
};

const searchLocalities = async (payload: {name: string; cityId?: number}) => {
  try {
    console.log('🔍 Search Localities Request:', payload);
    let url = `${ENDPOINT.search_localities}?name=${payload?.name}`;
    if (payload?.cityId) {
      url += `&cityId=${payload?.cityId}`;
    }
    console.log('Search URL:', url);
    
    // Only add retry for search localities
    const response = await retryRequest(async () => {
      return await axiosInstance.get(url);
    });
    
    console.log('✅ Search Localities Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Search Localities Error:', error);
    throw error;
  }
};

export {
  getAllCityList,
  getAllAreasList,
  getAllLocalitiesList,
  searchLocalities,
};
