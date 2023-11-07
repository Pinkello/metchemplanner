import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { machineColumns, userRows } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = () => {
  const [data, setData] = useState([]);

  const sortTable = (table) => {
    table.sort((a, b) => {
      const nameA = a.name;
      const nameB = b.name;

      // Wyodrębnij numery z napisów (uwzględniając "w-" jako prefix)
      const numA = parseInt(nameA.substring(2), 10);
      const numB = parseInt(nameB.substring(2), 10);

      if (numA < numB) {
        return -1;
      }
      if (numA > numB) {
        return 1;
      }
      return 0;
    });
  };

  useEffect(() => {
    //LISTEN
    const unsub = onSnapshot(
      collection(db, "machines"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        sortTable(list);
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
      await deleteDoc(doc(db, "machines", id));
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
              Usuń maszynę
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
        <h3 className="titleMachines">Lista maszyn</h3>

        <div>
          <Link to="/machines/new" className="newMachine">
            Dodaj nową maszynę
          </Link>
        </div>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={machineColumns.concat(actionColumn)}
        pageSize={15}
        rowsPerPageOptions={[9]}
        checkboxSelection
        autoHeight
      />
    </div>
  );
};

export default Datatable;
