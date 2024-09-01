import React from "react";
import "./servicesList.scss";
import Services from "../../components/services/Services";
import NavigationBar from "../../components/navigation/NavigationBar";
import { ToastContainer } from "react-toastify";

const ServicesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <ToastContainer />
        <Services />
      </div>
    </div>
  );
};

export default ServicesList;
