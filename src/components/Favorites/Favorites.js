import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../../redux/favoritesSlice";
import {
  addFavoriteWeather,
  removeFavorWeatherByKey,
} from "../../redux/currentFavorWeather";
import { useTemperature } from "../../TemperatureContext";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";

const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

const Favorites = ({ onFavorClick }) => {
  const dispatch = useDispatch();
  const currentWeather = useSelector((state) => state.currentWeather);
  const fiveDayForecast = useSelector((state) => state.fiveDayForecast);
  const favorites = useSelector((state) => state.favorites);
  const favoriteWeather = useSelector((state) => state.currentFavorWeather);
  const currentWeatherApiUrl = process.env.REACT_APP_CURRENT_CONDITIONS_URL;
  const navigate = useNavigate();
  const { unit } = useTemperature();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const showErrorPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  useEffect(() => {
    const fetchWeatherData = async (locationKey) => {
      try {
        const response = await fetch(
          `${currentWeatherApiUrl}${locationKey}?apikey=${apiKey}`
        );
        if (!response.ok) {
          showErrorPopup("Error fetching data from the API.");
          return;
        }
        const data = await response.json();
        dispatch(addFavoriteWeather({ key: locationKey, data: data }));
      } catch (error) {
        showErrorPopup("Failed to load weather data. Please try again later.");
      }
    };

    const updateWeatherData = async () => {
      for (const favor of favorites) {
        const weatherData = favoriteWeather[favor.key];
        if (!weatherData || new Date().getTime() > weatherData.expirationTime) {
          await fetchWeatherData(favor.key);
        }
      }
    };

    updateWeatherData();
  }, [favorites.length, favoriteWeather]);

  const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;
  const convertToCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

  function formatTemperature(fahrenheit) {
    const fixedValue = parseFloat(fahrenheit).toFixed(1);
    if (unit === "Celsius") {
      return `${convertToCelsius(fahrenheit).toFixed(1)}°C`;
    } else {
      return `${fixedValue}°F`;
    }
  }

  const displayTemperature = (temp) => {
    if (unit === "Celsius") {
      return `${temp}°C`;
    } else {
      return `${convertToFahrenheit(temp)}°F`;
    }
  };

  const isFavorite = (cityKey) => {
    return favorites.some((favor) => favor.key === cityKey);
  };

  const handleFavoriteClick = (cityKey, cityName) => {
    try {
      const favoriteData = { key: cityKey, name: cityName };
      if (isFavorite(cityKey)) {
        dispatch(removeFavorite(cityKey));
      } else {
        dispatch(addFavorite(favoriteData));
      }
    } catch (error) {
      showErrorPopup("Unable to update favorites. Please try again.");
    }
  };

  const handleCardClick = (key) => {
    try {
      onFavorClick(key);
      navigate("/");
    } catch (error) {
      showErrorPopup("Navigation error. Please try again.");
    }
  };

  const getFavoriteWeatherData = (key) => {
    const weather = favoriteWeather[key];
    if (!weather || new Date().getTime() > weather.expirationTime) {
      dispatch(removeFavorWeatherByKey(key));
      return null;
    }
    return weather.data;
  };

  function getCityNameFromWeatherData() {
    try {
      if (
        !currentWeather ||
        !currentWeather.data ||
        !currentWeather.data.MobileLink
      )
        return "";
      const url = currentWeather.data.MobileLink;
      return url
        .split("/")[5]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    } catch (err) {
      console.log("error while getting name");
    }
  }

  function formatSevirity(sevirity) {
    return sevirity <= 2
      ? "Low"
      : sevirity <= 4
      ? "Moderate"
      : sevirity <= 6
      ? "High"
      : "Very High";
  }

  const getIconUrl = (iconNumber) =>
    `https://developer.accuweather.com/sites/default/files/${iconNumber
      .toString()
      .padStart(2, "0")}-s.png`;

  const weatherData = {
    location: getCityNameFromWeatherData(),
    currentDay: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    currentTemp: formatTemperature(
      currentWeather.data.Temperature.Imperial.Value
    ),
    imgUrl: getIconUrl(currentWeather.data.WeatherIcon),
    currentCondition: currentWeather.data.WeatherText,
    highTemp: formatTemperature(
      fiveDayForecast.data.DailyForecasts[0].Temperature.Maximum.Unit === "C"
        ? convertToFahrenheit(
            fiveDayForecast.data.DailyForecasts[0].Temperature.Maximum.Value
          )
        : fiveDayForecast.data.DailyForecasts[0].Temperature.Maximum.Value
    ),
    lowTemp: formatTemperature(
      fiveDayForecast.data.DailyForecasts[0].Temperature.Minimum.Unit === "C"
        ? convertToFahrenheit(
            fiveDayForecast.data.DailyForecasts[0].Temperature.Minimum.Value
          )
        : fiveDayForecast.data.DailyForecasts[0].Temperature.Minimum.Value
    ),
    severity: formatSevirity(fiveDayForecast.data.Headline.Severity),
    text: fiveDayForecast.data.Headline.Text,
  };

  return (
    <div className="d-flex flex-column align-items-center ms-3 me-3">
      <div className="ms-3 me-2 favorites-container">
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
        <div className="current-weather-container w-100 m-0 mb-4 p-0 d-flex flex-column">
          <div className="location-date d-flex flex-column align-items-start ms-4 mt-4">
            <div className="d-flex justify-content-center align-items-center">
              <h4 className="text-main m-0">{weatherData.location}</h4>
              <i
                title={
                  isFavorite(currentWeather.key)
                    ? "Remove from Favorites"
                    : "Add to Favorites"
                }
                className={`fa${
                  isFavorite(currentWeather.key) ? "-solid" : "-regular"
                } fa-bookmark fa-lg ms-2`}
                onClick={() => handleFavoriteClick(currentWeather.key)}
              ></i>
            </div>
            <h6 className="text-secondary">{weatherData.currentDay}</h6>
          </div>
          <div className="current-daily-container d-flex flex-column flex-md-row justify-content-center text-center mb-4 mt-4 pe-0 pe-md-4">
            <div className="current-temp me-0 pe-md-4 d-flex align-content-center justify-content-around col-12 col-md-6 pb-4 pb-md-0">
              <div className="current-weather d-flex align-items-center justify-content-center">
                <img width={180} src={weatherData.imgUrl} />
                <div>
                  <h1 className="text-main">{weatherData.currentTemp}</h1>
                  <h3 className="text-main m-0">
                    {weatherData.currentCondition}
                  </h3>
                  <h5 className="text-secondary">{weatherData.text}</h5>
                </div>
              </div>
            </div>
            <div className="day-details ms-0 ms-md-4 mt-4 mt-md-0 col-12 col-md-6 d-flex justify-content-center flex-column rounded-4">
              <div className="d-flex align-items-start">
                <h5 className="pt-3 ps-3 mb-3 text-secondary">
                  Weather Overview
                </h5>
              </div>
              <div className="row mb-3">
                <div className="col-4 d-flex flex-column">
                  <span className="text-main mb-1">{weatherData.highTemp}</span>
                  <span className="text-secondary">
                    <i className="fa-solid fa-temperature-high fa-lg me-2"></i>
                    High
                  </span>
                </div>
                <div className="col-4 d-flex flex-column">
                  <span className="text-main mb-1">{weatherData.lowTemp}</span>
                  <span className="text-secondary">
                    <i className="fa-solid fa-temperature-low fa-lg me-2"></i>
                    Low
                  </span>
                </div>
                <div className="col-4 d-flex flex-column">
                  <span className="text-main mb-1">{weatherData.severity}</span>
                  <span className="text-secondary">
                    <i className="fa-solid fa-cloud-rain fa-lg me-2"></i>
                    severity
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex w-100 justify-content-center flex-wrap">
          {favorites.length == 0 ? (
            <div className="no-favorites-message">
              You don't have any favorite locations yet.
            </div>
          ) : (
            favorites.map((fav) => {
              const favoriteData = getFavoriteWeatherData(fav.key);
              if (!favoriteData) {
                // Optionally, handle the case where favorite data is not available
                return null; // or return a placeholder component/message
              }

              return (
                <div
                  key={fav.key}
                  className="fav-card mb-4 ms-3 d-flex flex-column justify-content-center align-items-center rounded-4"
                >
                  <i
                    onClick={() => handleFavoriteClick(fav.key)}
                    title={
                      isFavorite(fav.key)
                        ? "Remove from Favorites"
                        : "Add to Favorites"
                    }
                    className={`position-absolute fav-icon fa${
                      isFavorite(fav.key) ? "-solid" : "-regular"
                    } fa-bookmark fa-xl ms-2`}
                  ></i>
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    onClick={() => handleCardClick(fav.key)}
                  >
                    <h3 className="text-main text-center fav-name">
                      {fav.name}
                    </h3>
                    <img
                      width={100}
                      src={getIconUrl(favoriteData[0].WeatherIcon)}
                      alt={fav.name}
                    />
                    <h5 className="text-main">
                      {formatTemperature(
                        favoriteData[0].Temperature.Imperial.Value
                      )}
                    </h5>
                  </div>
                </div>
              );
            })
          )}
          {}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
