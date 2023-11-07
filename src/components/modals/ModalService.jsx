import React from "react";

import { useState, useEffect, useMemo } from "react";
import {
  doc,
  updateDoc,
  deleteField,
  getDocs,
  collection,
} from "firebase/firestore";
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
  const [praca, setPraca] = useState("");
  const [name, setName] = useState("");
  const [row, setRow] = useState("");
  const [rowPlace, setRowPlace] = useState("");
  const [description, setDescription] = useState("");
  const [worker, setWorker] = useState("");

  const optionsWorker = useMemo(() => {
    return [{ value: "", label: "Brak" }];
  }, []);

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
  const handleInputSelectWorker = (selectedOption) => {
    setWorker(selectedOption.value);
  };

  useEffect(() => {
    setPraca(currentService.praca);
    setName(currentService.name);
    setRow(currentService.row);
    setRowPlace(currentService.rowPlace);
    setDescription(currentService.opis);
    setWorker(currentService.worker);
  }, [
    currentService.praca,
    currentService.name,
    currentService.row,
    currentService.rowPlace,
    currentService.opis,
    currentService.worker,
  ]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        let tempWorker = {};

        const querySnapshotWorker = await getDocs(collection(db, "workers"));
        querySnapshotWorker.forEach((doc) => {
          tempWorker = {
            name: doc.data().name,
            surname: doc.data().surname,
            brigade: doc.data().brigade,
          };
          optionsWorker.push({
            value: tempWorker.name + " " + tempWorker.surname,
            label: tempWorker.name + " " + tempWorker.surname,
          });
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchWorkers();
  }, [optionsWorker]);

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
        [`${currentShift}.servicesToAdd.${name}.worker`]: worker,
      });
      //jesli tylko update pracy/opisu
    } else {
      if (worker) {
        await updateDoc(machineRef, {
          [`${currentShift}.servicesToAdd.${currentService.name}.praca`]: praca,
          [`${currentShift}.servicesToAdd.${currentService.name}.opis`]: description,
          [`${currentShift}.servicesToAdd.${currentService.name}.worker`]: worker,
        });
      } else {
        await updateDoc(machineRef, {
          [`${currentShift}.servicesToAdd.${currentService.name}.praca`]: praca,
          [`${currentShift}.servicesToAdd.${currentService.name}.opis`]: description,
          [`${currentShift}.servicesToAdd.${currentService.name}.worker`]: "",
        });
      }
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
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Praca</label>
          <Select
            className="formInput"
            options={optionsPracaService}
            id="praca"
            name="praca"
            defaultValue={
              currentService.praca
                ? {
                    label: currentService.praca,
                    value: currentService.praca,
                  }
                : {
                    label: "Brak",
                    value: "",
                  }
            }
            onChange={handleInputSelectPraca}
          />
          <label>Opis</label>
          <input
            className="formInput"
            type="text"
            name="form"
            placeholder="Forma"
            value={description || ""}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
          <label>Pracownik</label>
          <Select
            className="formInput"
            options={optionsWorker}
            id="worker"
            name="worker"
            defaultValue={
              currentService.worker
                ? { label: currentService.worker, value: currentService.worker }
                : { label: "Brak", value: "" }
            }
            onChange={handleInputSelectWorker}
          />
          <label>Rząd</label>
          <Select
            className="formInput"
            options={optionsRowService}
            id="row"
            name="row"
            defaultValue={
              currentService.row
                ? {
                    label: currentService.row,
                    value: currentService.row,
                  }
                : {
                    label: "Brak",
                    value: "",
                  }
            }
            onChange={handleInputSelectRow}
          />
          <label>Miejsce w rzędzie</label>
          <input
            className="formInput"
            type="number"
            name="rowPlace"
            placeholder="Miejsce"
            value={rowPlace || ""}
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
