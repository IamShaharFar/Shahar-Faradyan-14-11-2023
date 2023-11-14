import React, { useState, useEffect } from "react";
import { Navbar, Nav, FormControl, Offcanvas, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTheme } from "../../ThemeContext";
import { useTemperature } from "../../TemperatureContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavigationBar.css";
import ThemeToggle from "../Toggles/ThemeToggle";
import UnitToggle from "../Toggles/UnitToggle";

const NavigationBar = ({ handleLocationChange }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sideShowDropdown, setSideShowDropdown] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [locationsResults, setLocationsResults] = useState([]);
  const autocompleteUrl = process.env.REACT_APP_AUTOCOMPLETE_URL;

  const handleShowSidebar = () => setShowSidebar(true);
  const handleCloseSidebar = () => setShowSidebar(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    handleDebouncedSearch(query);
  };

  const handleSideSearchChange = (e) => {
    const query = e.target.value;
    handleDebouncedSearch(query);
  };

  const handleDebouncedSearch = (query) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (query.length === 0) {
      setShowDropdown(false);
      setSideShowDropdown(false);
      return;
    }

    setDebounceTimeout(setTimeout(() => handleSearch(query), 800));
  };

  const handleSearch = (query) => {
    if (query === "") {
      setShowDropdown(false);
      setSideShowDropdown(false);
      return;
    }
  
    let weatherSearchData = JSON.parse(localStorage.getItem("weathersearch")) || [];
    weatherSearchData = weatherSearchData.sort((a, b) => b.query.localeCompare(a.query));
  
    const lowerCaseQuery = query.toLowerCase();
  
    const match = weatherSearchData.find(search => 
      new Date().getTime() < search.expiration &&
      search.query.toLowerCase().startsWith(lowerCaseQuery)
    );
  
    if (match) {
      const filteredResults = match.results.filter(result => 
        result.LocalizedName.toLowerCase().startsWith(lowerCaseQuery)
      );
  
      setLocationsResults(filteredResults);
      setShowDropdown(filteredResults.length > 0);
      setSideShowDropdown(filteredResults.length > 0);
    } else {
      // Check if the exact query already exists
      const exactMatch = weatherSearchData.some(search => 
        search.query.toLowerCase() === lowerCaseQuery
      );
  
      if (!exactMatch) {
        fetchWeatherSearch(query);
      } else {
        setShowDropdown(false);
        setSideShowDropdown(false);
      }
    }
  };
  

  const storeNewSearch = (query, results) => {
    const newSearch = {
      query: query,
      results: results,
      expiration: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day in milliseconds
    };
    const weatherSearchData =
      JSON.parse(localStorage.getItem("weathersearch")) || [];
    weatherSearchData.push(newSearch);
    localStorage.setItem("weathersearch", JSON.stringify(weatherSearchData));
  };

  const fetchWeatherSearch = (query) => {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const url = `${autocompleteUrl}?apikey=${apiKey}&q=${query}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        storeNewSearch(query, data);
        setLocationsResults(data);
        setShowDropdown(data.length > 0);
        setSideShowDropdown(data.length > 0);
      })
      .catch((error) => {
        console.error("Error fetching autocomplete data:", error);
      });
  };

  return (
    <>
      <Navbar expand="lg" className="mt-0 pt-2 navbar-component">
        <Link to="/" className="me-5 ms-3 no-underline">
          <Navbar.Brand as="div" className="text">
            Weather Forecast
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          onClick={handleShowSidebar}
          className="bg me-2 nav-tog"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link d-none d-lg-block text">
              Home
            </Link>
            <Link to="/favorites" className="nav-link d-none d-lg-block text">
              Favorites
            </Link>
            {/* Conditionally render the search bar for large screens */}
            <Form className="d-none d-lg-flex ms-5 me-2">
              <FormControl
                type="search"
                placeholder="Search"
                className=""
                aria-label="Search"
                onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
              />
              <div
                className={`dropdown-menu bg-white rounded-2 border overflow-hidden ${showDropdown ? "show" : ""}`}
                style={{ width: "100%" }}
              >
                {locationsResults.map((loc) => {
                  return (
                    <a
                      key={loc.Key}
                      className="dropdown-item"
                      href="#one"
                      onClick={(e) => handleLocationChange(loc.Key, e)}
                    >
                      {loc.LocalizedName}
                    </a>
                  );
                })}
              </div>
            </Form>
            <div className="togglers">
              <ThemeToggle />
              <UnitToggle />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Navbar.Offcanvas
        id="offcanvasNavbar"
        className="sidebar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="start"
        show={showSidebar}
        onHide={handleCloseSidebar}
      >
        <Offcanvas.Header closeButton={false}>
          <Link to="/" className="no-underline">
            <Offcanvas.Title className="text" id="offcanvasNavbarLabel">
              Weather Forecast
            </Offcanvas.Title>
          </Link>
          <button className="custom-close-button position-absolute border-0" onClick={handleCloseSidebar}>
            <i className="fas fa-times"></i>
          </button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Link to="/" className="text no-underline">
              Home
            </Link>
            <Link to="/favorites" className="text no-underline">
              Favorites
            </Link>
          </Nav>
          <Form className="mt-3">
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              onChange={handleSideSearchChange}
              onBlur={() => setTimeout(() => setSideShowDropdown(false), 300)}
            />
            <div
              className={`side-dropdown-menu bg-white rounded-2 border-1 overflow-hidden ${
                sideShowDropdown ? "show" : "hide"
              }`}
              style={{ width: "100%" }}
            >
              {locationsResults.map((loc) => {
                return (
                  <a
                    key={loc.Key}
                    className="dropdown-item py-2 px-3 text-secondary text-decoration-none d-block border-bottom"
                    href="#one"
                    onClick={(e) => handleLocationChange(loc.Key, e)}
                  >
                    {loc.LocalizedName}
                  </a>
                );
              })}
            </div>
          </Form>
          <ThemeToggle />
          <UnitToggle />
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </>
  );
};

export default NavigationBar;
