import React, { useState, useEffect } from 'react';

const CurrentWeather = () => {
    const [weather, setWeather] = useState(null);
    const apiKey = 'ui0bPwK34VW0zDJj51LybovfzF9socw2'; // Replace with your API key
    const defaultLocationKey = '215854'; // Tel Aviv as the default location key
    const [LocationKey, setLocationKey] = useState("");

    useEffect(() => {
      const storedWeather = localStorage.getItem('currentWeather');
      if (storedWeather) {
        setWeather(JSON.parse(storedWeather));
      } else {
        const getWeatherData = async (locationKey) => {
          try {
            const weatherResponse = await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`);
            const weatherData = await weatherResponse.json();
            setWeather(weatherData);
            localStorage.setItem('currentWeather', JSON.stringify(weatherData));
          } catch (error) {
            console.error("Error fetching weather data:", error);
          }
        };
  
        const fetchLocationKeyAndWeather = async (latitude, longitude) => {
          try {
            const locationResponse = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${latitude},${longitude}`);
            const locationData = await locationResponse.json();
            await getWeatherData(locationData.Key);
          } catch (error) {
            console.error("Error fetching location key:", error);
            throw error; // Throw the error to be caught by the geolocation error handler
          }
        };
  
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            await fetchLocationKeyAndWeather(position.coords.latitude, position.coords.longitude);
          }, async (err) => {
            console.error(err);
            await getWeatherData(defaultLocationKey); // Use the default location key if geolocation fails
          });
        } else {
          console.log("Geolocation is not supported by this browser.");
          // Do not fetch weather for Tel Aviv here, as you only want it on geolocation failure
        }
      }
    }, [apiKey]);
  
  if (!weather) {
    return <div>Loading weather data...</div>;
  }

  return (
    <div>
    </div>
  );
};

export default CurrentWeather;
