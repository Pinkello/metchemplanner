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
  const [optConn, setOptConn] = useState([{ value: "Brak", label: "Brak" }]);
  const [optAdd1, setOptAdd1] = useState([{ value: "Brak", label: "Brak" }]);
  const [optAdd2, setOptAdd2] = useState([{ value: "Brak", label: "Brak" }]);
  const [showRetooling, setShowRetooling] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  let contemp;

  const optionsStatus = [
    { value: "STOP", label: "Stop" },
    { value: "Praca", label: "Praca" },
    { value: "Rozruch", label: "Rozruch" },
    { value: "Uruch", label: "Uruch" },
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

  const sortTable2 = (table) => {
    table.sort((a, b) => {
      const nameA = a.value;
      const nameB = b.value;

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    table.unshift({ value: "", label: "Brak" });
  };

  useEffect(() => {
    setMachine(currentMachine);
    setRowOld(currentMachine.row);
    setRowPlaceOld(currentMachine.rowPlace);
    setShowAddition(currentMachine.isAddition);
  }, [currentMachine]);

  useEffect(() => {
    setOptAdd1([{ value: "Brak", label: "Brak" }]);
    setOptAdd2([{ value: "Brak", label: "Brak" }]);
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
  }, [machine.addition1, machine.addition2, machines]);

  useEffect(() => {
    const newOpt = workers.map((element) => ({
      value: element.name + " " + element.surname,
      label: element.name + " " + element.surname,
    }));
    setOpt([]);
    setOpt((prevOpt) => [...prevOpt, ...newOpt]);
  }, [workers]);

  useEffect(() => {
    const newOptConn = machines.map((element) => ({
      value: element.name,
      label: element.name,
    }));
    setOptConn([{ value: "Brak", label: "Brak" }]);
    setOptConn((prevOpt) => {
      const updatedState = [...prevOpt, ...newOptConn];
      return updatedState;
    });
  }, [machines]);

  useEffect(() => {
    sortTable(optConn);
  }, [optConn]);

  useEffect(() => {
    sortTable(optAdd1);
  }, [optAdd1]);

  useEffect(() => {
    sortTable(optAdd2);
  }, [optAdd2]);

  useEffect(() => {
    sortTable2(opt);
  }, [opt]);

  const handleInputSelectWorker = (selectedOption) => {
    console.log(selectedOption.value);
    console.log(selectedOption.label);
    setMachine((prevMachine) => ({
      ...prevMachine,
      worker: selectedOption.value,
    }));
  };

  const handleInputSelectConnection = (selectedOption) => {
    setMachine((prevMachine) => ({
      ...prevMachine,
      connection: selectedOption.value,
    }));
  };

  const handleInputSelectAddition1 = (selectedOption) => {
    setMachine((prevMachine) => ({
      ...prevMachine,
      addition1: selectedOption.value,
    }));
  };

  const handleInputSelectAddition2 = (selectedOption) => {
    setMachine((prevMachine) => ({
      ...prevMachine,
      addition2: selectedOption.value,
    }));
  };

  const handleInputSelectStatus = (selectedOption) => {
    setMachine((prevMachine) => ({
      ...prevMachine,
      status: selectedOption.value,
    }));
  };

  const handleInputSelectRow = (selectedOption) => {
    setMachine((prevMachine) => ({
      ...prevMachine,
      row: selectedOption.value,
    }));
  };

  const handleToggleRetoolingInput = () => {
    setShowRetooling((prevShowRetooling) => !prevShowRetooling);
    if (showRetooling) {
      setMachine((prevMachine) => ({
        ...prevMachine,
        retooling: "",
        retoolingTime: "",
      }));
    }
  };

  const handleToogleTransitionInput = () => {
    setShowTransition((prevShowTransition) => !prevShowTransition);
    if (showTransition) {
      setMachine((prevMachine) => ({
        ...prevMachine,
        transition: "",
        transitionTime: "",
      }));
    }
  };

  const handleToogleAdditionInput = () => {
    setShowAddition((prevShowAddition) => !prevShowAddition);
    setMachine((prevMachine) => ({
      ...prevMachine,
      isAddition: !machine.isAddition,
      addition1: "Brak",
      addition2: "Brak",
    }));
  };

  const resetMachine = async () => {
    const machineRef = doc(db, "dates", currentDate);
    const docSnap = await getDoc(machineRef);
    let temp;

    console.log(currentMachine.isAddition);
    console.log(machine.isAddition);

    if (currentMachine.isAddition) {
      if (currentMachine.addition1 !== "Brak") {
        temp =
          docSnap.data()[currentShift]["machinesToAdd"][
            currentMachine.addition1
          ];

        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.addition1}.connectionAdd`]:
            "Brak",
          [`${currentShift}.machinesToAdd.${temp.connection}.connectionAdd`]:
            "Brak",
        });
      }

      if (currentMachine.addition2 !== "Brak") {
        temp =
          docSnap.data()[currentShift]["machinesToAdd"][
            currentMachine.addition2
          ];

        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.addition2}.connectionAdd`]:
            "Brak",
          [`${currentShift}.machinesToAdd.${temp.connection}.connectionAdd`]:
            "Brak",
        });
      }
    }

    if (currentMachine.connection !== "Brak") {
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]:
          "Brak",
      });
    }

    await updateDoc(machineRef, {
      [`${currentShift}.machinesToAdd.${currentMachine.name}.form`]: "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.startTime`]: "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.retooling`]: "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.retoolingTime`]:
        "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.transition`]: "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.transitionTime`]:
        "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.status`]: "STOP",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.connection`]:
        "Brak",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.connectionAdd`]:
        "Brak",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.worker`]: "",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.addition1`]:
        "Brak",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.addition2`]:
        "Brak",
      [`${currentShift}.machinesToAdd.${currentMachine.name}.isAddition`]: false,
    });

    toast.warn("Resetuje maszyne " + currentMachine.name);
    setTimeout(() => {
      onHide();
    }, 600);
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
    if (
      machine.isAddition === true &&
      (machine.addition1 === "Brak" || machine.addition2 === "Brak")
    ) {
      toast.error("Brak podanych maszyn dla dokładki!");
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
          [`${currentShift}.machinesToAdd.${machine.connection}.status`]:
            machine.status,
        });
      }

      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${machine.connection}.connection`]:
          currentMachine.name,
      });
    } else if (
      machine.connection === "Brak" &&
      currentMachine.connection !== "Brak"
    ) {
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]:
          "Brak",
      });
    } else if (
      machine.connection !== "Brak" &&
      currentMachine.connection !== "Brak" &&
      machine.connection !== currentMachine.connection
    ) {
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]:
          "Brak",
      });
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${machine.connection}.connection`]:
          currentMachine.name,
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
          [`${currentShift}.machinesToAdd.${machine.connection}.status`]:
            machine.status,
        });

    //addition - check if true and if addition changed
    if (machine.isAddition === true) {
      console.log("HALO");
      if (
        currentMachine.addition1 !== "Brak" &&
        currentMachine.addition1 !== machine.addition1
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.addition1}.connectionAdd`]:
            "Brak",
        });
      }
      if (
        currentMachine.addition2 !== "Brak" &&
        currentMachine.addition2 !== machine.addition2
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.addition2}.connectionAdd`]:
            "Brak",
        });
      }

      //update machines with addition
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${machine.addition1}.connectionAdd`]:
          machine.name,
        [`${currentShift}.machinesToAdd.${machine.addition2}.connectionAdd`]:
          machine.name,
      });

      //and their connections
      contemp =
        docSnap.data()[currentShift]["machinesToAdd"][machine.addition1];

      if (contemp.connection !== "Brak")
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${contemp.connection}.connectionAdd`]:
            machine.name,
        });

      contemp =
        docSnap.data()[currentShift]["machinesToAdd"][machine.addition2];
      if (contemp.connection !== "Brak")
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${contemp.connection}.connectionAdd`]:
            machine.name,
        });
    }

    //when switching to none-addition, remove addition from machines
    if (currentMachine.isAddition === true && machine.isAddition === false) {
      console.log("zmiana na brak dokladki");
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.addition1}.connectionAdd`]:
          "Brak",
        [`${currentShift}.machinesToAdd.${currentMachine.addition2}.connectionAdd`]:
          "Brak",
      });

      contemp =
        docSnap.data()[currentShift]["machinesToAdd"][currentMachine.addition1];
      if (contemp.connection !== "Brak")
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${contemp.connection}.connectionAdd`]:
            "Brak",
        });

      contemp =
        docSnap.data()[currentShift]["machinesToAdd"][currentMachine.addition2];
      if (contemp.connection !== "Brak")
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${contemp.connection}.connectionAdd`]:
            "Brak",
        });
    }

    await updateDoc(machineRef, {
      [`${currentShift}.machinesToAdd.${currentMachine.name}.referencja`]:
        machine.referencja,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.form`]:
        machine.form,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.startTime`]:
        machine.startTime,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.retooling`]:
        machine.retooling,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.retoolingTime`]:
        machine.retoolingTime,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.transition`]:
        machine.transition,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.transitionTime`]:
        machine.transitionTime,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.status`]:
        machine.status,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.connection`]:
        machine.connection,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.connectionAdd`]:
        machine.connectionAdd,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.worker`]:
        machine.worker,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.addition1`]:
        machine.addition1,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.addition2`]:
        machine.addition2,
      [`${currentShift}.machinesToAdd.${currentMachine.name}.isAddition`]:
        showAddition,
    });

    //jeżeli retooling wjedzie na nową zmiane, to dodaj na tej nowej zmianie
    if (currentShift === "I") {
      if (machine.retoolingTime > "14:00" && machine.retoolingTime < "22:00") {
        await updateDoc(machineRef, {
          [`II.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`II.machinesToAdd.${currentMachine.name}.retooling`]:
            machine.retooling,
          [`II.machinesToAdd.${currentMachine.name}.retoolingTime`]:
            machine.retoolingTime,
          [`II.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
      if (
        machine.retoolingTime >= "22:00" ||
        (machine.retoolingTime >= "00:00" && machine.retoolingTime < "06:00")
      ) {
        await updateDoc(machineRef, {
          [`III.machinesToAdd.${currentMachine.name}.form`]: machine.form,
          [`III.machinesToAdd.${currentMachine.name}.retooling`]:
            machine.retooling,
          [`III.machinesToAdd.${currentMachine.name}.retoolingTime`]:
            machine.retoolingTime,
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
          [`III.machinesToAdd.${currentMachine.name}.retooling`]:
            machine.retooling,
          [`III.machinesToAdd.${currentMachine.name}.retoolingTime`]:
            machine.retoolingTime,
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
          [`I.machinesToAdd.${currentMachine.name}.retooling`]:
            machine.retooling,
          [`I.machinesToAdd.${currentMachine.name}.retoolingTime`]:
            machine.retoolingTime,
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
          [`I.machinesToAdd.${currentMachine.name}.retooling`]:
            machine.retooling,
          [`I.machinesToAdd.${currentMachine.name}.retoolingTime`]:
            machine.retoolingTime,
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
          [`II.machinesToAdd.${currentMachine.name}.retooling`]:
            machine.retooling,
          [`II.machinesToAdd.${currentMachine.name}.retoolingTime`]:
            machine.retoolingTime,
          [`II.machinesToAdd.${currentMachine.name}.status`]: machine.status,
        });
      }
    }

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
              {showAddition
                ? "Ustaw jako zwykłą maszynę"
                : "Ustaw jako dokładkę"}
            </button>
            <button
              className="css-button-shadow-border--red"
              onClick={resetMachine}
            >
              Zresetuj maszyne
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
          <div className={`inputsRow ${showRetooling ? "show" : "hide"}`}>
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

          <div className={`inputsRow ${showTransition ? "show" : "hide"}`}>
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

          <div className="inputsRow">
            <div className="inputContainer-50">
              <label>Status</label>
              <Select
                className="formInput"
                options={optionsStatus}
                id="status"
                name="status"
                value={
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
                    : { label: "STOP", value: "STOP" }
                }
                onChange={handleInputSelectConnection}
              />
            </div>
          </div>

          <div className={`inputsRow ${showAddition ? "show" : "hide"}`}>
            <div className="inputContainer-50">
              <label>Pierwsza dokładka:</label>
              <Select
                className="formInput"
                options={optAdd1}
                id="addition1"
                name="addition1"
                value={
                  machine.addition1
                    ? { label: machine.addition1, value: machine.addition1 }
                    : { label: "Brak", value: "Brak" }
                }
                onChange={handleInputSelectAddition1}
              />
            </div>
            <div className="inputContainer-50">
              <label>Druga dokładka:</label>
              <Select
                className="formInput"
                options={optAdd2}
                id="addition2"
                name="addition2"
                value={
                  machine.addition2
                    ? { label: machine.addition2, value: machine.addition2 }
                    : { label: "Brak", value: "Brak" }
                }
                onChange={handleInputSelectAddition2}
              />
            </div>
          </div>
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
                value={
                  machine.row
                    ? { label: machine.row, value: machine.row }
                    : { label: "1", value: "1" }
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
                value={machine.rowPlace ? machine.rowPlace : 1}
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
