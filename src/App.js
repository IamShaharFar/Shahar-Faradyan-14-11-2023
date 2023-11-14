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
import CurrentWeather from "./components/CurrentWeather/CurrentWeather";

function App() {
  const [manualUpdate, setManualUpdate] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const weatherData = useSelector((state) => state.currentWeather);
  const geopositionUrlApi = process.env.REACT_APP_GEOPOSITION_URL;
  const currentWeatherApiUrl = process.env.REACT_APP_CURRENT_CONDITIONS_URL;
  const fiveDayForecastApiUrl = process.env.REACT_APP_FIVE_DAYS_FORECAST_URL;
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  useEffect(() => {
    async function checkAndFetchWeather() {
      const currentTime = new Date().getTime();
      if (!weatherData.key || weatherData.expirationTime <= currentTime) {
        let currentLocationKey = await getCurrentLocationKey();
        fetchCurrentData(currentLocationKey);
        fetchFiveDayForecast(currentLocationKey);
      }
    }
    if (!manualUpdate) {
      checkAndFetchWeather();
    }
    else{
      setManualUpdate(false);
    }
  }, [weatherData]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  async function getCurrentLocationKey() {
    const currentTime = new Date().getTime();

    if (
      weatherData &&
      weatherData.key &&
      weatherData.expirationTime > currentTime
    ) {
      return weatherData.key;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
            const url = `${geopositionUrlApi}?apikey=${apiKey}&q=${latitude},${longitude}`;
            const response = await fetch(url);
            const data = await response.json();
            resolve(data.Key);
          } catch (error) {
            console.error(
              "Error occurred while fetching location key: ",
              error
            );
            resolve("215854");
          }
        },
        (error) => {
          console.error("Error obtaining location: ", error);
          resolve("215854");
        }
      );
    });
  }

  async function fetchCurrentData(locationKey) {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const url = `${currentWeatherApiUrl}${locationKey}?apikey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch(setCurrentWeather({ key: locationKey, data: data[0] }));
    } catch (error) {
      console.error("Error fetching current weather data:", error);
    }
  }

  async function fetchFiveDayForecast(locationKey) {
    const url = `${fiveDayForecastApiUrl}${locationKey}?apikey=${apiKey}&metric=true`; // Assuming you want metric units
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch(setFiveDayForecast({ key: locationKey, data }));
    } catch (error) {
      console.error("Error fetching five day forecast data:", error);
    }
  }

  async function handleLocationChange(key) {
    console.log(key);
    setManualUpdate(true);
    await dispatch(resetWeather());
    fetchCurrentData(key);
  }

  return (
    <Router>
      <TemperatureProvider>
        <div className="App">
          <NavigationBar handleLocationChange={handleLocationChange} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/favorites"
              element={
                <Favorites onFavorClick={(key) => handleLocationChange(key)} />
              }
            />
          </Routes>
        </div>
      </TemperatureProvider>
    </Router>
  );
}

export default App;
