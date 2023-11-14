import { createSlice } from '@reduxjs/toolkit';

export const hourlyForecastSlice = createSlice({
  name: 'hourlyForecast',
  initialState: {
    key: null,
    data: {},
    expirationTime: null
  },
  reducers: {
    setHourlyForecast: (state, action) => {
      state.key = action.payload.key;
      state.data = action.payload.data;
      // Set expiration time to 1 hour from now
      state.expirationTime = new Date().getTime() + 1 * 60 * 60 * 1000;
    },
    resetForecast: (state) => {
      state.key = null;
      state.data = {};
      state.expirationTime = null;
    },
  }
});

export const { setHourlyForecast, resetForecast } = hourlyForecastSlice.actions;

export default hourlyForecastSlice.reducer;
