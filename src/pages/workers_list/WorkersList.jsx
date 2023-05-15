import "./workersList.scss";
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
