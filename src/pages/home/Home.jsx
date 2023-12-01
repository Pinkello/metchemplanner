import "./home.scss";
import React from 'react';
import NavigationBar from "../../components/navigation/NavigationBar";
import Homepage from "../../components/homepage/Homepage";

const Home = () => {
  return (
    <div className="mainCon">
      <NavigationBar />
      <Homepage />
    </div>
  );
};

export default Home;
