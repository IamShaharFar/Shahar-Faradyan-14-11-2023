import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import Banner from "./components/Banner/Banner";
import Home from "./components/Home";
import CurrentWeather from "./components/CurrentWeather/CurrentWeather";
import Favorites from "./components/Favorites/Favorites";
import { useState } from "react";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(getInitialLocation);

  function getInitialLocation() {
    const storedWeather = localStorage.getItem("currentWeather");
    if (storedWeather) {
      const weatherData = JSON.parse(storedWeather);
      return weatherData.key || "215854";
    }
    return "215854"; // Default location key
  }

  function handleLocationChange(key, event) {
    setSelectedLocation(key);
  }

  return (
    <Router>
      <div className="App">
        <NavigationBar handleLocationChange={handleLocationChange} />
        <Routes>
          <Route
            path="/"
            element={<Home selectedLocation={selectedLocation} />}
          />
          <Route path="/favorites" element={<Favorites selectedLocation={selectedLocation}/>} />
        </Routes>
        <CurrentWeather />
      </div>
    </Router>
  );
}

export default App;
