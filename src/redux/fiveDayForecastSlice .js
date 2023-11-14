import { createSlice } from '@reduxjs/toolkit';

export const fiveDayForecastSlice = createSlice({
  name: 'fiveDayForecast',
  initialState: {
    key: null,
    data: {},
    expirationTime: null
  },
  reducers: {
    setFiveDayForecast: (state, action) => {
      state.key = action.payload.key;
      state.data = action.payload.data;
      // Set expiration time to 4 hours from now
      state.expirationTime = new Date().getTime() + 4 * 60 * 60 * 1000;
    },
    resetForecast: (state) => {
        state.key = null;
        state.data = {};
        state.expirationTime = null;
      },
  }
});

export const { setFiveDayForecast, resetForecast } = fiveDayForecastSlice.actions;

export default fiveDayForecastSlice.reducer;
