import "./workersList.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DatatableWorkers from "../../components/datatable_workers/DatatableWorkers";
import NavigationBar from "../../components/navigation/NavigationBar";

const List = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <DatatableWorkers />
      </div>
    </div>
  );
};

export default List;
