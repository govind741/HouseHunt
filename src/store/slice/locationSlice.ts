import {createSlice} from '@reduxjs/toolkit';
import {locationType} from '../../types';

interface LocationSliceState {
  location: locationType;
}

const initialState: LocationSliceState = {
  location: {
    area_id: null,
    city_id: null,
    id: null,
    name: '',
    ranking: null,
    city_name: '',
    area_name: '',
    locality_name: '',
  },
};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
    },
  },
});

export const {setLocation} = locationSlice.actions;

export default locationSlice.reducer;
