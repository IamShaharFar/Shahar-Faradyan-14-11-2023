import { createSlice } from "@reduxjs/toolkit";

export const currentWeatherSlice = createSlice({
  name: "currentWeather",
  initialState: {
    key: null,
    data: {},
    expirationTime: null,
  },
  reducers: {
    setCurrentWeather: (state, action) => {
      state.key = action.payload.key;
      state.data = action.payload.data;
      // Set expiration time to 30 minutes from now
      state.expirationTime = new Date().getTime() + 30 * 60 * 1000;
    },
    resetWeather: (state) => {
      state.key = null;
      state.data = {};
      state.expirationTime = null;
    },
  },
});

export const { setCurrentWeather, resetWeather } = currentWeatherSlice.actions;

export default currentWeatherSlice.reducer;
