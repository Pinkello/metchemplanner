import "./schedulesList.scss";

import DatatableSchedules from "../../components/datatableSchedules/DatatableSchedules";
import NavigationBar from "../../components/navigation/NavigationBar";

const SchedulesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <DatatableSchedules />
      </div>
    </div>
  );
};

export default SchedulesList;
