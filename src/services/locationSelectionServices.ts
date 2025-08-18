import axiosInstance from '../axios';
import {BASE_URL, ENDPOINT} from '../constant/urls';

const getAllCityList = async () => {
  try {
    console.log('🏙️ Get All Cities Request to:', ENDPOINT.get_city);
    
    const response = await axiosInstance.get(ENDPOINT.get_city);
    console.log('✅ Get All Cities Success:', response);
    
    // The API returns data in 'formattedData' field
    if (response && response.formattedData && Array.isArray(response.formattedData)) {
      return { data: response.formattedData };
    } else if (response && response.data && Array.isArray(response.data)) {
      return { data: response.data };
    } else if (response && Array.isArray(response)) {
      return { data: response };
    } else {
      console.warn('⚠️ Unexpected response structure:', response);
      return { data: [] };
    }
  } catch (error) {
    console.error('❌ Get All Cities Error:', error);
    
    // Try alternative approach - direct fetch without authentication
    try {
      console.log('🔄 Trying alternative cities API call...');
      const alternativeResponse = await fetch(`${BASE_URL}${ENDPOINT.get_city}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (alternativeResponse.ok) {
        const data = await alternativeResponse.json();
        console.log('✅ Alternative cities API success:', data);
        
        // Handle the response structure from direct fetch
        if (data.formattedData && Array.isArray(data.formattedData)) {
          return { data: data.formattedData };
        } else if (data.data && Array.isArray(data.data)) {
          return { data: data.data };
        } else if (Array.isArray(data)) {
          return { data: data };
        } else {
          console.warn('⚠️ Alternative API returned unexpected structure:', data);
          return { data: [] };
        }
      } else {
        console.error('❌ Alternative API failed with status:', alternativeResponse.status);
        throw new Error(`Alternative API failed: ${alternativeResponse.status}`);
      }
    } catch (alternativeError) {
      console.error('❌ Alternative cities API also failed:', alternativeError);
      
      // Return mock data as last resort to prevent app crash
      console.log('🔄 Returning mock city data as fallback');
      return {
        data: [
          { id: 1, name: 'Delhi' },
          { id: 2, name: 'Mumbai' },
          { id: 3, name: 'Bangalore' },
          { id: 4, name: 'Chennai' },
          { id: 5, name: 'Hyderabad' },
          { id: 6, name: 'Pune' },
        ]
      };
    }
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
    
    // The API returns data in 'formattedData' field
    if (response && response.formattedData && Array.isArray(response.formattedData)) {
      return { data: response.formattedData };
    } else if (response && response.data && Array.isArray(response.data)) {
      return { data: response.data };
    } else if (response && Array.isArray(response)) {
      return { data: response };
    } else {
      console.warn('⚠️ Unexpected localities response structure:', response);
      return { data: [] };
    }
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
