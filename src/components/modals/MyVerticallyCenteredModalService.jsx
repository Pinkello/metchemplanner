import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Select from "react-select"; // Załóżmy, że używasz react-select
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

function MyVerticallyCenteredModalService(props) {
  const { currentService, currentDate, currentShift } = props;
  const [serviceData, setServiceData] = useState(currentService || {});
  console.log(serviceData);
  const optionsRowService = [
    { value: "Lewy rząd", label: "Lewy rząd" },
    { value: "Środkowy rząd", label: "Środkowy rząd" },
    { value: "Prawy rząd", label: "Prawy rząd" },
  ];
  const optionsPracaService = [
    { value: "Tak", label: "Tak" },
    { value: "Nie", label: "Nie" },
  ];

  const initialPraca = serviceData && serviceData.praca;
  const initialName = serviceData && serviceData.name;
  const initialRow = serviceData && serviceData.row;
  const initialRowPlace = serviceData && serviceData.rowPlace;
  const [praca, setPraca] = useState(initialPraca);

  const [name, setName] = useState(initialName);
  const [row, setRow] = useState(initialRow);
  const [rowPlace, setRowPlace] = useState(initialRowPlace);

  const handleInputSelectRow = (selectedOption) => {
    setRow(selectedOption.value);
  };
  const handleInputSelectPraca = (selectedOption) => {
    setPraca(selectedOption.value);
  };

  const updateDoc2 = async (e) => {
    const serviceRef1 = doc(db, "services", serviceData.referencja);
    await updateDoc(serviceRef1, {
      name: name,
      row: row,
      rowPlace: rowPlace,
    });

    const machineRef = doc(db, "dates", currentDate);
    await updateDoc(machineRef, {
      [`${currentShift}.servicesToAdd.${serviceData.name}.praca`]: praca,
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
          Edycja usługi
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rowInputs">
          <label>Nazwa usługi</label>
          <input
            className="formInput"
            type="text"
            name="name"
            placeholder="Nazwa"
            value={serviceData.name}
            onChange={(e) =>
              setServiceData({ ...serviceData, name: e.target.value })
            }
          />
          <label>Praca</label>

          <Select
            className="formInput"
            options={optionsPracaService}
            id="praca"
            name="praca"
            defaultValue={{ label: praca, value: praca }}
            onChange={handleInputSelectPraca}
          />

          <label>Rząd</label>
          <Select
            className="formInput"
            options={optionsRowService}
            id="row"
            name="row"
            defaultValue={{ label: row, value: row }}
            onChange={handleInputSelectRow}
          />
          <label>Miejsce w rzędzie</label>
          <input
            className="formInput"
            type="number"
            name="rowPlace"
            placeholder="Miejsce"
            value={rowPlace}
            onChange={(e) => {
              setRowPlace(e.target.value);
            }}
          />
          <Button className="buttonForm" variant="success" onClick={updateDoc2}>
            Aktualizuj
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default MyVerticallyCenteredModalService;
