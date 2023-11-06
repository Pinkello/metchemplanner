import React from "react";

import { useState, useEffect } from "react";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../firebase";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";

const ModalService = ({
  currentService,
  currentDate,
  currentShift,
  onHide,
  show,
}) => {
  const [praca, setPraca] = useState(null);
  const [name, setName] = useState(null);
  const [row, setRow] = useState(null);
  const [rowPlace, setRowPlace] = useState(null);
  const [description, setDescription] = useState(null);

  useEffect(() => {
    setPraca(currentService.praca);
    setName(currentService.name);
    setRow(currentService.row);
    setRowPlace(currentService.rowPlace);
    setDescription(currentService.opis);
  }, [
    currentService.praca,
    currentService.name,
    currentService.row,
    currentService.rowPlace,
    currentService.opis,
  ]);

  const optionsPracaService = [
    { value: "Tak", label: "Tak" },
    { value: "Nie", label: "Nie" },
  ];

  const optionsRowService = [
    { value: "Lewy rząd", label: "Lewy rząd" },
    { value: "Środkowy rząd", label: "Środkowy rząd" },
    { value: "Prawy rząd", label: "Prawy rząd" },
  ];

  const handleInputSelectRow = (selectedOption) => {
    setRow(selectedOption.value);
  };
  const handleInputSelectPraca = (selectedOption) => {
    setPraca(selectedOption.value);
  };

  const updateDoc2 = async () => {
    const machineRef = doc(db, "dates", currentDate);
    //jesli trzeba zmienic service
    if (
      name !== currentService.name ||
      row !== currentService.row ||
      rowPlace !== currentService.rowPlace
    ) {
      const serviceRef1 = doc(db, "services", currentService.referencja);
      await updateDoc(serviceRef1, {
        name: name,
        row: row,
        rowPlace: rowPlace,
      });
    }
    //jesli trzeba zmienic nazwe - usun i dodaj nową mape
    if (name !== currentService.name) {
      await updateDoc(machineRef, {
        [`${currentShift}.servicesToAdd.${currentService.name}`]: deleteField(),
      });

      await updateDoc(machineRef, {
        [`${currentShift}.servicesToAdd.${name}.referencja`]: currentService.referencja,
        [`${currentShift}.servicesToAdd.${name}.praca`]: praca,
        [`${currentShift}.servicesToAdd.${name}.opis`]: description,
      });
      //jesli tylko update pracy/opisu
    } else {
      await updateDoc(machineRef, {
        [`${currentShift}.servicesToAdd.${currentService.name}.praca`]: praca,
        [`${currentShift}.servicesToAdd.${currentService.name}.opis`]: description,
      });
    }
    toast.success("Aktualizuje...");
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Edycja montażu
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rowInputs">
          <label>Nazwa montażu</label>
          <input
            className="formInput"
            type="text"
            name="name"
            placeholder="Nazwa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Praca</label>
          <Select
            className="formInput"
            options={optionsPracaService}
            id="praca"
            name="praca"
            defaultValue={{
              label: currentService.praca,
              value: currentService.praca,
            }}
            onChange={handleInputSelectPraca}
          />
          <label>Opis</label>
          <input
            className="formInput"
            type="text"
            name="form"
            placeholder="Forma"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
          <label>Rząd</label>
          <Select
            className="formInput"
            options={optionsRowService}
            id="row"
            name="row"
            defaultValue={{
              label: currentService.row,
              value: currentService.row,
            }}
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
};

export default ModalService;
