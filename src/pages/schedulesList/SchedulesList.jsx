import "./schedulesList.scss";

import Schedule from "../../components/schedule/Schedule";
import NavigationBar from "../../components/navigation/NavigationBar";

const SchedulesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <Schedule />
      </div>
    </div>
  );
};

export default SchedulesList;
