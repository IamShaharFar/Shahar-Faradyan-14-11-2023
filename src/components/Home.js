import React from "react";
import Banner from "./Banner/Banner";
import FiveDaysForecast from "./FiveDaysForecast/FiveDaysForecast ";

const Home = ({selectedLocation}) => {
  return (
    <>
      <Banner selectedLocation={selectedLocation}/>     
      <FiveDaysForecast selectedLocation={selectedLocation}/>
    </>
  );
};

export default Home;