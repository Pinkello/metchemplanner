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
  // const [name, setName] = useState(currentMachine.name);
  // const [form, setForm] = useState(currentMachine.form);
  // const [startTime, setStartTime] = useState(currentMachine.startTime);
  // const [retooling, setRetooling] = useState(currentMachine.retooling);
  // const [retoolingTime, setRetoolingTime] = useState(
  //   currentMachine.retoolingTime
  // );
  // const [transition, setTransition] = useState(currentMachine.transition);
  // const [transitionTime, setTransitionTime] = useState(
  //   currentMachine.transitionTime
  // );
  // const [status, setStatus] = useState(currentMachine.status);
  // const [connection, setConnection] = useState("Brak");
  // const [connection2, setConnection2] = useState(currentMachine.connection2);
  // const [worker, setWorker] = useState(currentMachine.worker);
  // const [row, setRow] = useState(currentMachine.row);
  // const [rowPlace, setRowPlace] = useState(parseInt(currentMachine.rowPlace));
  // const [referencja, setReferencja] = useState(currentMachine.referencja);
  const [rowOld, setRowOld] = useState(currentMachine.row);
  const [rowPlaceOld, setRowPlaceOld] = useState(
    parseInt(currentMachine.rowPlace)
  );
  const [machine, setMachine] = useState(currentMachine);
  const [opt, setOpt] = useState([]);

  let optionsConnection = [{ value: "Brak", label: "Brak" }];
  let optionsConnection2 = [{ value: "Brak", label: "Brak" }];
  const optionsWorker = [{ value: "", label: "Brak" }];
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
    // setName(currentMachine.name);
    // setForm(currentMachine.form);
    // setStatus(currentMachine.status);
    // setStartTime(currentMachine.startTime);
    // setRetooling(currentMachine.retooling);
    // setRetoolingTime(currentMachine.retoolingTime);
    // setTransition(currentMachine.transition);
    // setTransitionTime(currentMachine.transitionTime);
    // setConnection(currentMachine.connection);
    // setConnection2(currentMachine.connection2);
    // setWorker(currentMachine.worker);
    // setRow(currentMachine.row);
    // setRowPlace(currentMachine.rowPlace);
    // setRowPlaceOld(currentMachine.rowPlace);
    // setWorker(currentMachine.worker);
    // setRowOld(currentMachine.row);
    // setReferencja(currentMachine.referencja);
    setMachine(currentMachine);
    setRowOld(currentMachine.row);
    setRowPlaceOld(currentMachine.rowPlace);
  }, [currentMachine]);

  useEffect(() => {
    //porownaj nazwe wybranego elementu i dodaj do tablicy jezeli jest inna niz wybrana
    machines.forEach((element) => {
      const comparison = element.name.localeCompare(machine.connection);
      const comparison2 = element.name.localeCompare(machine.connection2);

      if (!(comparison2 === 0))
        optionsConnection.push({ value: element.name, label: element.name });
      if (!(comparison === 0))
        optionsConnection2.push({ value: element.name, label: element.name });
    });

    sortTable(optionsConnection);
    sortTable(optionsConnection2);
  }, [machine, machines, optionsConnection, optionsConnection2]);

  useEffect(() => {
    const newOpt = workers.map((element) => ({
      value: element.name + " " + element.surname,
      label: element.name + " " + element.surname,
    }));

    setOpt((prevOpt) => [...prevOpt, ...newOpt]);
  }, [workers]);

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
    optionsConnection2 = [{ value: "Brak", label: "Brak" }];

    machines.forEach((element) => {
      if (element.name !== selectedOption.value)
        optionsConnection2.push({ value: element.name, label: element.name });
    });

    sortTable(optionsConnection2);
  };

  const handleInputSelectConnection2 = (selectedOption) => {
    // setConnection2(selectedOption.value);
    setMachine((prevMachine) => ({
      ...prevMachine,
      connection2: selectedOption.value,
    }));
    optionsConnection = [{ value: "Brak", label: "Brak" }];

    machines.forEach((element) => {
      if (element.name !== selectedOption.value)
        optionsConnection.push({ value: element.name, label: element.name });
    });

    sortTable(optionsConnection);
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

    //POŁĄCZENIA MASZYn
    if (
      currentMachine.connection === "Brak" &&
      currentMachine.connection2 === "Brak"
    ) {
      if (machine.connection !== "Brak") {
        if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection][
            "connection"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection}.connection`]: currentMachine.name,
          });
        } else if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection][
            "connection2"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection}.connection2`]: currentMachine.name,
          });
        } else {
          toast.error("Brak wolnego miejsca na maszynie " + machine.connection);
          return;
        }
      }

      if (machine.connection2 !== "Brak") {
        if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection2][
            "connection"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection2}.connection`]: currentMachine.name,
          });
        } else if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection2][
            "connection2"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection2}.connection2`]: currentMachine.name,
          });
        } else {
          toast.error(
            "Brak wolnego miejsca na maszynie " + machine.connection2
          );
          return;
        }
      }
    }
    //jeśli na początku maszyna miała połączenie1 lub połączenie2
    else if (
      currentMachine.connection !== "Brak" ||
      currentMachine.connection2 !== "Brak"
    ) {
      //jeśli było połączenie1 a teraz go nie ma
      if (
        currentMachine.connection !== "Brak" &&
        machine.connection === "Brak"
      ) {
        //sprawdź który connection miała maszyna od której się odłączasz
        if (
          docSnap.data()[currentShift]["machinesToAdd"][
            currentMachine.connection
          ]["connection"] === currentMachine.name
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]: "Brak",
          });
          //jeśli to nie było connection1 to musi byc connection2
        } else {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection2`]: "Brak",
          });
        }
      } else if (
        currentMachine.connection !== "Brak" &&
        machine.connection === "Brak" &&
        currentMachine.connection !== machine.connection
      ) {
        //sprawdz ktore connection miala i odłącz od starej
        if (
          docSnap.data()[currentShift]["machinesToAdd"][
            currentMachine.connection
          ]["connection"] === currentMachine.name
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]: "Brak",
          });
          //jeśli to nie było connection1 to musi byc connection2
        } else {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection2`]: "Brak",
          });
        }

        //podłącz nową do wolnej connection
        if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection][
            "connection"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection}.connection`]: currentMachine.name,
          });
        } else if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection][
            "connection2"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection}.connection2`]: currentMachine.name,
          });
        } else {
          toast.error("Brak wolnego miejsca na maszynie " + machine.connection);
          return;
        }
      }

      //jeśli było połączenie2 a teraz go nie ma
      if (
        currentMachine.connection2 !== "Brak" &&
        machine.connection2 === "Brak"
      ) {
        //sprawdź który connection miała maszyna od której się odłączasz
        if (
          docSnap.data()[currentShift]["machinesToAdd"][
            currentMachine.connection2
          ]["connection"] === currentMachine.name
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection2}.connection`]: "Brak",
          });
          //jeśli to nie było connection1 to musi byc connection2
        } else {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection2}.connection2`]: "Brak",
          });
        }
      } else if (
        currentMachine.connection2 !== "Brak" &&
        machine.connection2 === "Brak" &&
        currentMachine.connection2 !== machine.connection2
      ) {
        //sprawdz ktore connection miala i odłącz od starej
        if (
          docSnap.data()[currentShift]["machinesToAdd"][
            currentMachine.connection2
          ]["connection"] === currentMachine.name
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection2}.connection`]: "Brak",
          });
          //jeśli to nie było connection1 to musi byc connection2
        } else {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${currentMachine.connection2}.connection2`]: "Brak",
          });
        }

        //podłącz nową do wolnej connection
        if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection2][
            "connection"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection2}.connection`]: currentMachine.name,
          });
        } else if (
          docSnap.data()[currentShift]["machinesToAdd"][machine.connection2][
            "connection2"
          ] === "Brak"
        ) {
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${machine.connection2}.connection2`]: currentMachine.name,
          });
        } else {
          toast.error(
            "Brak wolnego miejsca na maszynie " + machine.connection2
          );
          return;
        }
      }
    }

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
      [`${currentShift}.machinesToAdd.${currentMachine.name}.connection2`]: machine.connection2,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.worker`]: machine.worker,
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

  console.log("opt");
  console.log(opt);

  console.log("masyzna");
  console.log(machine);
  console.log(machine.worker);

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
          <label>Nazwa maszyny</label>
          <input
            className="formInput"
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
          <label>Status</label>
          <Select
            className="formInput"
            options={optionsStatus}
            id="status"
            name="status"
            defaultValue={
              machine.status
                ? { label: machine.status, value: machine.status }
                : { label: "STOP", value: "STOP" }
            }
            onChange={handleInputSelectStatus}
          />

          <label>Wybierz połączenie</label>
          <Select
            className="formInput"
            options={optionsConnection}
            id="connection"
            name="connection"
            defaultValue={{
              label: machine.connection,
              value: machine.connection,
            }}
            onChange={handleInputSelectConnection}
          />
          <label>Wybierz kolejne połączenie</label>
          <Select
            className="formInput"
            options={optionsConnection2}
            id="connection2"
            name="connection2"
            defaultValue={
              machine.connection2
                ? { label: machine.connection2, value: machine.connection2 }
                : { label: "Brak", value: "Brak" }
            }
            onChange={handleInputSelectConnection2}
          />
          <label>Pracownik</label>
          <Select
            className="formInput"
            options={opt}
            id="worker"
            name="worker"
            defaultValue={
              machine.worker
                ? { label: machine.worker, value: machine.worker }
                : { label: "Brak", value: "" }
            }
            onChange={handleInputSelectWorker}
          />
          <label>Rząd</label>
          <Select
            className="formInput"
            options={optionsRow}
            id="row"
            name="row"
            defaultValue={
              machine.row
                ? { label: machine.row, value: machine.row }
                : { label: "Lewy rząd", value: "Lewy rząd" }
            }
            onChange={handleInputSelectRow}
          />
          <label>Miejsce w rzędzie</label>
          <input
            className="formInput"
            type="number"
            name="rowPlace"
            placeholder="Miejsce"
            value={machine.rowPlace || ""}
            onChange={(e) =>
              setMachine((prevMachine) => ({
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

export default ModalMachine;
