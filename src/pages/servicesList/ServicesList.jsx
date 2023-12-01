import React from 'react';
import "./servicesList.scss";
import Services from "../../components/services/Services";
import NavigationBar from "../../components/navigation/NavigationBar";

const ServicesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <Services />
      </div>
    </div>
  );
};

export default ServicesList;
