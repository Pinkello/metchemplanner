import React from "react";
import { useState, useEffect } from "react";
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
  const [toLoad, setToLoad] = useState({
    value: "machines",
    label: "Maszyny",
  });

  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];

  const optionsLoad = [
    { value: "all", label: "Wszystko" },
    { value: "machines", label: "Maszyny" },
    { value: "services", label: "Montaże" },
  ];

  const handleInputSelectShiftLoad = (selectedOption) => {
    setCurrentShiftLoad(selectedOption.value);
  };

  const handleInputSelectOptionsLoad = (selectedOption) => {
    setToLoad(selectedOption);
  };

  const updateDoc2 = async () => {
    const docRef = doc(db, "dates", currentDateLoad);
    const date = await getDoc(docRef);
    console.log(props.currentDate);
    console.log(props.currentShift);
    console.log(currentDateLoad);
    console.log(currentShiftLoad);
    try {
      if (
        props.currentDate === currentDateLoad &&
        props.currentShift === currentShiftLoad
      ) {
        toast.error("Nie możesz ładować danych z tego samego dnia i zmiany");
        return;
      }

      const dateToReplace = doc(db, "dates", props.currentDate);
      switch (toLoad.value) {
        case "all":
          await updateDoc(dateToReplace, {
            [`${props.currentShift}.machinesToAdd`]:
              date.data()[currentShiftLoad].machinesToAdd,
            [`${props.currentShift}.servicesToAdd`]:
              date.data()[currentShiftLoad].servicesToAdd,
          });
          break;
        case "machines":
          await updateDoc(dateToReplace, {
            [`${props.currentShift}.machinesToAdd`]:
              date.data()[currentShiftLoad].machinesToAdd,
          });
          break;
        case "services":
          await updateDoc(dateToReplace, {
            [`${props.currentShift}.servicesToAdd`]:
              date.data()[currentShiftLoad].servicesToAdd,
          });
          break;
      }

      toast.success("Ładuje dane...");
      setTimeout(() => {
        props.onHide(false);
      }, 400);
    } catch (error) {
      toast.error("Brak danych z podanego dnia.");
    }
  };

  useEffect(() => {
    if (props.show) {
      console.log("test");
      setToLoad({ label: "Maszyny", value: "machines" });
      setCurrentShiftLoad(props.currentShift);
    }
  }, [props.show]);

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
            <label htmlFor="shift">Zmiana:</label>

            <Select
              className="formInput"
              options={optionsShift}
              id="shift"
              name="shift"
              defaultValue={{
                label: props.currentShift,
                value: props.currentShift,
              }}
              onChange={(value) => {
                handleInputSelectShiftLoad(value);
              }}
            />

            <label htmlFor="optionsLoad">Co załadować:</label>
            <Select
              className="formInput"
              options={optionsLoad}
              id="optionsLoad"
              name="optionsLoad"
              defaultValue={{ label: "Maszyny", value: "machines" }}
              onChange={(option) => {
                handleInputSelectOptionsLoad(option);
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
