import "./datatableServices.scss";
import { DataGrid } from "@mui/x-data-grid";
import { serviceColumns } from "../../datatablesource";
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
      collection(db, "services"),
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
      await deleteDoc(doc(db, "services", id));
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
              Usuń montaż
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatableServices">
      <div className="datatableTitle">
        <h3 className="titleServices">Montaże</h3>
        <Link to="/services/new" className="newService">
          Dodaj nowy montaż
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={serviceColumns.concat(actionColumn)}
        checkboxSelection
        autoHeight
      />
    </div>
  );
};

export default DatatableServices;
