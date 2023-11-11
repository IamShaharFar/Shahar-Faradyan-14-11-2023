import React, { useState } from "react";
import { Navbar, Nav, FormControl, Offcanvas, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavigationBar.css";

const NavigationBar = ({ handleLocationChange }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sideShowDropdown, setSideShowDropdown] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [locationsResults, setLocationsResults] = useState([]);

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      handleSearch(e.target.value);
    }, 800);

    setDebounceTimeout(newTimeout);
  };

  const handleSideSearchChange = (e) => {
    setSearchQuery(e.target.value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      handleSearch(e.target.value);
    }, 800);

    setDebounceTimeout(newTimeout);
  };

  const handleSearch = (query) => {
    if (query === "") {
      setShowDropdown(false);
      return;
    }
  
    const weatherSearchData =
      JSON.parse(localStorage.getItem("weathersearch")) || [];
    // Sort by descending order of query string length
    weatherSearchData.sort((a, b) => b.query.length - a.query.length);
  
    const lowerCaseQuery = query.toLowerCase();
    const match = weatherSearchData.find(
      (search) =>
        new Date().getTime() < search.expiration &&
        (search.query.toLowerCase() === lowerCaseQuery ||
          lowerCaseQuery.startsWith(search.query.toLowerCase()))
    );
  
    if (match) {
      // Get results that match or start with the query
      const newResults = match.results.filter((result) =>
        result.LocalizedName.toLowerCase().startsWith(lowerCaseQuery)
      );
      // Update the local storage with new search only if there are new results
      if (newResults.length > 0) {
        storeNewSearch(query, newResults);
        setLocationsResults(newResults);
        // Show or hide dropdown based on results
        setShowDropdown(newResults.length > 0);
      } else {
        // If no results are found in cache, fetch new data
        fetchWeatherSearch(query);
      }
    } else {
      // If no match is found in cache, fetch new data
      fetchWeatherSearch(query);
    }
  };
  

  const storeNewSearch = (query, results) => {
    const newSearch = {
      query: query,
      results: results,
      expiration: new Date().getTime() + 24 * 60 * 60 * 1000, // Current time + 1 day in milliseconds
    };
    const weatherSearchData =
      JSON.parse(localStorage.getItem("weathersearch")) || [];
    weatherSearchData.push(newSearch);
    localStorage.setItem("weathersearch", JSON.stringify(weatherSearchData));
  };

  const fetchWeatherSearch = (query) => {
    const apiKey = "S0sGyx9oJ2C7RaYx17ns7qqai1QTSZYt"; // Replace with your actual AccuWeather API key
    const url = `https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${apiKey}&q=${query}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        storeNewSearch(query, data);
        setLocationsResults(data);
      })
      .catch((error) => {
        console.error("Error fetching autocomplete data:", error);
      });
      console.log("fetched");
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="mt-0 pt-2">
        <Link to="/" className="me-5 ms-3 text-purple">
          <Navbar.Brand as="div">Weather Forecast</Navbar.Brand>
        </Link>

        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          onClick={handleShowSidebar}
          className="text-purple me-2"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link d-none d-lg-block text-purple">
              Home
            </Link>
            <Link
              to="/favorites"
              className="nav-link d-none d-lg-block text-purple"
            >
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
                className={`dropdown-menu ${showDropdown ? "show" : ""}`}
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
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Navbar.Offcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="start"
        show={showSidebar}
        onHide={handleCloseSidebar}
      >
        <Offcanvas.Header closeButton>
          <Link to="/">
            <Offcanvas.Title className="text-purple" id="offcanvasNavbarLabel">
              Weather Forecast
            </Offcanvas.Title>
          </Link>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Link to="/" className="text-purple">
              Home
            </Link>
            <Link to="/favorites" className="text-purple">
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
                className={`side-dropdown-menu ${showDropdown ? "show" : ""}`}
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
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </>
  );
};

export default NavigationBar;
