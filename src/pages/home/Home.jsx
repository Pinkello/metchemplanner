import "./home.scss";
import { toast, ToastContainer } from "react-toastify";
import NavigationBar from "../../components/navigation/NavigationBar";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  setDoc,
  getDoc,
  getDocs,
  where,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { db } from "../../firebase";

import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Select from "react-select";

const Home = () => {
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMachine, setCurrentMachine] = useState({});
  const [currentService, setCurrentService] = useState({});
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currentShift, setCurrentShift] = useState("I");
  const [sideRow, setSideRow] = useState([]);
  const [leftRow, setleftRow] = useState([]);
  const [rightRow, setRightRow] = useState([]);
  const [middleRow, setMiddleRow] = useState([]);
  const [leftRow2, setleftRow2] = useState([]);
  const [rightRow2, setRightRow2] = useState([]);
  const [middleRow2, setMiddleRow2] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [modalServiceShow, setModalServiceShow] = useState(false);
  const [modalLoadShow, setModalLoadShow] = useState(false);
  const optionsConnection = [{ value: "Brak", label: "Brak" }];
  const optionsWorker = [{ value: "Brak", label: "Brak" }];
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
  const optionsRowService = [
    { value: "Lewy rząd", label: "Lewy rząd" },
    { value: "Środkowy rząd", label: "Środkowy rząd" },
    { value: "Prawy rząd", label: "Prawy rząd" },
  ];
  const optionsPracaService = [
    { value: "Tak", label: "Tak" },
    { value: "Nie", label: "Nie" },
  ];
  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];
  const [tempDate, setTempDate] = useState(currentDate);
  const [tempShift, setTempShift] = useState(currentShift);
  const [tempDateLoad, setTempDateLoad] = useState(currentDate);
  const [tempShiftLoad, setTempShiftLoad] = useState(currentShift);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        let tempWorker = {};
        let tempWorkers = [];

        const querySnapshotWorker = await getDocs(collection(db, "workers"));
        querySnapshotWorker.forEach((doc) => {
          tempWorker = {
            name: doc.data().name,
            surname: doc.data().surname,
            brigade: doc.data().brigade,
          };
          tempWorkers.push(tempWorker);
        });

        setWorkers(tempWorkers);
      } catch (err) {
        console.log(err);
      }
    };

    fetchWorkers();
  }, []);

  useEffect(() => {
    //LISTEN
    setLoading(true);
    console.log("wywolanie duzego effecta");

    const unsub = onSnapshot(
      doc(db, "dates", currentDate),
      async (querySnapshot) => {
        let tempMachine = {};
        let list = [];
        let listS = [];
        let listL = [];
        let listR = [];
        let listM = [];
        const machinesToAdd = {};

        let tempService = {};
        let list2 = [];
        let listL2 = [];
        let listR2 = [];
        let listM2 = [];
        const servicesToAdd = {};

        if (!querySnapshot.data()) {
          console.log("puste na start");

          //pobierz domyślną liste maszyn

          const q2 = query(collection(db, "machines"));
          const querySnapshot2 = await getDocs(q2);
          querySnapshot2.forEach((doc) => {
            // idMachinesList.push(doc.id);
            tempMachine = {
              referencja: doc.id,
              status: "STOP",
              operator: "",
              startTime: "",
              retooling: "",
              retoolingTime: "",
              transition: "",
              transitionTime: "",
              form: "",
              connection: "Brak",
              worker: "Brak",
              numberOfPeople: "1",
            };

            machinesToAdd[doc.data().name] = tempMachine;
          });

          const q3 = query(collection(db, "services"));
          const querySnapshot3 = await getDocs(q3);
          querySnapshot3.forEach((doc) => {
            // idMachinesList.push(doc.id);
            tempService = {
              referencja: doc.id,
              praca: "Nie",
              opis: "",
            };

            servicesToAdd[doc.data().name] = tempService;
          });

          const docData = {
            I: {
              machinesToAdd,
              servicesToAdd,
            },
            II: {
              machinesToAdd,
              servicesToAdd,
            },
            III: {
              machinesToAdd,
              servicesToAdd,
            },
          };

          try {
            await setDoc(doc(db, "dates", currentDate), docData);
          } catch (err) {
            console.log(err);
          }
        } else {
          const machinesDatabase = Object.values(
            querySnapshot.data()[currentShift]["machinesToAdd"]
          );

          for (const machine of machinesDatabase) {
            tempMachine = machine;
            const ref = doc(db, "machines", machine.referencja);
            const docSnap2 = await getDoc(ref);
            // const docRef = doc(db, "dates", "2023-01-01");
            // const docSnap = await getDoc(docRef);
            if (docSnap2.data()) {
              tempMachine = {
                ...tempMachine,
                name: docSnap2.data().name,
                row: docSnap2.data().row,
                rowPlace: docSnap2.data().rowPlace,
              };

              list.push(tempMachine);
            }
          }

          const servicesDatabase = Object.values(
            querySnapshot.data()[currentShift]["servicesToAdd"]
          );

          for (const service of servicesDatabase) {
            tempService = service;
            const ref = doc(db, "services", service.referencja);
            const docSnap2 = await getDoc(ref);

            if (docSnap2.data()) {
              tempService = {
                ...tempService,
                name: docSnap2.data().name,
                row: docSnap2.data().row,
                rowPlace: docSnap2.data().rowPlace,
              };

              list2.push(tempService);
            }
          }
        }

        setTimeout(() => {
          setLoading(false);
        }, 3000);

        setMachines(list);

        list.forEach((element) => {
          if (element.row === "Prawy rząd") {
            listR.push(element);
          } else if (element["row"] === "Lewy rząd") {
            listL.push(element);
          } else if (element["row"] === "Boczny rząd") {
            listS.push(element);
          } else {
            listM.push(element);
          }
        });
        setSideRow(listS);
        setleftRow(listL);
        setMiddleRow(listM);
        setRightRow(listR);

        setServices(list2);
        list2.forEach((element) => {
          if (element.row === "Prawy rząd") {
            listR2.push(element);
          } else if (element["row"] === "Lewy rząd") {
            listL2.push(element);
          } else {
            listM2.push(element);
          }
        });
        setleftRow2(listL2);
        setMiddleRow2(listM2);
        setRightRow2(listR2);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, [currentShift, currentDate]);

  const handleInputSelectShift = (selectedOption) => {
    setTempShift(selectedOption.value);
  };

  const handleInputSelectDate = (e) => {
    e.preventDefault();
    // setCurrentDate(e.target.value);
    setTempDate(e.target.value);
  };

  const handleButtonClick = () => {
    setCurrentDate(tempDate);
    setCurrentShift(tempShift);
  };

  function MyVerticallyCenteredModalService(props) {
    const [praca, setPraca] = useState(currentService.praca);
    const [name, setName] = useState(currentService.name);
    const [row, setRow] = useState(currentService.row);
    const [rowPlace, setRowPlace] = useState(currentService.rowPlace);
    const [description, setDescription] = useState(currentService.opis);
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
        {...props}
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
              defaultValue={{ label: praca, value: praca }}
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
            <Button
              className="buttonForm"
              variant="success"
              onClick={updateDoc2}
            >
              Aktualizuj
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  function MyVerticallyCenteredModal(props) {
    const [name, setName] = useState(currentMachine.name);
    const [form, setForm] = useState(currentMachine.form);
    const [startTime, setStartTime] = useState(currentMachine.startTime);
    const [retooling, setRetooling] = useState(currentMachine.retooling);
    const [retoolingTime, setRetoolingTime] = useState(
      currentMachine.retoolingTime
    );
    const [transition, setTransition] = useState(currentMachine.transition);
    const [transitionTime, setTransitionTime] = useState(
      currentMachine.transitionTime
    );
    const [status, setStatus] = useState(currentMachine.status);
    const [connection, setConnection] = useState(currentMachine.connection);
    const [worker, setWorker] = useState(currentMachine.worker);
    const [numberOfPeople, setNumberOfPeople] = useState(
      currentMachine.numberOfPeople
    );
    const [row, setRow] = useState(currentMachine.row);
    const [rowOld, setRowOld] = useState(currentMachine.row);
    const [rowPlace, setRowPlace] = useState(parseInt(currentMachine.rowPlace));
    const [rowPlaceOld, setRowPlaceOld] = useState(
      parseInt(currentMachine.rowPlace)
    );
    const [referencja, setReferencja] = useState(currentMachine.referencja);

    useEffect(() => {
      machines.map((element) => {
        optionsConnection.push({ value: element.name, label: element.name });
      });
      workers.map((element) => {
        optionsWorker.push({
          value: element.name + " " + element.surname,
          label: element.name + " " + element.surname,
        });
      });
    }, []);

    const handleInputSelectWorker = (selectedOption) => {
      setWorker(selectedOption.value);
    };

    const handleInputSelectConnection = (selectedOption) => {
      setConnection(selectedOption.value);
    };

    const handleInputSelectStatus = (selectedOption) => {
      setStatus(selectedOption.value);
    };

    const handleInputSelectRow = (selectedOption) => {
      setRow(selectedOption.value);
    };

    const updateDoc2 = async (e) => {
      if (status !== "STOP" && (form === "" || form === "--")) {
        toast.error("Brak podanej formy!");
        return;
      }

      if (retooling !== "" && retoolingTime === "") {
        toast.error("Brak podanej godziny dla przezbrojenia!");
        return;
      }
      if (transition !== "" && transitionTime === "") {
        toast.error("Brak podanej godziny dla przejścia!");
        return;
      }

      //zmiana miejsca w rzedzie innych maszyn
      const batch = writeBatch(db);
      if (rowPlace !== rowPlaceOld || row !== rowOld)
        if (row === rowOld) {
          if (rowPlace > rowPlaceOld) {
            const q = query(
              collection(db, "machines"),
              where("row", "==", row),
              where("rowPlace", "<=", parseInt(rowPlace)),
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
              where("row", "==", row),
              where("rowPlace", ">=", parseInt(rowPlace)),
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
            where("row", "==", row),
            where("rowPlace", ">=", parseInt(rowPlace))
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
        name: name,
        row: row,
        rowPlace: parseInt(rowPlace),
      });

      //update maszyny
      const machineRef = doc(db, "dates", currentDate);
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.name}.referencja`]: referencja,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.form`]: form,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.startTime`]: startTime,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.transition`]: transition,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.transitionTime`]: transitionTime,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.status`]: status,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.connection`]: connection,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.worker`]: worker,
      });
      const docSnap = await getDoc(machineRef);

      //jeżeli retooling wjedzie na nową zmiane, to dodaj na tej nowej zmianie
      if (currentShift === "I") {
        if (retoolingTime > "14:00" && retoolingTime < "22:00") {
          await updateDoc(machineRef, {
            [`II.machinesToAdd.${currentMachine.name}.form`]: form,
            [`II.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
            [`II.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
            [`II.machinesToAdd.${currentMachine.name}.status`]: status,
          });
        }
        if (
          retoolingTime >= "22:00" ||
          (retoolingTime >= "00:00" && retoolingTime < "06:00")
        ) {
          await updateDoc(machineRef, {
            [`III.machinesToAdd.${currentMachine.name}.form`]: form,
            [`III.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
            [`III.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
            [`III.machinesToAdd.${currentMachine.name}.status`]: status,
          });
        }
      } else if (currentShift === "II") {
        if (
          retoolingTime > "22:00" ||
          (retoolingTime >= "00:00" && retoolingTime < "06:00")
        ) {
          await updateDoc(machineRef, {
            [`III.machinesToAdd.${currentMachine.name}.form`]: form,
            [`III.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
            [`III.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
            [`III.machinesToAdd.${currentMachine.name}.status`]: status,
          });
        }
        if (retoolingTime >= "06:00" && retoolingTime <= "13:59") {
          const dateObject = new Date(currentDate);
          dateObject.setDate(dateObject.getDate() + 1);
          const nextDayDateString = dateObject.toISOString().split("T")[0];

          const machineRef2 = doc(db, "dates", nextDayDateString);

          await updateDoc(machineRef2, {
            [`I.machinesToAdd.${currentMachine.name}.form`]: form,
            [`I.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
            [`I.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
            [`I.machinesToAdd.${currentMachine.name}.status`]: status,
          });
        }
      } else if (currentShift === "III") {
        if (retoolingTime >= "06:00" && retoolingTime <= "21:59") {
          const dateObject = new Date(currentDate);
          dateObject.setDate(dateObject.getDate() + 1);
          const nextDayDateString = dateObject.toISOString().split("T")[0];

          const machineRef2 = doc(db, "dates", nextDayDateString);

          await updateDoc(machineRef2, {
            [`I.machinesToAdd.${currentMachine.name}.form`]: form,
            [`I.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
            [`I.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
            [`I.machinesToAdd.${currentMachine.name}.status`]: status,
          });
        }
        if (retoolingTime > "13:59" && retoolingTime <= "21:59") {
          const dateObject = new Date(currentDate);
          dateObject.setDate(dateObject.getDate() + 1);
          const nextDayDateString = dateObject.toISOString().split("T")[0];

          const machineRef2 = doc(db, "dates", nextDayDateString);

          await updateDoc(machineRef2, {
            [`II.machinesToAdd.${currentMachine.name}.form`]: form,
            [`II.machinesToAdd.${currentMachine.name}.retooling`]: retooling,
            [`II.machinesToAdd.${currentMachine.name}.retoolingTime`]: retoolingTime,
            [`II.machinesToAdd.${currentMachine.name}.status`]: status,
          });
        }
      }

      //zmiana connection i maszyny polaczonej
      if (connection !== "Brak" && currentMachine.connection === "Brak") {
        if (
          docSnap.data()[currentShift]["machinesToAdd"][connection].status !==
          status
        )
          await updateDoc(machineRef, {
            [`${currentShift}.machinesToAdd.${connection}.status`]: status,
          });

        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${connection}.connection`]: currentMachine.name,
        });
      } else if (
        connection === "Brak" &&
        currentMachine.connection !== "Brak"
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]: "Brak",
          [`${currentShift}.machinesToAdd.${currentMachine.connection}.status`]: "STOP",
        });
      } else if (
        connection !== "Brak" &&
        currentMachine.connection !== "Brak" &&
        connection !== currentMachine.connection
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]: "Brak",
          [`${currentShift}.machinesToAdd.${currentMachine.connection}.status`]: "STOP",
        });
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${connection}.connection`]: currentMachine.name,
        });
      }

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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Rozpoczęcie pracy</label>
            <input
              className="formInput"
              type="time"
              name="startTime"
              placeholder="Rozpoczęcie"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
              }}
            />
            <label>Forma</label>
            <input
              className="formInput"
              type="text"
              name="form"
              placeholder="Forma"
              value={form}
              onChange={(e) => {
                setForm(e.target.value);
              }}
            />
            <label>Przezbrojenie</label>
            <input
              className="formInput"
              type="text"
              name="retooling"
              placeholder="Przezbrojenie"
              value={retooling}
              onChange={(e) => {
                setRetooling(e.target.value);
              }}
            />
            <label>Czas przezbrojenia</label>
            <input
              className="formInput"
              type="time"
              name="retoolingTime"
              placeholder="Czas przezbrojenia"
              value={retoolingTime}
              onChange={(e) => {
                setRetoolingTime(e.target.value);
              }}
            />
            <label>Przejście</label>
            <input
              className="formInput"
              type="text"
              name="transition"
              placeholder="Przejście na:"
              value={transition}
              onChange={(e) => {
                setTransition(e.target.value);
              }}
            />
            <label>Czas przejścia</label>
            <input
              className="formInput"
              type="time"
              name="transitionTime"
              placeholder="Czas przejścia"
              value={transitionTime}
              onChange={(e) => {
                setTransitionTime(e.target.value);
              }}
            />
            <label>Status</label>
            <Select
              className="formInput"
              options={optionsStatus}
              id="status"
              name="status"
              defaultValue={{ label: status, value: status }}
              onChange={handleInputSelectStatus}
            />

            <label>Wybierz połączenie</label>
            <Select
              className="formInput"
              options={optionsConnection}
              id="connection"
              name="connection"
              defaultValue={{ label: connection, value: connection }}
              onChange={handleInputSelectConnection}
            />
            <label>Pracownik</label>
            <Select
              className="formInput"
              options={optionsWorker}
              id="worker"
              name="worker"
              defaultValue={{ label: worker, value: worker }}
              onChange={handleInputSelectWorker}
            />
            <label>Rząd</label>
            <Select
              className="formInput"
              options={optionsRow}
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
            <Button
              className="buttonForm"
              variant="success"
              onClick={updateDoc2}
            >
              Aktualizuj
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  // funkcja do załadowania z innego dnia
  function MyVerticallyCenteredModalLoad(props) {
    const [currentDateLoad, setCurrentDateLoad] = useState(currentDate);
    const [currentShiftLoad, setCurrentShiftLoad] = useState(currentShift);

    const handleInputSelectShiftLoad = (selectedOption) => {
      setCurrentShiftLoad(selectedOption.value);
    };

    const updateDoc2 = async (e) => {
      // await updateDoc(datesRef, {
      //   [`${currentShift}.servicesToAdd.${currentService.name}.praca`]: "",
      // });

      const docRef = doc(db, "dates", currentDateLoad);
      const date = await getDoc(docRef);
      try {
        if (
          currentDate === currentDateLoad &&
          currentShift === currentShiftLoad
        ) {
          toast.error("Nie możesz ładować danych z tego samego dnia i zmiany");
          return;
        }
        const dateToReplace = doc(db, "dates", currentDate);

        // if (currentShiftLoad === "I") {
        //   console.log("do 1");
        //   console.log(date.data().I);
        //   const jeden = "I";
        //   await updateDoc(dateToReplace, {
        //     I: date.data()[currentShiftLoad],
        //   });
        // }
        // if (currentShiftLoad === "II") {
        //   await updateDoc(dateToReplace, {
        //     II: date.data()[currentShiftLoad],
        //   });
        // }
        // if (currentShiftLoad === "III") {
        //   await updateDoc(dateToReplace, {
        //     III: date.data()[currentShiftLoad],
        //   });
        // }
        console.log(currentShift);
        console.log(currentShiftLoad);
        console.log(currentDateLoad);
        console.log(currentDate);
        await updateDoc(dateToReplace, {
          [currentShift]: date.data()[currentShiftLoad],
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

            <Button
              className="buttonForm"
              variant="success"
              onClick={updateDoc2}
            >
              Załaduj dane
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  const modal = useMemo(() => {
    return (
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    );
  }, [modalShow]);

  const modalService = useMemo(() => {
    return (
      <MyVerticallyCenteredModalService
        show={modalServiceShow}
        onHide={() => setModalServiceShow(false)}
      />
    );
  }, [modalServiceShow]);

  const modalLoad = useMemo(() => {
    return (
      <MyVerticallyCenteredModalLoad
        show={modalLoadShow}
        onHide={() => setModalLoadShow(false)}
      />
    );
  }, [modalLoadShow]);

  const showRowService = (servicesRow) => {
    servicesRow.sort((a, b) => a.rowPlace - b.rowPlace);
    return servicesRow.map((element, index) => {
      return (
        <div className="machine border shadow bg-white rounded " key={index}>
          <Button
            variant="primary"
            onClick={() => {
              setCurrentService(element);
              setModalServiceShow(true);
            }}
          >
            <b>{element.name}</b>
          </Button>{" "}
          <h5
            className={element.praca === "Tak" ? "Praca" : "STOP"}
            style={{ float: "right" }}
          >
            {" "}
            {element.praca}
          </h5>
          {element.opis !== "" ? (
            <div style={{ marginTop: "10px" }}>Opis: {element.opis}</div>
          ) : (
            <></>
          )}
        </div>
      );
    });
  };

  const showRow = (row) => {
    row.sort((a, b) => a.rowPlace - b.rowPlace);
    return row.map((element, index) => {
      return (
        <div className="machine border-info shadow rounded" key={index}>
          <Button
            variant="primary"
            onClick={() => {
              setCurrentMachine(element);
              setModalShow(true);
            }}
          >
            <b>{element.name}</b>
          </Button>{" "}
          {element.connection !== "Brak" && (
            <Button
              variant="primary"
              onClick={() => {
                setCurrentMachine(
                  machines.find((obj) => {
                    return obj.name === element.connection;
                  })
                );
                setModalShow(true);
              }}
            >
              <b> {element.connection}</b>
            </Button>
          )}
          <h5 className={element.status} style={{ float: "right" }}>
            {" "}
            {element.status}
          </h5>
          <div style={{ marginTop: "10px" }}>
            {element.startTime !== "" ? (
              <>
                {" "}
                Start: <b>{element.startTime}</b> <br />
              </>
            ) : (
              ""
            )}
            Forma: <b>{element.form}</b>
            {element.retooling !== "" ? (
              <>
                {" --->  "}
                <b style={{ color: "green" }}>{element.retooling} </b>
                {" o "}
                <b style={{ color: "blue" }}>{element.retoolingTime}</b>
              </>
            ) : (
              ""
            )}
            {element.transition ? (
              <>
                <br />
                {" Przejście "}
                <b style={{ color: "green" }}>{element.transition} </b>
                {" o "}
                <b style={{ color: "blue" }}>{element.transitionTime}</b>
              </>
            ) : (
              ""
            )}
          </div>
          <div>
            {" "}
            <b>
              {element.numberOfPeople !== "1" &&
                element.numberOfPeople + " osoby do obsługi"}
            </b>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="home ">
      <div className="homeContainer ">
        <Modal show={loading} centered>
          <Modal.Body className="d-flex justify-content-center ">
            <div>
              {" "}
              <h3>Pobieranie danych... </h3>
            </div>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Modal.Body>
        </Modal>
        <ToastContainer />
        <NavigationBar />
        {modal}
        {modalService}
        {modalLoad}
        <div className="containerMain container">
          <div className="row rows">
            <div className="dateShow border border-primary shadow rounded  col-xl-8 col-11">
              <label htmlFor="date"> Data:</label>
              <input
                className="formInput"
                id="date"
                type="date"
                name="date"
                placeholder="Data"
                value={tempDate}
                onChange={(e) => {
                  handleInputSelectDate(e);
                  // loadShift(e.target.value, currentShift);
                  // setCurrentDate(e.target.value);
                }}
              />
              <label htmlFor="shift" className="shift-label">
                Zmiana:
              </label>
              <div className="select-container">
                <div className="selects">
                  <Select
                    className="formInput"
                    options={optionsShift}
                    id="shift"
                    name="shift"
                    defaultValue={{ label: tempShift, value: tempShift }}
                    onChange={(value) => {
                      // loadShift(currentDate, value.value);
                      handleInputSelectShift(value);
                    }}
                  />
                  {/* <button onClick={handleButtonClick}>Wybierz zmianę</button> */}
                </div>
                <div className="buttonsDate">
                  <Button
                    variant="dark"
                    className="formButton"
                    onClick={() => {
                      handleButtonClick();
                    }}
                  >
                    <b> Wybierz zmianę</b>
                  </Button>

                  <Button
                    variant="secondary"
                    className="formButton"
                    onClick={() => {
                      setModalLoadShow(true);
                    }}
                  >
                    <b> Wczytaj dane</b>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="rows row">
            <div className="mainRow col-lg-6 col-xl-3">{showRow(sideRow)}</div>
            <div className="mainRow col-lg-6 col-xl-3">{showRow(leftRow)}</div>
            <div className="mainRow col-lg-6 col-xl-3">
              {showRow(middleRow)}
            </div>
            <div className="mainRow col-lg-6 col-xl-3">{showRow(rightRow)}</div>
          </div>
          <div className="rows row">
            <div className="mainRow col-lg-4  ">{showRowService(leftRow2)}</div>
            <div className="mainRow col-lg-4 ">
              {showRowService(middleRow2)}
            </div>
            <div className="mainRow col-lg-4 ">{showRowService(rightRow2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
