import React from "react";
import "./notes.scss";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notesColumns } from "../../datatablesource";
import ModalNote from "./../modals/ModalNote";

const DatatableNotes = () => {
  const [notes, setNotes] = useState([]);
  const [modalNoteShow, setModalNoteShow] = useState([false, false, false]);

  useEffect(() => {
    //LISTEN
    const unsub = onSnapshot(
      collection(db, "notes"),
      (snapShot) => {
        let notesList = [];
        snapShot.docs.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() });
        });

        setNotes(notesList);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  const handleEdit = async (id) => {
    try {
      const updatedModals = [...modalNoteShow];
      updatedModals[id - 1] = true;
      setModalNoteShow(updatedModals);
    } catch (err) {
      console.log(err);
    }
  };

  const modalNotes = useMemo(() => {
    return modalNoteShow.map((show, index) => {
      const tempNote = notes[index] ? notes[index].notes : "";
      return (
        <ModalNote
          key={index}
          show={show}
          onHide={() => {
            const updatedModals = [...modalNoteShow];
            updatedModals[index] = false;
            setModalNoteShow(updatedModals);
          }}
          shift={index + 1}
          note={tempNote}
        />
      );
    });
  }, [modalNoteShow, notes]);

  const actionColumn = [
    {
      field: "action",
      headerName: "Akcje",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div
              className="editButton"
              onClick={() => handleEdit(params.row.id)}
            >
              Edytuj notatki
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatableNotes">
      <div className="datatableNotesTitle">
        <h3 className="titleNotes">Lista notatek</h3>
      </div>
      <ToastContainer />
      {modalNotes}
      <DataGrid
        className="datagrid"
        rows={notes}
        columns={notesColumns.concat(actionColumn)}
        pageSize={15}
        rowsPerPageOptions={[10, 15, 50]}
        autoHeight
      />
    </div>
  );
};

export default DatatableNotes;
