import React from "react";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const ModalNote = (props) => {
  const [note, setNote] = useState(props.note);

  const updateNote = async (props) => {
    try {
      const noteRef = doc(db, "notes", `${props.shift}`);
      await updateDoc(noteRef, {
        [`notes`]: note,
      });
      toast.success("Zapisuje...");
      setTimeout(() => {
        props.onHide(false);
      }, 400);
    } catch (error) {
      toast.error("Wystąpił błąd!");
    }
  };

  useEffect(() => {
    setNote(props.note);
  }, [props.note]);

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Wybierz notatkę dla zmiany {props.shift}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rowInputs ">
          <div className="dateShow">
            <label htmlFor="note">Data:</label>
            <input
              className="formInput"
              id="note"
              type="text"
              name="note"
              placeholder="Notatka"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </div>

          <Button
            className="buttonForm"
            variant="success"
            onClick={() => updateNote(props)}
          >
            Zapisz notatkę
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalNote;
