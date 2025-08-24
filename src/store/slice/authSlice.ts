import {createSlice} from '@reduxjs/toolkit';
import {AgentUserType, UserType} from '../../types';
interface authSliceState {
  token: string | null;
  userData: (AgentUserType & UserType) | null;
  isOnBoardingComplete: boolean;
  isLoading?: boolean;
  isGuestMode: boolean;
}

const initialState: authSliceState = {
  token: null,
  userData: null,
  isOnBoardingComplete: false,
  isLoading: false,
  isGuestMode: true, // Start in guest mode by default
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      // When token is set, user is no longer in guest mode
      if (action.payload) {
        state.isGuestMode = false;
      }
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setIsOnBoardingComplete: (state, action) => {
      state.isOnBoardingComplete = action.payload;
    },
    setGuestMode: (state, action) => {
      state.isGuestMode = action.payload;
    },
    clearAuthState: state => {
      return {
        ...state,
        token: null,
        userData: null,
        isOnBoardingComplete: false,
        isGuestMode: true, // Return to guest mode when clearing auth
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
  setGuestMode,
} = authSlice.actions;

export default authSlice.reducer;
