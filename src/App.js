import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { TemperatureProvider } from "./TemperatureContext";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWeather, resetWeather } from "./redux/currentWeatherSlice ";
import {
  setFiveDayForecast,
  resetForecast,
} from "./redux/fiveDayForecastSlice ";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import Home from "./components/Home";
import Favorites from "./components/Favorites/Favorites";
import "./App.css";

function App() {
  const [manualUpdate, setManualUpdate] = useState(false);
  const [shouldAutoUpdate, setShouldAutoUpdate] = useState(true);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const weatherData = useSelector((state) => state.currentWeather);

  useEffect(() => {
    if (shouldAutoUpdate) {
      checkAndFetchWeather();
    }
  }, [shouldAutoUpdate]);

  useEffect(() => {
    if (manualUpdate) {
      setManualUpdate(false);
      setShouldAutoUpdate(false);
    }
  }, [manualUpdate]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const checkAndFetchWeather = async () => {
    const currentTime = new Date().getTime();
    if (!weatherData.key || weatherData.expirationTime <= currentTime) {
      let currentLocationKey = await getCurrentLocationKey();
      fetchWeatherData(currentLocationKey);
    }
  };

  const getCurrentLocationKey = async () => {
    const currentTime = new Date().getTime();
    if (weatherData.key && weatherData.expirationTime > currentTime) {
      return weatherData.key;
    }
    return await fetchLocationKey();
  };

  const fetchLocationKey = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const url = `${process.env.REACT_APP_GEOPOSITION_URL}?apikey=${process.env.REACT_APP_WEATHER_API_KEY}&q=${latitude},${longitude}`;
            const response = await fetch(url);
            const data = await response.json();
            resolve(data.Key);
          } catch (error) {
            console.error("Error fetching location key: ", error);
            resolve("215854"); // Default location key
          }
        },
        (error) => {
          console.error("Error obtaining location: ", error);
          resolve("215854"); // Default location key
        }
      );
    });
  };

  const fetchWeatherData = async (locationKey) => {
    await fetchCurrentData(locationKey);
    await fetchFiveDayForecast(locationKey);
  };

  const fetchCurrentData = async (locationKey) => {
    const url = `${process.env.REACT_APP_CURRENT_CONDITIONS_URL}${locationKey}?apikey=${process.env.REACT_APP_WEATHER_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch(setCurrentWeather({ key: locationKey, data: data[0] }));
    } catch (error) {
      console.error("Error fetching current weather data:", error);
    }
  };

  const fetchFiveDayForecast = async (locationKey) => {
    const url = `${process.env.REACT_APP_FIVE_DAYS_FORECAST_URL}${locationKey}?apikey=${process.env.REACT_APP_WEATHER_API_KEY}&metric=true`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch(setFiveDayForecast({ key: locationKey, data }));
    } catch (error) {
      console.error("Error fetching five day forecast data:", error);
    }
  };

  const handleLocationChange = async (key) => {
    setManualUpdate(true);
    await dispatch(resetWeather());
    fetchWeatherData(key);
  };

  return (
    <Router>
      <TemperatureProvider>
        <div className="App">
          <NavigationBar handleLocationChange={handleLocationChange} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/favorites"
              element={<Favorites onFavorClick={handleLocationChange} />}
            />
          </Routes>
        </div>
      </TemperatureProvider>
    </Router>
  );
}

export default App;
