import "./workers.scss";
import { DataGrid } from "@mui/x-data-grid";
import { workerColumns } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableWorkers = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    //LISTEN
    const unsub = onSnapshot(
      collection(db, "workers"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort(function (a, b) {
          if (a.brigade < b.brigade) {
            return -1;
          }
          if (a.brigade > b.brigade) {
            return 1;
          }
          // Jeśli brygady są równe, posortuj według nazwiska i imienia
          if (a.surname < b.surname) {
            return -1;
          }
          if (a.surname > b.surname) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

        const listWithGasps = [];
        let currentBrigade = null;

        list.forEach((element) => {
          if (element.brigade !== currentBrigade) {
            if (currentBrigade === null)
              listWithGasps.push({
                id: `firstgap-${element.brigade}`,
                img: "",
              });
            else listWithGasps.push({ id: `gap-${element.brigade}`, img: "" });
            currentBrigade = element.brigade;
          }
          listWithGasps.push(element);
        });
        console.log(listWithGasps);
        setData(listWithGasps);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "workers", id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Akcje",
      width: 200,
      renderCell: (params) => {
        if (params.row.id.startsWith("gap")) {
          // Jeśli brigade jest równa "gap", nie wyświetlamy nic w komórce.
          return <div className="cellAction"></div>;
        }
        return (
          <div className="cellAction">
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Usuń pracownika
            </div>
          </div>
        );
      },
    },
  ];

  const dataWithoutFirst = data.slice(1);

  return (
    <div className="datatableWorkers">
      <div className="datatableTitle">
        Lista pracownikow
        <Link to="/workers/new" className="newWorker">
          Dodaj nowego pracownika
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={dataWithoutFirst}
        columns={workerColumns.concat(actionColumn)}
        autoHeight
        components={{
          Footer: () => null,
          Pagination: () => null,
        }}
      />
    </div>
  );
};

export default DatatableWorkers;
