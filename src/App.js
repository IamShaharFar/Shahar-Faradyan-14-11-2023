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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const showErrorPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

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
    try {
      const currentTime = new Date().getTime();
      if (!weatherData.key || weatherData.expirationTime <= currentTime) {
        let currentLocationKey = await getCurrentLocationKey();
        fetchWeatherData(currentLocationKey);
      }
    } catch (err) {
      showErrorPopup(
        "Automatic weather update failed. Please refresh the page or try again later"
      );
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
          showErrorPopup(
            "We're unable to access your location. Please check your location settings or try again later."
          );
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
      showErrorPopup(
        "Unable to fetch current weather data. Please check your network connection."
      );
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
      showErrorPopup(
        "Unable to fetch the five-day forecast. Please try again later."
      );
      console.error("Error fetching five day forecast data:", error);
    }
  };

  const handleLocationChange = async (key) => {
    try {
      setManualUpdate(true);
      await dispatch(resetWeather());
      fetchWeatherData(key);
    } catch (err) {
      showErrorPopup(
        "There was an issue updating the location. Please try again."
      );
    }
  };

  return (
    <Router>
      <TemperatureProvider>
        <div className="App">
          {showPopup && (
            <div
              style={{
                position: "fixed",
                top: "0px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "red",
                color: "white",
                padding: "20px",
                borderRadius: "10px",
                zIndex: 1000,
              }}
            >
              {popupMessage}
            </div>
          )}
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
