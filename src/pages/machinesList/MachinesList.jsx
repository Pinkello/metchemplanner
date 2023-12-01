import React from 'react';
import "./machinesList.scss";
import Datatable from "../../components/datatable/Datatable";
import NavigationBar from "../../components/navigation/NavigationBar";

const MachinesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <Datatable />
      </div>
    </div>
  );
};

export default MachinesList;
