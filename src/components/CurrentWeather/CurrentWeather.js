import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../../redux/favoritesSlice";
import { useTemperature } from "../../TemperatureContext";
import "./CurrentWeather.css";

const CurrentWeather = () => {
  const currentWeather = useSelector((state) => state.currentWeather);
  const fiveDayForecast = useSelector((state) => state.fiveDayForecast);
  const favorites = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const { unit } = useTemperature();

  // Utility Functions
  const getIconUrl = (iconNumber) =>
    `https://developer.accuweather.com/sites/default/files/${iconNumber
      .toString()
      .padStart(2, "0")}-s.png`;

  const getCityNameFromWeatherData = () => {
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
  };

  const convertToCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;
  const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  const formatTemperature = (fahrenheit) => {
    const fixedValue = parseFloat(fahrenheit).toFixed(1);
    return unit === "Celsius"
      ? `${convertToCelsius(fahrenheit).toFixed(1)}°C`
      : `${fixedValue}°F`;
  };

  const formatSeverity = (severity) =>
    severity <= 2
      ? "Low"
      : severity <= 4
      ? "Moderate"
      : severity <= 6
      ? "High"
      : "Very High";

  // Event Handlers
  const handleAddFavorite = () => {
    const action = isFavorite ? removeFavorite : addFavorite;
    dispatch(action({ key: currentWeather.key, name: weatherData.location }));
  };

  if (!currentWeather.key) {
    return <div></div>;
  }

  // Data Preparation
  const isFavorite = favorites.some((fav) => fav.key === currentWeather.key);

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
    severity: formatSeverity(fiveDayForecast.data.Headline.Severity),
    text: fiveDayForecast.data.Headline.Text,
    nextDaysForecast: fiveDayForecast.data.DailyForecasts.map((day) => ({
      day: new Date(day.Date).toLocaleDateString("en-US", { weekday: "short" }),
      imgUrl: getIconUrl(day.Day.Icon),
      text: day.Day.IconPhrase,
      low: formatTemperature(
        day.Temperature.Minimum.Unit === "C"
          ? convertToFahrenheit(day.Temperature.Minimum.Value)
          : day.Temperature.Minimum.Value
      ),
      high: formatTemperature(
        day.Temperature.Maximum.Unit === "C"
          ? convertToFahrenheit(day.Temperature.Maximum.Value)
          : day.Temperature.Maximum.Value
      ),
      rain: day.Day.HasPrecipitation ? day.Day.PrecipitationIntensity : "No",
    })),
  };

  // Component Render
  return (
    <div className="d-flex align-items-center justify-content-center ms-3 me-3">
      {/* Current Weather Container */}
      <div className="d-flex flex-column justify-content-center align-items-center align-content-center p-0 m-0 weather-container">
        {/* Location and Date */}
        <div className="current-weather-container w-100 m-0 p-0 d-flex flex-column">
          <div className="location-date d-flex flex-column align-items-start ms-4 mt-4">
            <div className="d-flex justify-content-center align-items-center">
              <h4 className="text-main m-0">{weatherData.location}</h4>
              <i
                title={
                  isFavorite ? "Remove from Favorites" : "Add to Favorites"
                }
                className={`fa${
                  isFavorite ? "-solid" : "-regular"
                } fa-bookmark fa-lg ms-2`}
                onClick={handleAddFavorite}
              ></i>
            </div>
            <h6 className="text-secondary">{weatherData.currentDay}</h6>
          </div>
          {/* Current Weather Details */}
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
            {/* Day Details */}
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
        {/* 5-Day Forecast */}
        <div className="next-days-forecast rounded-4 mb-4 w-100">
          <h5 className="text-secondary pt-3 ps-3 mb-3">5-Day Forecast</h5>
          {weatherData.nextDaysForecast.map((day, index) => (
            <div key={index} className="row">
              <div className="col">
                <div className="card daily-forecast-item transparent-card">
                  <div className="card-body p-0 pb-3 pt-3">
                    <div className="row">
                      <div className="col-2 d-flex flex-column justify-content-center">
                        <h6 className="card-title ms-2 text-secondary text-center m-0">
                          {day.day}
                        </h6>
                      </div>
                      <div className="col-1 p-0 d-flex flex-column justify-content-center">
                        <img width={50} src={day.imgUrl} />
                      </div>
                      <div className="col-3 d-flex flex-column justify-content-center">
                        <p className="card-text text-main text-center">
                          <span className="d-block text-secondary m-0 ms-2 ms-md-0">
                            {day.text}
                          </span>
                        </p>
                      </div>
                      <div className="col-3 d-flex flex-column">
                        <p className="card-text text-main text-center">
                          <span className="text-secondary">{day.low}</span> /{" "}
                          {day.high}
                          <small className="d-block text-secondary">
                            Low/High
                          </small>
                        </p>
                      </div>
                      <div className="col-3 d-flex flex-column">
                        <p className="card-text text-main text-center">
                          {day.rain}
                          <small className="d-block text-secondary">Rain</small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
