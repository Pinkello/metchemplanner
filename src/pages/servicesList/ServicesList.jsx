import "./servicesList.scss";

import DatatableServices from "../../components/datatableServices/DatatableServices";
import NavigationBar from "../../components/navigation/NavigationBar";

const ServicesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <DatatableServices />
      </div>
    </div>
  );
};

export default ServicesList;
