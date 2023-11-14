import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import favoritesReducer from './redux/favoritesSlice';
import currentWeatherReducer  from './redux/currentWeatherSlice ';
import fiveDayForecastReducer from './redux/fiveDayForecastSlice ';
import currentFavorReducer from './redux/currentFavorWeather';

const rootReducer = combineReducers({
  favorites: favoritesReducer,
  currentWeather: currentWeatherReducer,
  fiveDayForecast: fiveDayForecastReducer,
  currentFavorWeather: currentFavorReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export const persistor = persistStore(store);
