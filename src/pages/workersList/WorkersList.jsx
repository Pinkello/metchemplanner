import "./workersList.scss";
import Workers from "../../components/workers/Workers";
import NavigationBar from "../../components/navigation/NavigationBar";
import { ToastContainer } from "react-toastify";
const List = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <ToastContainer />
        <NavigationBar />
        <Workers />
      </div>
    </div>
  );
};

export default List;
