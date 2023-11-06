import React from "react";
import { useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";

const ModalLoad = (props) => {
  const [currentDateLoad, setCurrentDateLoad] = useState(props.currentDate);
  const [currentShiftLoad, setCurrentShiftLoad] = useState(props.currentShift);
  const [tempDate, setTempDate] = useState(props.currentDate);
  const [tempShift, setTempShift] = useState(props.currentShift);

  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];

  const handleInputSelectShiftLoad = (selectedOption) => {
    setCurrentShiftLoad(selectedOption.value);
  };

  const updateDoc2 = async (e) => {
    const docRef = doc(db, "dates", currentDateLoad);
    const date = await getDoc(docRef);
    try {
      if (
        props.currentDate === currentDateLoad &&
        props.currentShift === currentShiftLoad
      ) {
        toast.error("Nie możesz ładować danych z tego samego dnia i zmiany");
        return;
      }
      const dateToReplace = doc(db, "dates", props.currentDate);

      await updateDoc(dateToReplace, {
        [props.currentShift]: date.data()[currentShiftLoad],
      });

      toast.success("Ładuje dane...");
    } catch (error) {
      toast.error("Brak danych z podanego dnia."); // Wyświetlenie błędu w Toastify
    }
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
          Wybierz datę oraz zmianę, z której chcesz załadować dane
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rowInputs ">
          <div className="dateShow">
            <label htmlFor="date">Data:</label>
            <input
              className="formInput"
              id="dateLoad"
              type="date"
              name="dateLoad"
              placeholder="Data"
              value={currentDateLoad}
              onChange={(e) => {
                setCurrentDateLoad(e.target.value);
              }}
            />
            <label htmlFor="date">Zmiana:</label>

            <Select
              className="formInput"
              options={optionsShift}
              id="shift"
              name="shift"
              defaultValue={{ label: tempShift, value: tempShift }}
              onChange={(value) => {
                // loadShift(currentDate, value.value);
                handleInputSelectShiftLoad(value);
              }}
            />
          </div>

          <Button className="buttonForm" variant="success" onClick={updateDoc2}>
            Załaduj dane
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalLoad;
