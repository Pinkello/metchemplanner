import React from "react";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  collection,
  doc,
  updateDoc,
  query,
  getDoc,
  getDocs,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import Button from "react-bootstrap/Button";

const ModalMachine = ({
  currentMachine,
  currentDate,
  currentShift,
  machines,
  workers,
  show,
  onHide,
}) => {
  const [rowOld, setRowOld] = useState(currentMachine.row);
  const [rowPlaceOld, setRowPlaceOld] = useState(
    parseInt(currentMachine.rowPlace)
  );
  const [machine, setMachine] = useState(currentMachine);
  const [opt, setOpt] = useState([]);
  const [optConn, setOptConn] = useState([]);
  const [optAdd1, setOptAdd1] = useState([]);
  const [optAdd2, setOptAdd2] = useState([]);
  const [showRetooling, setShowRetooling] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showAddition, setShowAddition] = useState(false);

  const optionsStatus = [
    { value: "STOP", label: "Stop" },
    { value: "Praca", label: "Praca" },
    { value: "Rozruch", label: "Rozruch" },
    { value: "Uruchomienie", label: "Uruchomienie" },
  ];
  const optionsRow = [
    { value: "Boczny rząd", label: "Boczny rząd" },
    { value: "Lewy rząd", label: "Lewy rząd" },
    { value: "Środkowy rząd", label: "Środkowy rząd" },
    { value: "Prawy rząd", label: "Prawy rząd" },
  ];

  const sortTable = (table) => {
    console.log("dzialam");
    table.sort((a, b) => {
      const nameA = a.value;
      const nameB = b.value;

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
    setMachine(currentMachine);
    setRowOld(currentMachine.row);
    setRowPlaceOld(currentMachine.rowPlace);
  }, [currentMachine]);

  useEffect(() => {
    //porownaj nazwe wybranego elementu i dodaj do tablicy jezeli jest inna niz wybrana
    machines.forEach((element) => {
      const comparison = element.name.localeCompare(machine.addition1);
      const comparison2 = element.name.localeCompare(machine.addition2);

      if (!(comparison2 === 0))
        setOptAdd1((prevOptAdd1) => [
          ...prevOptAdd1,
          { value: element.name, label: element.name },
        ]);
      if (!(comparison === 0))
        setOptAdd2((prevOptAdd2) => [
          ...prevOptAdd2,
          { value: element.name, label: element.name },
        ]);
    });

    sortTable(optAdd1);
    sortTable(optAdd2);
  }, [machine.addition1, machine.addition2, machines]);

  useEffect(() => {
    const newOpt = workers.map((element) => ({
      value: element.name + " " + element.surname,
      label: element.name + " " + element.surname,
    }));

    setOpt((prevOpt) => [...prevOpt, ...newOpt]);

    sortTable(opt);
  }, [workers]);

  useEffect(() => {
    const newOptConn = machines.map((element) => ({
      value: element.name,
      label: element.name,
    }));

    setOptConn((prevOptConn) => [...prevOptConn, ...newOptConn]);

    console.log("opt conn");
    console.log(optConn);
    sortTable(optConn);
    console.log("opt conn 2");
    console.log(optConn);
  }, [machines]);

  const handleInputSelectWorker = (selectedOption) => {
    // setWorker(selectedOption.value);
    setMachine((prevMachine) => ({
      ...prevMachine,
      worker: selectedOption.value,
    }));
  };

  const handleInputSelectConnection = (selectedOption) => {
    // setConnection(selectedOption.value);
    setMachine((prevMachine) => ({
      ...prevMachine,
      connection: selectedOption.value,
    }));
  };

  const handleInputSelectStatus = (selectedOption) => {
    // setStatus(selectedOption.value);
    setMachine((prevMachine) => ({
      ...prevMachine,
      status: selectedOption.value,
    }));
  };

  const handleInputSelectRow = (selectedOption) => {
    // setRow(selectedOption.value);
    setMachine((prevMachine) => ({
      ...prevMachine,
      row: selectedOption.value,
    }));
  };

  const handleToggleRetoolingInput = () => {
    setShowRetooling((prevShowRetooling) => !prevShowRetooling);
  };

  const handleToogleTransitionInput = () => {
    setShowTransition((prevShowTransition) => !prevShowTransition);
  };

  const handleToogleAdditionInput = () => {
    setShowAddition((prevShowAddition) => !prevShowAddition);
  };

  const updateDoc2 = async (e) => {
    if (
      machine.status !== "STOP" &&
      (machine.form === "" || machine.form === "--")
    ) {
      toast.error("Brak podanej formy!");
      return;
    }

    if (machine.retooling !== "" && machine.retoolingTime === "") {
      toast.error("Brak podanej godziny dla przezbrojenia!");
      return;
    }
    if (machine.transition !== "" && machine.transitionTime === "") {
      toast.error("Brak podanej godziny dla przejścia!");
      return;
    }

    //zmiana miejsca w rzedzie innych maszyn
    const batch = writeBatch(db);

    if (machine.rowPlace !== rowPlaceOld || machine.row !== rowOld)
      if (machine.row === rowOld) {
        if (machine.rowPlace > rowPlaceOld) {
          const q = query(
            collection(db, "machines"),
            where("row", "==", machine.row),
            where("rowPlace", "<=", parseInt(machine.rowPlace)),
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
            collection(db, "machines"),
            where("row", "==", machine.row),
            where("rowPlace", ">=", parseInt(machine.rowPlace)),
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
        const q = query(
          collection(db, "machines"),
          where("row", "==", machine.row),
          where("rowPlace", ">=", parseInt(machine.rowPlace))
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const currentRowPlace = parseInt(doc.data().rowPlace);
          batch.update(doc.ref, {
            rowPlace: currentRowPlace + 1,
          });
        });
        const q2 = query(
          collection(db, "machines"),
          where("row", "==", rowOld),
          where("rowPlace", ">", parseInt(rowPlaceOld))
        );
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc) => {
          const currentRowPlace = parseInt(doc.data().rowPlace);
          batch.update(doc.ref, {
            rowPlace: currentRowPlace - 1,
          });
        });
      }

    await batch.commit();
    const machineRef1 = doc(db, "machines", currentMachine.referencja);
    await updateDoc(machineRef1, {
      name: machine.name,
      row: machine.row,
      rowPlace: parseInt(machine.rowPlace),
    });

    //update maszyny
    const machineRef = doc(db, "dates", currentDate);
    const docSnap = await getDoc(machineRef);

    //POŁĄCZENIA MASZYN
    if (machine.connection !== "Brak" && currentMachine.connection === "Brak") {
      if (
        docSnap.data()[currentShift]["machinesToAdd"][machine.connection]
          .status === "STOP"
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${machine.connection}.status`]: machine.status,
        });
      }

      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${machine.connection}.connection`]: currentMachine.name,
      });
    } else if (
      machine.connection === "Brak" &&
      currentMachine.connection !== "Brak"
    ) {
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]: "Brak",
      });
    } else if (
      machine.connection !== "Brak" &&
      currentMachine.connection !== "Brak" &&
      machine.connection !== currentMachine.connection
    ) {
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]: "Brak",
      });
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${machine.connection}.connection`]: currentMachine.name,
      });
    }

    //jeśli maszyny były STOP to teraz rusz
    if (machine.connection !== "Brak")
      if (
        docSnap.data()[currentShift]["machinesToAdd"][machine.connection][
          "status"
        ] === "STOP"
      )
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${machine.connection}.status`]: machine.status,
        });

    await updateDoc(machineRef, {
      [`${currentShift}.machinesToAdd.${currentMachine.name}.referencja`]: machine.referencja,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.form`]: machine.form,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.startTime`]: machine.startTime,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.transition`]: machine.transition,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.transitionTime`]: machine.transitionTime,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.status`]: machine.status,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.connection`]: machine.connection,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.worker`]: machine.worker,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.addition1`]: machine.addition1,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.addition2`]: machine.addition2,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.isAddition`]: machine.isAddition,
    });

    //jeżeli retooling wjedzie na nową zmiane, to dodaj na tej nowej zmianie
    if (currentShift === "I") {
      if (machine.retoolingTime > "14:00" && machine.retoolingTime < "22:00") {
        await updateDoc(machineRef, {
          [`II.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`II.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
          [`II.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
          [`II.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
      if (
        machine.retoolingTime >= "22:00" ||
        (machine.retoolingTime >= "00:00" && machine.retoolingTime < "06:00")
      ) {
        await updateDoc(machineRef, {
          [`III.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`III.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
          [`III.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
          [`III.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
    } else if (currentShift === "II") {
      if (
        machine.retoolingTime > "22:00" ||
        (machine.retoolingTime >= "00:00" && machine.retoolingTime < "06:00")
      ) {
        await updateDoc(machineRef, {
          [`III.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`III.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
          [`III.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
          [`III.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
      if (
        machine.retoolingTime >= "06:00" &&
        machine.retoolingTime <= "13:59"
      ) {
        const dateObject = new Date(currentDate);
        dateObject.setDate(dateObject.getDate() + 1);
        const nextDayDateString = dateObject.toISOString().split("T")[0];

        const machineRef2 = doc(db, "dates", nextDayDateString);

        await updateDoc(machineRef2, {
          [`I.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`I.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
          [`I.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
          [`I.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
    } else if (currentShift === "III") {
      if (
        machine.retoolingTime >= "06:00" &&
        machine.retoolingTime <= "21:59"
      ) {
        const dateObject = new Date(currentDate);
        dateObject.setDate(dateObject.getDate() + 1);
        const nextDayDateString = dateObject.toISOString().split("T")[0];

        const machineRef2 = doc(db, "dates", nextDayDateString);

        await updateDoc(machineRef2, {
          [`I.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`I.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
          [`I.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
          [`I.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
      if (machine.retoolingTime > "13:59" && machine.retoolingTime <= "21:59") {
        const dateObject = new Date(currentDate);
        dateObject.setDate(dateObject.getDate() + 1);
        const nextDayDateString = dateObject.toISOString().split("T")[0];

        const machineRef2 = doc(db, "dates", nextDayDateString);

        await updateDoc(machineRef2, {
          [`II.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`II.machinesToAdd.${currentMachine.name}.retooling`]: machine.retooling,
          [`II.machinesToAdd.${currentMachine.name}.retoolingTime`]: machine.retoolingTime,
          [`II.machinesToAdd.${currentMachine.name}.status`]: machine.status,
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
          Edycja maszyny
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rowInputs">
          <div className="buttonsContainer">
            <button
              className="css-button-shadow-border--sky"
              onClick={handleToggleRetoolingInput}
            >
              {showRetooling ? "Usuń przezbrojenie" : "Dodaj przezbrojenie"}
            </button>
            <button
              className="css-button-shadow-border--sky"
              onClick={handleToogleTransitionInput}
            >
              {showTransition ? "Usuń przejście" : "Dodaj przejście"}
            </button>
            <button
              className="css-button-shadow-border--sky"
              onClick={handleToogleAdditionInput}
            >
              {showAddition ? "Usuń trzecią maszynę" : "Dodaj trzecią maszynę"}
            </button>
          </div>
          <hr />
          <div className="inputsRow">
            <div className="inputContainer-50">
              <label>Nazwa maszyny</label>
              <input
                className="formInput "
                type="text"
                name="name"
                placeholder="Nazwa"
                value={machine.name || ""}
                onChange={(e) =>
                  setMachine((prevMachine) => ({
                    ...prevMachine,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="inputContainer-50">
              <label>Rozpoczęcie pracy</label>
              <input
                className="formInput"
                type="time"
                name="startTime"
                placeholder="Rozpoczęcie"
                value={machine.startTime || ""}
                onChange={(e) =>
                  setMachine((prevMachine) => ({
                    ...prevMachine,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="inputContainer-100">
            <label>Forma</label>
            <input
              className="formInput"
              type="text"
              name="form"
              placeholder="Forma"
              value={machine.form || ""}
              onChange={(e) =>
                setMachine((prevMachine) => ({
                  ...prevMachine,
                  form: e.target.value,
                }))
              }
            />
          </div>

          {showRetooling && (
            <div className="inputsRow">
              <div className="inputContainer-50">
                <label>Przezbrojenie</label>
                <input
                  className="formInput"
                  type="text"
                  name="retooling"
                  placeholder="Przezbrojenie"
                  value={machine.retooling || ""}
                  onChange={(e) =>
                    setMachine((prevMachine) => ({
                      ...prevMachine,
                      retooling: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="inputContainer-50">
                <label>Czas przezbrojenia</label>
                <input
                  className="formInput"
                  type="time"
                  name="retoolingTime"
                  placeholder="Czas przezbrojenia"
                  value={machine.retoolingTime || ""}
                  onChange={(e) =>
                    setMachine((prevMachine) => ({
                      ...prevMachine,
                      retoolingTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}
          {showTransition && (
            <div className="inputsRow">
              <div className="inputContainer-50">
                <label>Przejście</label>
                <input
                  className="formInput"
                  type="text"
                  name="transition"
                  placeholder="Przejście na:"
                  value={machine.transition || ""}
                  onChange={(e) =>
                    setMachine((prevMachine) => ({
                      ...prevMachine,
                      transition: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="inputContainer-50">
                <label>Czas przejścia</label>
                <input
                  className="formInput"
                  type="time"
                  name="transitionTime"
                  placeholder="Czas przejścia"
                  value={machine.transitionTime || ""}
                  onChange={(e) =>
                    setMachine((prevMachine) => ({
                      ...prevMachine,
                      transitionTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}
          <div className="inputsRow">
            <div className="inputContainer-50">
              <label>Status</label>
              <Select
                className="formInput"
                options={optionsStatus}
                id="status"
                name="status"
                value={{ label: machine.status, value: machine.status }}
                defaultValue={
                  machine.status
                    ? { label: machine.status, value: machine.status }
                    : { label: "STOP", value: "STOP" }
                }
                onChange={handleInputSelectStatus}
              />
            </div>
            <div className="inputContainer-50">
              <label>Wybierz połączenie</label>
              <Select
                className="formInput"
                options={optConn}
                id="connection"
                name="connection"
                isDisabled={showAddition ? true : false}
                value={
                  machine.connection
                    ? { label: machine.connection, value: machine.connection }
                    : { label: "Brak", value: "" }
                }
                defaultValue={
                  machine.connection
                    ? { label: machine.connection, value: machine.connection }
                    : { label: "Brak", value: "" }
                }
                onChange={handleInputSelectConnection}
              />
            </div>
          </div>
          {showAddition && (
            <div className="inputsRow">
              <div className="inputContainer-50">
                <label>Pierwsza dokładka:</label>
                <Select
                  className="formInput"
                  options={optAdd1}
                  id="addition1"
                  name="addition1"
                  value={{
                    label: machine.addition1,
                    value: machine.addition1,
                  }}
                  defaultValue={
                    machine.addition1
                      ? {
                          label: machine.addition1,
                          value: machine.addition1,
                        }
                      : { label: "Brak", value: "Brak" }
                  }
                  onChange={true}
                />
              </div>
              <div className="inputContainer-50">
                <label>Druga dokładka:</label>
                <Select
                  className="formInput"
                  options={optAdd2}
                  id="addition2"
                  name="addition2"
                  value={{
                    label: machine.addition2,
                    value: machine.addition2,
                  }}
                  defaultValue={
                    machine.addition2
                      ? {
                          label: machine.addition2,
                          value: machine.addition2,
                        }
                      : { label: "Brak", value: "Brak" }
                  }
                  onChange={true}
                />
              </div>
            </div>
          )}
          <div className="inputContainer-100">
            <label>Pracownik</label>
            <Select
              className="formInput"
              options={opt}
              id="worker"
              name="worker"
              value={
                machine.worker
                  ? { label: machine.worker, value: machine.worker }
                  : { label: "Brak", value: "" }
              }
              defaultValue={
                machine.worker
                  ? { label: machine.worker, value: machine.worker }
                  : { label: "Brak", value: "" }
              }
              onChange={handleInputSelectWorker}
            />
          </div>
          <div className="inputsRow">
            <div className="inputContainer-50">
              <label>Rząd</label>
              <Select
                className="formInput"
                options={optionsRow}
                id="row"
                name="row"
                value={{ label: machine.row, value: machine.row }}
                defaultValue={
                  machine.row
                    ? { label: machine.row, value: machine.row }
                    : { label: "Lewy rząd", value: "Lewy rząd" }
                }
                onChange={handleInputSelectRow}
              />
            </div>
            <div className="inputContainer-50">
              <label>Miejsce w rzędzie</label>
              <input
                className="formInput"
                type="number"
                name="rowPlace"
                placeholder="Miejsce"
                value={machine.rowPlace}
                onChange={(e) =>
                  setMachine((prevMachine) => ({
                    ...prevMachine,
                    rowPlace: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <Button className="buttonForm" variant="success" onClick={updateDoc2}>
            Aktualizuj
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalMachine;
