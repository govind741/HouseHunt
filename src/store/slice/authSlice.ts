import {createSlice} from '@reduxjs/toolkit';
import {AgentUserType, UserType} from '../../types';
interface authSliceState {
  token: string | null;
  userData: (AgentUserType & UserType) | null;
  isOnBoardingComplete: boolean;
  isLoading?: boolean;
}

const initialState: authSliceState = {
  token: null,
  userData: null,
  isOnBoardingComplete: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setIsOnBoardingComplete: (state, action) => {
      state.isOnBoardingComplete = action.payload;
    },
    clearAuthState: state => {
      return {
        ...state,
        token: null,
        isOnBoardingComplete: false,
      };
    },
    setLoginLoader: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setToken,
  clearAuthState,
  setIsOnBoardingComplete,
  setLoginLoader,
  setUserData,
} = authSlice.actions;

export default authSlice.reducer;
