import axiosInstance from '../axios';
import {ENDPOINT} from '../constant/urls';

const getAllAgentList = async (id: number) => {
  try {
    console.log('👥 Get All Agent List Request:', {locationId: id});
    const url = `${ENDPOINT.get_agent_by_location}?locationId=${id}`;
    const response = await axiosInstance.get(url);
    console.log('✅ Get All Agent List Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get All Agent List Error:', error);
    throw error;
  }
};

const getPublicAgentList = async (id: number) => {
  try {
    console.log('👥 Get Public Agent List Request:', {locationId: id});
    const url = `${ENDPOINT.public_agents}${id}`;
    console.log('Public Agent URL:', url);
    
    const response = await axiosInstance.get(url);
    console.log('✅ Get Public Agent List Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Public Agent List Error:', error);
    throw error;
  }
};

const getAgentDetailsById = async (id: any) => {
  try {
    console.log('👤 Get Agent Details By ID Request:', {agentId: id});
    const response = await axiosInstance.get(`${ENDPOINT.get_agent_details}/${id}`);
    console.log('✅ Get Agent Details By ID Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Get Agent Details By ID Error:', error);
    throw error;
  }
};

const handleInteraction = async (payload: any) => {
  try {
    console.log('👆 Handle User Interaction Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.user_interaction, payload);
    console.log('✅ Handle User Interaction Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Handle User Interaction Error:', error);
    throw error;
  }
};

const deleteUser = async (payload: any) => {
  try {
    console.log('🗑️ Delete User Request:', payload);
    const response = await axiosInstance.post(ENDPOINT.verify_delete_user, payload);
    console.log('✅ Delete User Success:', response);
    return response;
  } catch (error) {
    console.error('❌ Delete User Error:', error);
    throw error;
  }
};

export {
  getAllAgentList,
  getAgentDetailsById,
  handleInteraction,
  deleteUser,
  getPublicAgentList,
};
