import "./datatableWorkers.scss";
import { DataGrid } from "@mui/x-data-grid";
import { workerColumns, userRows } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Button } from "react-bootstrap";

const Datatable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // const fetchData = async () => {
    //   let list = [];
    //   try {
    //     const querySnapshot = await getDocs(collection(db, "users"));
    //     querySnapshot.forEach((doc) => {
    //       // doc.data() is never undefined for query doc snapshots
    //       list.push({ id: doc.id, ...doc.data() });
    //     });
    //     setData(list);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };

    // fetchData();

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
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>

            <Button
              variant="danger"
              onClick={() => handleDelete(params.row.id)}
            >
              Usuń pracownika
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
        Lista pracowników
        <Link to="/workers/new">
          <Button variant="outline-success"> Dodaj nowego pracownika</Button>
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

export default Datatable;
