import "./workersList.scss";
import DatatableWorkers from "../../components/datatable_workers/DatatableWorkers";
import NavigationBar from "../../components/navigation/NavigationBar";
import { ToastContainer } from "react-toastify";
const List = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <ToastContainer />
        <NavigationBar />
        <DatatableWorkers />
      </div>
    </div>
  );
};

export default List;
