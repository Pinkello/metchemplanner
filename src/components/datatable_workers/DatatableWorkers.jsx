import "./datatableWorkers.scss";
import { DataGrid } from "@mui/x-data-grid";
import { workerColumns } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableServices = () => {
  const [data, setData] = useState([]);
  console.log(data);
  useEffect(() => {
    //LISTEN
    const unsub = onSnapshot(
      collection(db, "workers"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
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
        return (
          <div className="cellAction">
            {/* <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link> */}
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Usuń usługę
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatableWorkers">
      <div className="datatableTitle">
        Lista pracownikow
        <Link to="/services/new" className="link">
          Dodaj nowego pracownika
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={workerColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default DatatableServices;
