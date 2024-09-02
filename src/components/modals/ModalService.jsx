import React from "react";

import { useState, useEffect, useMemo } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
  getDocs,
  collection,
  writeBatch,
  query,
  where,
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
  const [service, setService] = useState(currentService);

  const [rowOld, setRowOld] = useState(currentService.row);
  const [rowPlaceOld, setRowPlaceOld] = useState(
    parseInt(currentService.rowPlace)
  );

  const optionsWorker = useMemo(() => {
    return [{ value: "Brak", label: "Brak" }];
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
    setService((prevServ) => ({
      ...prevServ,
      row: selectedOption.value,
    }));
  };
  const handleInputSelectPraca = (selectedOption) => {
    setService((prevServ) => ({
      ...prevServ,
      praca: selectedOption.value,
    }));
  };
  const handleInputSelectWorker = (selectedOption) => {
    setService((prevServ) => ({
      ...prevServ,
      worker: selectedOption.value,
    }));
  };

  useEffect(() => {
    setService(currentService);
    setRowOld(currentService.row);
    setRowPlaceOld(currentService.rowPlace);
  }, [currentService]);

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
    const specialSigns = ["~", "*", "/", "[", "]"];

    const wrongSing = specialSigns.find((sign) => service.name.includes(sign));

    if (wrongSing) {
      toast.error(
        <div>Błąd! Nie możesz używać w nazwie znaku ' {wrongSing} ' !</div>
      );
      return;
    }

    const machineRef = doc(db, "dates", currentDate);

    //jesli trzeba zmienic service
    if (
      service.name !== currentService.name ||
      service.row !== currentService.row ||
      service.rowPlace !== currentService.rowPlace
    ) {
      const serviceRef1 = doc(db, "services", currentService.referencja);
      await updateDoc(serviceRef1, {
        name: service.name,
        row: service.row,
        rowPlace: service.rowPlace,
      });
    }

    //jesli trzeba zmienic nazwe - usun i dodaj nową mape
    if (service.name !== currentService.name) {
      await updateDoc(machineRef, {
        [`${currentShift}.servicesToAdd.${currentService.name}`]: deleteField(),
      });

      await updateDoc(machineRef, {
        [`${currentShift}.servicesToAdd.${service.name}.referencja`]:
          currentService.referencja,
        [`${currentShift}.servicesToAdd.${service.name}.praca`]: service.praca,
        [`${currentShift}.servicesToAdd.${service.name}.opis`]: service.opis,
        [`${currentShift}.servicesToAdd.${service.name}.referencja`]:
          service.referencja,
        [`${currentShift}.servicesToAdd.${service.name}.worker`]:
          service.worker,
      });
      // jesli tylko update pracy/opisu
    } else {
      const date = await getDoc(machineRef);
      const shiftData = date.data()[currentShift].servicesToAdd;

      const nameToRemove = Object.keys(shiftData).find(
        (key) => shiftData[key].referencja === service.referencja
      );

      if (nameToRemove != currentService.name) {
        await updateDoc(machineRef, {
          [`${currentShift}.servicesToAdd.${nameToRemove}`]: deleteField(),
        });
      }

      if (service.worker) {
        await updateDoc(machineRef, {
          [`${currentShift}.servicesToAdd.${currentService.name}.praca`]:
            service.praca,
          [`${currentShift}.servicesToAdd.${currentService.name}.opis`]:
            service.opis,
          [`${currentShift}.servicesToAdd.${currentService.name}.referencja`]:
            service.referencja,
          [`${currentShift}.servicesToAdd.${currentService.name}.worker`]:
            service.worker,
        });
      } else {
        await updateDoc(machineRef, {
          [`${currentShift}.servicesToAdd.${currentService.name}.praca`]:
            service.praca,
          [`${currentShift}.servicesToAdd.${currentService.name}.opis`]:
            service.opis,
          [`${currentShift}.servicesToAdd.${currentService.name}.referencja`]:
            service.referencja,
          [`${currentShift}.servicesToAdd.${currentService.name}.worker`]: "",
        });
      }
    }

    //zmiana miejsca w rzedzie innych maszyn
    const batch = writeBatch(db);

    if (service.rowPlace !== rowPlaceOld || service.row !== rowOld)
      if (service.row === rowOld) {
        console.log("tutaj1");
        if (service.rowPlace > rowPlaceOld) {
          const q = query(
            collection(db, "services"),
            where("row", "==", service.row),
            where("rowPlace", "<=", parseInt(service.rowPlace)),
            where("rowPlace", ">", parseInt(rowPlaceOld))
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const currentRowPlace = doc.data().rowPlace;
            batch.update(doc.ref, {
              rowPlace: parseInt(currentRowPlace) - 1,
            });
          });
        } else {
          const q = query(
            collection(db, "services"),
            where("row", "==", service.row),
            where("rowPlace", ">=", parseInt(service.rowPlace)),
            where("rowPlace", "<", parseInt(rowPlaceOld))
          );

          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const currentRowPlace = parseInt(doc.data().rowPlace);
            batch.update(doc.ref, {
              rowPlace: currentRowPlace + 1,
            });
          });
        }
      } else {
        console.log("tutaj2");
        console.log(service.row);
        console.log(service.rowPlace);
        const q = query(
          collection(db, "services"),
          where("row", "==", service.row),
          where("rowPlace", ">=", parseInt(service.rowPlace))
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          console.log("działam + 1 ");
          const currentRowPlace = parseInt(doc.data().rowPlace);
          batch.update(doc.ref, {
            rowPlace: currentRowPlace + 1,
          });
        });
        const q2 = query(
          collection(db, "services"),
          where("row", "==", rowOld),
          where("rowPlace", ">", parseInt(rowPlaceOld))
        );
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => {
          console.log("działam - 1 ");
          console.log(doc.data());
          const currentRowPlace = parseInt(doc.data().rowPlace);
          batch.update(doc.ref, {
            rowPlace: currentRowPlace - 1,
          });
        });
      }

    await batch.commit();
    const machineRef1 = doc(db, "services", currentService.referencja);
    await updateDoc(machineRef1, {
      name: service.name,
      row: service.row,
      rowPlace: parseInt(service.rowPlace),
    });

    toast.success("Aktualizuje...");
    setTimeout(() => {
      onHide();
    }, 400);
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
            value={service.name}
            onChange={(e) =>
              setService((prevMachine) => ({
                ...prevMachine,
                name: e.target.value,
              }))
            }
          />
          <label>Praca</label>
          <Select
            className="formInput"
            options={optionsPracaService}
            id="praca"
            name="praca"
            value={
              service.praca
                ? {
                    label: service.praca,
                    value: service.praca,
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
            value={service.opis}
            onChange={(e) => {
              setService((prevMachine) => ({
                ...prevMachine,
                opis: e.target.value,
              }));
            }}
          />
          <label>Pracownik</label>
          <Select
            className="formInput"
            options={optionsWorker}
            id="worker"
            name="worker"
            value={
              service.worker
                ? { label: service.worker, value: service.worker }
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
            value={
              service.row
                ? {
                    label: service.row,
                    value: service.row,
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
            value={service.rowPlace}
            onChange={(e) =>
              setService((prevMachine) => ({
                ...prevMachine,
                rowPlace: e.target.value,
              }))
            }
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
