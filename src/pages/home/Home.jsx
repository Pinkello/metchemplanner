import "./home.scss";
import { toast, ToastContainer } from "react-toastify";
import NavigationBar from "../../components/navigation/NavigationBar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";

const Home = () => {
  const [machines, setMachines] = useState([]);
  const [currentMachine, setCurrentMachine] = useState({});
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currentShift, setCurrentShift] = useState("I");
  const [sideRow, setSideRow] = useState([]);
  const [leftRow, setleftRow] = useState([]);
  const [rightRow, setRightRow] = useState([]);
  const [middleRow, setMiddleRow] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const optionsConnection = [{ value: "Brak", label: "Brak" }];
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
  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];

  useEffect(() => {
    //LISTEN

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

        if (!querySnapshot.data()) {
          console.log("puste na start");
          const docRef = doc(db, "dates", "2023-01-01");
          const docSnap = await getDoc(docRef);

          console.log("nowy snap");
          console.log(docSnap.data());
          const machinesDatabase = Object.values(
            docSnap.data()["I"]["machinesToAdd"]
          );
          console.log("nowa lista maszyn");
          console.log(machinesDatabase);

          for (const machine of machinesDatabase) {
            tempMachine = machine;
            const ref = machine.referencja;
            const docSnap2 = await getDoc(ref);

            machinesToAdd[docSnap2.data().name] = tempMachine;
            list.push(tempMachine);
          }

          const docData = {
            I: {
              machinesToAdd,
            },
            II: {
              machinesToAdd,
            },
            III: {
              machinesToAdd,
            },
          };

          try {
            await setDoc(doc(db, "dates", currentDate), docData);
          } catch (err) {
            console.log(err);
          }
        } else {
          console.log("nie puste na start");
          const machinesDatabase = Object.values(
            querySnapshot.data()[currentShift]["machinesToAdd"]
          );

          for (const machine of machinesDatabase) {
            tempMachine = machine;
            const ref = machine.referencja;
            const docSnap2 = await getDoc(ref);

            tempMachine = {
              ...tempMachine,
              name: docSnap2.data().name,
              row: docSnap2.data().row,
              rowPlace: docSnap2.data().rowPlace,
            };

            list.push(tempMachine);
          }
        }

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
    setCurrentShift(selectedOption.value);
  };

  const loadShift = (someDate, someShift) => {
    const q = query(collection(db, "dates"));
    const docsArray = [];

    const unsub = onSnapshot(
      q,
      async (snapShot) => {
        snapShot.docs.forEach((doc) => {
          docsArray.push(doc.id);
        });
        if (docsArray.includes(someDate)) {
          console.log("jest w tabeli");
        } else {
          console.log("nie jest w tabeli");
          handleAddDate();
        }
      },
      (error) => {
        console.log(error);
      }
    );

    const handleAddDate = async () => {
      console.log("dodawanie");

      var machinesToAdd = {};

      for (const machine of machines) {
        // const referredDocumentRef = doc(db, "machines", machine.id);
        // const docSnap = await getDoc(referredDocumentRef);
        const machineToAdd = {
          referencja: machine.referencja,
          // ...docSnap.data(),
          status: "STOP",
          operator: "",
          retooling: "",
          retoolingTime: "",
          form: "--",
          connection: "Brak",
          numberOfPeople: "1",
        };
        machinesToAdd[machine.name] = machineToAdd;
      }

      console.log(machinesToAdd);
      const docData = {
        I: {
          machinesToAdd,
        },
        II: {
          machinesToAdd,
        },
        III: {
          machinesToAdd,
        },
      };

      try {
        await setDoc(doc(db, "dates", someDate), docData);
      } catch (err) {
        console.log(err);
      }
    };

    return () => {
      unsub();
    };
  };

  function MyVerticallyCenteredModal(props) {
    const [name, setName] = useState(currentMachine.name);
    const [form, setForm] = useState(currentMachine.form);
    const [retooling, setRetooling] = useState(currentMachine.retooling);
    const [retoolingTime, setRetoolingTime] = useState(
      currentMachine.retoolingTime
    );
    const [status, setStatus] = useState(currentMachine.status);
    const [connection, setConnection] = useState(currentMachine.connection);
    const [numberOfPeople, setNumberOfPeople] = useState(
      currentMachine.numberOfPeople
    );
    const [row, setRow] = useState(currentMachine.row);
    const [rowPlace, setRowPlace] = useState(currentMachine.rowPlace);
    const [referencja, setReferencja] = useState(currentMachine.referencja);

    useEffect(() => {
      console.log("wywolanie tego dziwnego");

      machines.map((element) => {
        optionsConnection.push({ value: element.name, label: element.name });
      });
    }, []);

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
      const machineRef = doc(db, "dates", currentDate);
      await updateDoc(machineRef, {
        [`${currentShift}.machinesToAdd.${currentMachine.name}.referencja`]:
          referencja,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.form`]: form,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.retooling`]:
          retooling,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.retoolingTime`]:
          retoolingTime,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.status`]: status,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.connection`]:
          connection,
        [`${currentShift}.machinesToAdd.${currentMachine.name}.numberOfPeople`]:
          numberOfPeople,
      });

      if (connection !== "Brak" && currentMachine.connection === "Brak") {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${connection}.connection`]:
            currentMachine.name,
        });
      } else if (
        connection === "Brak" &&
        currentMachine.connection !== "Brak"
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]:
            "Brak",
        });
      } else if (
        connection !== "Brak" &&
        currentMachine.connection !== "Brak" &&
        connection !== currentMachine.connection
      ) {
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${currentMachine.connection}.connection`]:
            "Brak",
        });
        await updateDoc(machineRef, {
          [`${currentShift}.machinesToAdd.${connection}.connection`]:
            currentMachine.name,
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
            <label>Ilość osób</label>
            <input
              className="formInput"
              type="number"
              name="numberOfPeople"
              placeholder="Ilość osób"
              value={numberOfPeople}
              onChange={(e) => {
                setNumberOfPeople(e.target.value);
              }}
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
  const modal = useMemo(() => {
    return (
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    );
  }, [modalShow]);

  const showRow = (row) => {
    row.sort((a, b) => a.rowPlace - b.rowPlace);
    return row.map((element, index) => {
      return (
        <div className="machine" key={index}>
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
    <div className="home">
      <div className="homeContainer">
        <ToastContainer />
        <NavigationBar />
        {modal}
        <div className="containerMain">
          <div className="dateShow">
            Data
            <input
              className="formInput"
              type="date"
              name="date"
              placeholder="Data"
              value={currentDate}
              onChange={(e) => {
                loadShift(e.target.value, currentShift);
                setCurrentDate(e.target.value);
              }}
            />
            Zmiana
            <Select
              className="formInput"
              options={optionsShift}
              id="shift"
              name="shift"
              defaultValue={{ label: currentShift, value: currentShift }}
              onChange={(value) => {
                loadShift(currentDate, value.value);
                handleInputSelectShift(value);
              }}
            />
          </div>
          <div className="rows">
            <div className="mainRow">{showRow(sideRow)}</div>
            <div className="mainRow">{showRow(leftRow)}</div>
            <div className="mainRow">{showRow(middleRow)}</div>
            <div className="mainRow">{showRow(rightRow)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
