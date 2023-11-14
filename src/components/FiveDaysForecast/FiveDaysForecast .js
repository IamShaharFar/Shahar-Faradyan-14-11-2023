import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFiveDayForecast,
  resetForecast,
} from "../../redux/fiveDayForecastSlice ";
import { useTemperature } from "../../TemperatureContext";
import "./FiveDaysForecast.css";

const FiveDaysForecast = ({ selectedLocation }) => {
  const dispatch = useDispatch();
  const currentWeather = useSelector((state) => state.currentWeather);
  const forecast = useSelector((state) => state.fiveDayForecast);
  const { unit } = useTemperature();
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
  const forcastUrl = process.env.REACT_APP_FIVE_DAYS_FORECAST_URL;
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const showErrorPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  useEffect(() => {
    const currentTime = new Date().getTime();
    if (!forecast || !forecast.key || forecast.expirationTime <= currentTime || forecast.key !== currentWeather.key) {
      dispatch(resetForecast());
      fetchForecastData(currentWeather.key);
    }
  }, [currentWeather]);

  async function fetchForecastData(locationKey) {
    const apiUrl = `${forcastUrl}${locationKey}?apikey=${apiKey}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        showErrorPopup(
          "Unable to fetch the forecast data. Please try again later."
        );
      }
      const data = await response.json();
      dispatch(
        setFiveDayForecast({
          key: locationKey,
          data: data,
        })
      );
    } catch (error) {
      showErrorPopup(
        "Unable to fetch the forecast data. Please try again later."
      );
    }
  }

  const convertToCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

  const displayTemperature = (temp) =>
    unit === "Celsius" ? `${convertToCelsius(temp).toFixed(1)}°C` : `${temp}°F`;

  const renderForecastCard = (dayForecast) => (
    <div className="card ms-1 me-1" key={dayForecast.EpochDate}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <h5 className="card-title equal-height-title d-flex align-items-center justify-content-center">
          {new Date(dayForecast.Date).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "numeric",
          })}
        </h5>
        <div className="equal-height-icon d-flex align-items-center justify-content-center">
          <img
            src={`https://developer.accuweather.com/sites/default/files/${
              dayForecast.Day.Icon >= 10
                ? dayForecast.Day.Icon
                : "0" + dayForecast.Day.Icon
            }-s.png`}
            alt="Weather Icon"
          />
        </div>
        <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
          {dayForecast.Day.IconPhrase}
        </p>
        <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
          Min: {displayTemperature(dayForecast.Temperature.Minimum.Value)} /
          Max: {displayTemperature(dayForecast.Temperature.Maximum.Value)}
        </p>
      </div>
    </div>
  );

  const renderTodayCard = (todayForecast) => (
    <div className="card today-card me-1 ms-1" key={todayForecast.EpochDate}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <h5 className="card-title d-flex align-items-center justify-content-center equal-height-title">
          Today -{" "}
          {new Date(todayForecast.Date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "numeric",
          })}
        </h5>
        <div className="d-flex justify-content-evenly w-100">
          <div className="text-center">
            <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
              Day
            </p>
            <div className="equal-height-icon d-flex align-items-center justify-content-center">
              <img
                className="equal-height-icon d-flex align-items-center justify-content-center"
                src={`https://developer.accuweather.com/sites/default/files/${
                  todayForecast.Day.Icon >= 10
                    ? todayForecast.Day.Icon
                    : "0" + todayForecast.Day.Icon
                }-s.png`}
                alt="Day Weather Icon"
              />
            </div>
            <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
              {todayForecast.Day.IconPhrase}
            </p>
          </div>
          <div className="vertical-line h-100 ms-2 me-2"></div>
          <div className="text-center">
            <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
              Night
            </p>
            <div className="equal-height-icon d-flex align-items-center justify-content-center">
              <img
                src={`https://developer.accuweather.com/sites/default/files/${
                  todayForecast.Night.Icon >= 10
                    ? todayForecast.Night.Icon
                    : "0" + todayForecast.Night.Icon
                }-s.png`}
                alt="Night Weather Icon"
              />
            </div>
            <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
              {todayForecast.Night.IconPhrase}
            </p>
          </div>
        </div>
        <p className="card-text equal-height-text d-flex align-items-center justify-content-center">
          Min: {displayTemperature(todayForecast.Temperature.Minimum.Value)} /
          Max: {displayTemperature(todayForecast.Temperature.Maximum.Value)}
        </p>
      </div>
    </div>
  );

  if (
    !forecast ||
    !forecast.data ||
    !forecast.data.DailyForecasts ||
    !forecast.data.Headline
  ) {
    return (
      <div>
        Loading forecast data...{selectedLocation ? selectedLocation : "null"}
      </div>
    );
  }
  const cityName = forecast.data.Headline.MobileLink.split("/")[5]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="five-day-component pt-3 pb-3">
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
      <h2 className="five-day-title text-center m-auto">
        Five-Day Weather Outlook - {cityName}
      </h2>
      <div className="forecast-container d-flex justify-content-center flex-wrap gap-3 mb-4 mt-4">
        {renderTodayCard(forecast.data.DailyForecasts[0])}
        {forecast.data.DailyForecasts.slice(1).map(renderForecastCard)}
      </div>
    </div>
  );
};

export default FiveDaysForecast;
