import React from 'react';
import { useSelector } from 'react-redux';
import "./Current.css";

const Current = () => {
  const weatherData = useSelector(state => state.currentWeather.data);

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  const getIconUrl = (icon) => `https://developer.accuweather.com/sites/default/files/${icon.toString().padStart(2, '0')}-s.png`;
  // Convert local observation date time to a readable format
  const localObservationDateTime = new Date(weatherData.LocalObservationDateTime).toLocaleString();

  return (
    <div className="current-weather-container">
      <div className="location-date">
        <h3 className="location">{localObservationDateTime}</h3> {/* Example of how you might display the date */}
        <h4 className="weather-text">{weatherData.WeatherText}</h4>
      </div>
      <div className="weather-details">
        <div className="weather-icon">
          {/* You might want to map WeatherIcon number to your own icons */}
          <img src={getIconUrl(weatherData.WeatherIcon)} alt="Weather Icon" />
        </div>
        <div className="other-details">
          {/* Display other details like precipitation, day/night, etc. */}
        </div>
      </div>
      {/* Add more UI elements as needed */}
    </div>
  );
};

export default Current;
