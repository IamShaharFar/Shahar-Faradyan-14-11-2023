import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const currentFavorWeatherSlice = createSlice({
  name: 'currentFavorWeather',
  initialState,
  reducers: {
    addFavoriteWeather: (state, action) => {
      const { key, data } = action.payload;
      state[key] = {
        data: data,
        expirationTime: new Date().getTime() + 30 * 60 * 1000 
      };
    },
    removeFavorWeatherByKey: (state, action) => {
      delete state[action.payload];
    },
  },
});

export const { addFavoriteWeather, removeFavorWeatherByKey } = currentFavorWeatherSlice.actions;
export default currentFavorWeatherSlice.reducer;
