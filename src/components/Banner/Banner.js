import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite } from "../../redux/favoritesSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Banner.css";

const apiKey = "S0sGyx9oJ2C7RaYx17ns7qqai1QTSZYt";

const Banner = ({ selectedLocation }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const [weather, setWeather] = useState(null);
  const cityName = getFormattedCityName(weather);
  const cityKey = getLocationKey(weather?.[0]?.MobileLink);
  const isFavorite = favorites.some((fav) => fav.key === cityKey);

  useEffect(() => {
    getWeatherData(selectedLocation);
  }, [selectedLocation]);

  const getWeatherData = async (locationKey) => {
    try {
      const weatherResponse = await fetch(
        `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`
      );
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);
      localStorage.setItem(
        "currentWeather",
        JSON.stringify({
          data: weatherData,
          timestamp: new Date().getTime(),
          key: locationKey,
        })
      );
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchLocationKeyAndWeather = async (latitude, longitude) => {
    try {
      const locationResponse = await fetch(
        `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${latitude},${longitude}`
      );
      const locationData = await locationResponse.json();
      await getWeatherData(locationData.Key);
    } catch (error) {
      console.error("Error fetching location key:", error);
      throw error;
    }
  };

  function getFormattedCityName(weatherData) {
    if (!weatherData || !weatherData.length || !weatherData[0].MobileLink) {
      return "";
    }

    const url = weatherData[0].MobileLink;
    const citySlug = url.split("/")[5];
    const formattedCityName = citySlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return formattedCityName;
  }

  function getLocationKey(url) {
    if (!url) return null;
    // Split the URL by '?' to separate the path from the query string
    const path = url.split("?")[0];
    // Split the path into segments
    const segments = path.split("/");
    // The key is the last segment of the path
    const key = segments[segments.length - 1];
    return key;
  }

  function handleFavoriteClick() {
    const favoriteData = { key: cityKey, name: cityName };
    console.log("Adding to favorites:", favoriteData);
    if (isFavorite) {
      dispatch(removeFavorite(cityKey));
    } else {
      dispatch(addFavorite(favoriteData));
    }
  }

  if (!weather) {
    return <div className="banner"></div>; // or any other loading state representation
  }

  return (
    <div className="banner">
      <div className="current-temp-card-container">
        <div className="current-temp-card">
          {isFavorite ? (
            <i
              className="fa-solid fa-star favorite-star"
              onClick={handleFavoriteClick}
            ></i>
          ) : (
            <i
              className="far fa-star favorite-star"
              onClick={handleFavoriteClick}
            ></i>
          )}
          <div className="current-temp-card-content">
            <img
              src={`https://developer.accuweather.com/sites/default/files/${
                weather[0].WeatherIcon >= 10
                  ? weather[0].WeatherIcon
                  : "0" + weather[0].WeatherIcon
              }-s.png`}
              className="current-icon"
              alt="Weather Icon"
            />
            <h3 className="card-title mb-2">{cityName}</h3>
            <p className="card-text">
              <strong>
                {weather[0].Temperature.Metric.Value}°
                {weather[0].Temperature.Metric.Unit}
              </strong>{" "}
              {weather[0].WeatherText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
