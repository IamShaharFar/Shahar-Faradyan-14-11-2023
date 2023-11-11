import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../../redux/favoritesSlice";
import "./Favorites.css";
import Banner from "../Banner/Banner";

const apiKey = 'S0sGyx9oJ2C7RaYx17ns7qqai1QTSZYt'; // Replace with your API key

const Favorites = ({selectedLocation}) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const [favoriteWeather, setFavoriteWeather] = useState({});

  useEffect(() => {
    const storedWeather = JSON.parse(localStorage.getItem("currentfavorweather")) || {};
    const updatedWeather = { ...storedWeather };

    const fetchWeatherData = async (locationKey) => {
      try {
        const response = await fetch(`https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`);
        const data = await response.json();
        updatedWeather[locationKey] = { data: data, timestamp: new Date().getTime() };
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    const updateWeatherData = async () => {
      for (const favor of favorites) {
        const weatherData = storedWeather[favor.key];
        if (!weatherData || new Date().getTime() - weatherData.timestamp > 1800000) {
          await fetchWeatherData(favor.key);
        }
      }
      setFavoriteWeather(updatedWeather);
      localStorage.setItem("currentfavorweather", JSON.stringify(updatedWeather));
    };

    updateWeatherData();
  }, [favorites]);

  const isFavorite = (cityKey) => {
    return favorites.some((favor) => favor.key === cityKey);
  };

  const handleFavoriteClick = (cityKey, cityName) => {
    const favoriteData = { key: cityKey, name: cityName };
    if (isFavorite(cityKey)) {
      dispatch(removeFavorite(cityKey));
    } else {
      dispatch(addFavorite(favoriteData));
    }
  };

  const getFavoriteWeatherData = (key) => {
    return favoriteWeather[key] ? favoriteWeather[key].data : null;
  };

  return (
    <div className="favorites-container">
      <Banner selectedLocation={selectedLocation}/>
      {favorites.map((favor) => {
        const weatherData = getFavoriteWeatherData(favor.key);
        const weatherIcon = weatherData && weatherData.length > 0 ? (
          <img
            src={`https://developer.accuweather.com/sites/default/files/${
              weatherData[0].WeatherIcon >= 10
                ? weatherData[0].WeatherIcon
                : "0" + weatherData[0].WeatherIcon
            }-s.png`}
            className="current-icon"
            alt="Weather Icon"
          />
        ) : null;

        return (
          <div key={favor.key} className="favorite-card">
            <div className="card-content">
              {weatherIcon}
              <h3>{favor.name}</h3>
              {weatherData && weatherData.length > 0 && (
                <>
                  <p>{weatherData[0].WeatherText}</p>
                  <p>{weatherData[0].Temperature.Metric.Value}°C</p>
                </>
              )}
              {isFavorite(favor.key) ? (
                <i
                  className="fa-solid fa-star favorite-star"
                  onClick={() => handleFavoriteClick(favor.key, favor.name)}
                ></i>
              ) : (
                <i
                  className="far fa-star favorite-star"
                  onClick={() => handleFavoriteClick(favor.key, favor.name)}
                ></i>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Favorites;
