import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentWeather,
  resetWeather,
} from "../../redux/currentWeatherSlice ";
import { addFavorite, removeFavorite } from "../../redux/favoritesSlice";
import { useTemperature } from "../../TemperatureContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Banner.css";

const Banner = () => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const weatherData = useSelector((state) => state.currentWeather);
  const [weather, setWeather] = useState(null);
  const { unit } = useTemperature();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const showErrorPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const cityName = getCityNameFromWeatherData(weather);
  const cityKey = getCityKeyFromWeatherData(weather);
  const isFavorite = favorites.some((fav) => fav.key === cityKey);

  function getCityNameFromWeatherData() {
    try {
      if (!weatherData || !weatherData.data || !weatherData.data.MobileLink)
        return "";
      const url = weatherData.data.MobileLink;
      return url
        .split("/")[5]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    } catch (err) {
      showErrorPopup("Error processing weather data.");
    }
  }

  function getCityKeyFromWeatherData() {
    return weatherData && weatherData.key ? weatherData.key : null;
  }

  function toggleFavorite() {
    try {
      const favoriteData = { key: cityKey, name: cityName };
      if (isFavorite) {
        dispatch(removeFavorite(cityKey));
      } else {
        dispatch(addFavorite(favoriteData));
      }
    } catch (err) {
      showErrorPopup("Unable to update favorites.");
    }
  }

  function displayTemperature(tempCelsius) {
    return unit === "Celsius"
      ? `${tempCelsius}°C`
      : `${convertToFahrenheit(tempCelsius).toFixed(1)}°F`;
  }

  function convertToFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
  }

  return (
    <div>
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
      {!weatherData || !weatherData.key ? (
        <div className="banner d-flex justify-content-start align-items-center w-100">
          <div className="current-temp-card-container d-flex flex-column align-items-center justify-content-center position-absolute m-0 rounded-4">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "#564f8a" }}
            ></div>
            <span className="d-block text-center mt-2">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="banner d-flex justify-content-start align-items-center w-100">
          <div className="current-temp-card-container position-absolute m-0 rounded-4">
            <div className="current-temp-card text-center d-flex flex-column align-items-center justify-content-center w-100 h-100">
              <i
                className={`fa-star favorite-star position-absolute ${
                  isFavorite ? "fa-solid" : "far"
                }`}
                onClick={toggleFavorite}
              ></i>
              <div className="current-temp-card-content position-absolute d-flex flex-column align-items-center justify-content-center h-100 w-100">
                {weatherData &&
                weatherData.key &&
                weatherData.data.WeatherIcon !== undefined ? (
                  <img
                    src={`https://developer.accuweather.com/sites/default/files/${
                      weatherData.data.WeatherIcon >= 10
                        ? weatherData.data.WeatherIcon
                        : "0" + weatherData.data.WeatherIcon
                    }-s.png`}
                    className="current-icon"
                    alt="Weather Icon"
                  />
                ) : (
                  <div>Loading weather icon...</div>
                )}

                <h3 className="mb-2">{cityName}</h3>
                <p>
                  <strong>
                    {displayTemperature(weatherData.data.Temperature.Metric.Value)}
                  </strong>{" "}
                  {weatherData.data.WeatherText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;
