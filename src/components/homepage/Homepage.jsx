import React from "react";

import "./homepage.scss";

import { ToastContainer } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  query,
  setDoc,
  getDocs,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "../../firebase";

import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import Spinner from "react-bootstrap/Spinner";
import ModalLoad from "./../modals/ModalLoad";
import ModalService from "./../modals/ModalService";
import ModalMachine from "./../modals/ModalMachine";

const Homepage = () => {
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
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

  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];
  const [tempDate, setTempDate] = useState(currentDate);
  const [tempShift, setTempShift] = useState(currentShift);

  const fetchDataFromDoc = async (machineTab, machineData, id) => {
    const list = [];

    const q = query(
      collection(db, "machines"),
      where(documentId(), "in", machineTab)
    );

    const machinesDocsSnap = await getDocs(q);
    let result;

    machinesDocsSnap.forEach((doc) => {
      result = machineData.find((machine) => machine.referencja === doc.id);
      if (result) {
        result = {
          ...result,
          name: doc.data().name,
          row: doc.data().row,
          rowPlace: doc.data().rowPlace,
          id: id,
        };
        id = id + 1;
        list.push(result);
      }
    });
    return list;
  };

  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
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

        let tablica = [];
        let tablica2 = [];
        let tablicaService = [];

        let id = 1;
        let id2 = 25;

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
              connectionAdd: "Brak",
              isAddition: false,
              addition1: "Brak",
              addition2: "Brak",
              worker: "",
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
              worker: "",
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
            tablica.push(machine.referencja);
          }

          tablica2 = tablica.slice(0, 25);
          const listPromise = await fetchDataFromDoc(
            tablica2,
            machinesDatabase,
            id
          );

          tablica2 = tablica.slice(25, 50);
          const listPromise2 = await fetchDataFromDoc(
            tablica2,
            machinesDatabase,
            id2
          );

          list = [...listPromise, ...listPromise2];

          const connections = {};
          list.forEach((machine) => {
            if (machine.connection !== "Brak") {
              connections[machine.connection] = machine;
            }
          });

          const servicesDatabase = Object.values(
            querySnapshot.data()[currentShift]["servicesToAdd"]
          );

          for (const service of servicesDatabase) {
            tablicaService.push(service.referencja);
          }

          const qService = query(
            collection(db, "services"),
            where(documentId(), "in", tablicaService)
          );

          const servicesDocsSnap = await getDocs(qService);
          let result;

          servicesDocsSnap.forEach((doc) => {
            result = servicesDatabase.find(
              (service) => service.referencja === doc.id
            );
            if (result) {
              result = {
                ...result,
                name: doc.data().name,
                row: doc.data().row,
                rowPlace: doc.data().rowPlace,
                id: id,
              };
              id = id + 1;
              list2.push(result);
            }
          });
        }
        setTimeout(() => {
          setLoading(false);
        }, 500);

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

  const modal = useMemo(() => {
    return (
      <ModalMachine
        currentDate={currentDate}
        currentShift={currentShift}
        machines={machines}
        currentMachine={currentMachine}
        workers={workers}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    );
  }, [currentDate, currentMachine, currentShift, machines, modalShow, workers]);

  const modalService = useMemo(() => {
    return (
      <ModalService
        currentService={currentService}
        currentDate={currentDate}
        currentShift={currentShift}
        // optionsWorker={optionsWorker}
        show={modalServiceShow}
        onHide={() => setModalServiceShow(false)}
      />
    );
  }, [modalServiceShow, currentService, currentDate, currentShift]);

  const modalLoad = useMemo(() => {
    return (
      <ModalLoad
        currentDate={currentDate}
        currentShift={currentShift}
        show={modalLoadShow}
        onHide={() => setModalLoadShow(false)}
      />
    );
  }, [modalLoadShow, currentDate, currentShift]);

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
            <div style={{ marginTop: "10px" }}>
              Opis: <b>{element.opis}</b>
            </div>
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
              variant="warning"
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
          )}{" "}
          {element.connectionAdd !== "Brak" && (
            <Button
              variant="info"
              onClick={() => {
                setCurrentMachine(
                  machines.find((obj) => {
                    return obj.name === element.connectionAdd;
                  })
                );
                setModalShow(true);
              }}
            >
              <b> {element.connectionAdd}</b>
            </Button>
          )}{" "}
          {element.isAddition && (
            <>
              <Button
                variant="info"
                onClick={() => {
                  setCurrentMachine(
                    machines.find((obj) => {
                      return obj.name === element.connectionAdd;
                    })
                  );
                  setModalShow(true);
                }}
              >
                <b> {element.addition1}</b>
              </Button>{" "}
              <Button
                variant="info"
                onClick={() => {
                  setCurrentMachine(
                    machines.find((obj) => {
                      return obj.name === element.connectionAdd;
                    })
                  );
                  setModalShow(true);
                }}
              >
                <b> {element.addition2}</b>
              </Button>
            </>
          )}{" "}
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
                {" ok. "}
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
                {" ok. "}
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
                      handleInputSelectShift(value);
                    }}
                  />
                </div>
                <div className="buttonsDate">
                  <Button
                    variant="dark"
                    className="css-button-sharp--black"
                    onClick={() => {
                      handleButtonClick();
                    }}
                  >
                    <b> Wybierz zmianę</b>
                  </Button>

                  <Button
                    variant="secondary"
                    className="css-button-rounded--grey"
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

export default Homepage;
