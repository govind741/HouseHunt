import axiosInstance from '../axios';
import {BASE_URL, ENDPOINT} from '../constant/urls';

const getAllCityList = async () => {
  try {
    console.log('Get All Cities Request to:', ENDPOINT.get_city);
    
    const response = await axiosInstance.get(ENDPOINT.get_city);
    console.log('Get All Cities Success:', {
      hasResponse: !!response,
      responseType: typeof response,
      hasData: !!response?.data,
      hasFormattedData: !!response?.formattedData,
      isArray: Array.isArray(response),
      responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
    });
    
    // Handle different response structures and return consistent format
    if (response && response.formattedData && Array.isArray(response.formattedData)) {
      return { 
        data: response.formattedData,
        formattedData: response.formattedData 
      };
    } else if (response && response.data && Array.isArray(response.data)) {
      return { 
        data: response.data,
        formattedData: response.data 
      };
    } else if (response && Array.isArray(response)) {
      return { 
        data: response,
        formattedData: response 
      };
    } else {
      console.warn('Unexpected response structure:', response);
      return { data: [], formattedData: [] };
    }
  } catch (error: any) {
    console.error('Get All Cities Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
    });
    throw error;
  }
};

const getAllAreasList = async (cityId?: number) => {
  try {
    console.log('Get All Areas Request to:', ENDPOINT.get_areas, 'with cityId:', cityId);
    const response = await axiosInstance.get(`${ENDPOINT.get_areas}?cityId=${cityId}`);
    console.log('Areas List Response:', response);
    return response;
  } catch (error: any) {
    console.error('Get All Areas Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
    });
    throw error;
  }
};

const getAllLocalitiesList = async (payload: {cityId: number; areaId?: number}) => {
  try {
    console.log('Get All Localities Request to:', ENDPOINT.get_localities, 'with payload:', payload);
    const queryParams = new URLSearchParams();
    queryParams.append('cityId', payload.cityId.toString());
    if (payload.areaId) {
      queryParams.append('areaId', payload.areaId.toString());
    }
    
    const response = await axiosInstance.get(`${ENDPOINT.get_localities}?${queryParams.toString()}`);
    console.log('Localities List Response:', response);
    return response;
  } catch (error: any) {
    console.error('Get All Localities Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
    });
    throw error;
  }
};

const searchLocalities = async (payload: {name: string; cityId: number}) => {
  try {
    console.log('Search Localities Request to:', ENDPOINT.get_localities, 'with payload:', payload);
    const response = await axiosInstance.get(`${ENDPOINT.get_localities}?cityId=${payload.cityId}&search=${payload.name}`);
    console.log('Search Localities Response:', response);
    return response;
  } catch (error: any) {
    console.error('Search Localities Error:', {
      message: error?.message,
      status: error?.response?.status,
      url: error?.config?.url,
    });
    throw error;
  }
};

export {
  getAllCityList,
  getAllAreasList,
  getAllLocalitiesList,
  searchLocalities,
};
