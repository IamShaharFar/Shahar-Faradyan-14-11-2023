import React, { useState, useEffect } from "react";
import "./FiveDaysForecast.css";

const FiveDaysForecast = ({ selectedLocation }) => {
  const [forecastData, setForecastData] = useState(null);
  const apiKey = "S0sGyx9oJ2C7RaYx17ns7qqai1QTSZYt";
  const apiUrl = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${selectedLocation}?apikey=${apiKey}`;

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const forecastWithTimestampAndKey = {
          data: data,
          timestamp: new Date().getTime(),
          key: selectedLocation
        };
        localStorage.setItem("fivedaysforecast", JSON.stringify(forecastWithTimestampAndKey));
        setForecastData(data); // Update state
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const storedForecast = localStorage.getItem("fivedaysforecast");
    if (storedForecast) {
      const { data, timestamp, key } = JSON.parse(storedForecast);
      // Check if the stored forecast data is for the current location and is still valid (not older than 4 hours)
      if (key === selectedLocation && new Date().getTime() - timestamp < 4 * 60 * 60 * 1000) {
        setForecastData(data);
      } else {
        fetchForecastData();
      }
    } else {
      fetchForecastData();
    }
  }, [selectedLocation, apiUrl]);

  const fahrenheitToCelsius = (f) => Math.round(((f - 32) * 5) / 9);

  const renderForecastCard = (dayForecast) => (
    <div className="card ms-1 me-1" key={dayForecast.EpochDate}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <h5 className="card-title equal-height-title">
          {new Date(dayForecast.Date).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "numeric",
          })}
        </h5>
        <div className="equal-height-icon">
          <img
            src={`https://developer.accuweather.com/sites/default/files/${
              dayForecast.Day.Icon >= 10
                ? dayForecast.Day.Icon
                : "0" + dayForecast.Day.Icon
            }-s.png`}
            alt="Weather Icon"
          />
        </div>
        <p className="card-text equal-height-text">{dayForecast.Day.IconPhrase}</p>
        <p className="card-text equal-height-text">
          Min: {fahrenheitToCelsius(dayForecast.Temperature.Minimum.Value)}°C /
          Max: {fahrenheitToCelsius(dayForecast.Temperature.Maximum.Value)}°C
        </p>
      </div>
    </div>
  );
  

  const renderTodayCard = (todayForecast) => (
    <div className="card today-card me-1 ms-1" key={todayForecast.EpochDate}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <h5 className="card-title equal-height-title">
          Today -{" "}
          {new Date(todayForecast.Date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "numeric",
          })}
        </h5>
        <div className="d-flex justify-content-evenly w-100">
          <div className="text-center">
            <p className="equal-height-text">Day</p>
            <div className="equal-height-icon">
              <img
                src={`https://developer.accuweather.com/sites/default/files/${
                  todayForecast.Day.Icon >= 10
                    ? todayForecast.Day.Icon
                    : "0" + todayForecast.Day.Icon
                }-s.png`}
                alt="Day Weather Icon"
              />
            </div>
            <p className="equal-height-text">{todayForecast.Day.IconPhrase}</p>
          </div>
          <div className="vertical-line"></div>
          <div className="text-center">
            <p className="equal-height-text">Night</p>
            <div className="equal-height-icon">
              <img
                src={`https://developer.accuweather.com/sites/default/files/${
                  todayForecast.Night.Icon >= 10
                    ? todayForecast.Night.Icon
                    : "0" + todayForecast.Night.Icon
                }-s.png`}
                alt="Night Weather Icon"
              />
            </div>
            <p className="equal-height-text">{todayForecast.Night.IconPhrase}</p>
          </div>
        </div>
        <p className="card-text equal-height-text">
          Min: {fahrenheitToCelsius(todayForecast.Temperature.Minimum.Value)}°C /
          Max: {fahrenheitToCelsius(todayForecast.Temperature.Maximum.Value)}°C
        </p>
      </div>
    </div>
  );
  
  function formatCityName(cityName) {
    return cityName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

  if (!forecastData || !forecastData.DailyForecasts) {
    return <div>Loading forecast data...</div>;
  }

  const url = forecastData.Headline.MobileLink;
  const urlParts = url.split("/");
  const cityNameIndex = urlParts.length - 4;
  const cityName = formatCityName(urlParts[cityNameIndex]);

  return (
    <div className="five-day-component pt-3 pb-3">
      <h2>Five-Day Weather Outlook - {cityName}</h2>
      <div className="forecast-container mb-4 mt-4">
        {renderTodayCard(forecastData.DailyForecasts[0])}
        {forecastData.DailyForecasts.slice(1).map((dayForecast) =>
          renderForecastCard(dayForecast)
        )}
      </div>
    </div>
  );
};

export default FiveDaysForecast;
