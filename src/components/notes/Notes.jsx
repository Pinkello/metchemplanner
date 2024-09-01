import React from "react";
import "./notes.scss";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  getDocs,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "../../firebase";
import Select from "react-select";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notesColumns } from "../../datatablesource";

const DatatableNotes = () => {
  const [notes, setNotes] = useState([]);
  const [modalNotesShow, setModalNotesShow] = useState(false);

  useEffect(() => {
    //LISTEN
    const unsub = onSnapshot(
      collection(db, "notes"),
      (snapShot) => {
        let notesList = [];
        snapShot.docs.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() });
        });

        console.log("lista notes");
        console.log(notesList);

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
      // await deleteDoc(doc(db, "services", id));
      // setData(data.filter((item) => item.id !== id));
      console.log(id);
    } catch (err) {
      console.log(err);
    }
  };

  function ModalNotes(props) {
    const [notes2, setNotes2] = useState(notes);

    const handleChange = (e) => {
      // setNotes(e.target.value);
      // setNotes2(e.target.value);
    };

    const textareaStyle = {
      overflow: "auto", // lub 'hidden', jeśli nie chcesz widocznych pasków przewijania
      whiteSpace: "pre-wrap", // umożliwia łamanie tekstu do kolejnych linii
      height: "auto", // początkowa wysokość pola tekstowego
      minHeight: "300px", // minimalna wysokość pola tekstowego
    };

    const updateDoc2 = async (e) => {
      const machineRef = doc(db, "notes");
      await updateDoc(machineRef, {
        [`${props.shift}.notes`]: notes2,
      });
      toast.success("Aktualizuje...");
    };

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edycja notatki na zmianę {props.shift}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rowInputs">
            <label>Notatki</label>
            <textarea
              className="formInput"
              name="notes"
              placeholder="Notatki"
              value={notes2}
              style={textareaStyle}
              onChange={handleChange}
            />
            <Button
              className="buttonForm"
              variant="success"
              onClick={updateDoc2}
            >
              Aktualizuj
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  const modalNotesMemo = useMemo(() => {
    return (
      <ModalNotes
        show={modalNotesShow}
        onHide={() => setModalNotesShow(false)}
      />
    );
  }, [modalNotesShow]);

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
      {modalNotesMemo}
      <DataGrid
        className="datagrid"
        rows={notes}
        columns={notesColumns.concat(actionColumn)}
        pageSize={15}
        rowsPerPageOptions={[9]}
        checkboxSelection
        autoHeight
      />
    </div>
  );
};

export default DatatableNotes;
