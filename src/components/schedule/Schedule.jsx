import React from "react";
import "./schedule.scss";
import { DataGrid } from "@mui/x-data-grid";
import { scheduleColumns } from "../../datatablesource";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  getDocs,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "../../firebase";
import Select from "react-select";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DatatableSchedules = () => {
  const [machines, setMachines] = useState([]);
  const [machinesAll, setMachinesAll] = useState([]);
  const [services, setServices] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currentShift, setCurrentShift] = useState("I");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [modalNotesShow, setModalNotesShow] = useState(false);
  const [tempDate, setTempDate] = useState(currentDate);
  const [tempShift, setTempShift] = useState(currentShift);

  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];

  const fetchDataFromDoc = async (machineTab, machineData, id) => {
    const list = [];

    const q = query(
      collection(db, "machines"),
      where(documentId(), "in", machineTab)
    );

    const machinesDocsSnap = await getDocs(q);
    let result;

    machinesDocsSnap.forEach((doc) => {
      result = machineData.find(
        (machine) => machine.referencja === doc.id && machine.status !== "STOP"
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
        list.push(result);
      }
    });
    return list;
  };

  useEffect(() => {
    //LISTEN
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "dates", currentDate),
      async (querySnapshot) => {
        let list = [];
        let list2 = [];

        let tablica = [];
        let tablica2 = [];
        let tablicaService = [];

        let id = 1;
        let id2 = 25;

        if (!querySnapshot.data()) {
          console.log("puste na start");
          //pobierz domyślną liste maszyn
          setLoading(false);
        } else {
          console.log("nie puste na start");
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
              (service) =>
                service.referencja === doc.id && service.praca === "Tak"
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

          console.log("lista");
          console.log(list);

          // const secondList = list.sort((a, b) => {
          //   const aNum = parseInt(a.name.replace(/[^\d]/g, ""), 10);
          //   const bNum = parseInt(b.name.replace(/[^\d]/g, ""), 10);

          //   if (aNum !== bNum) {
          //     return aNum - bNum;
          //   } else {
          //     return a.name.localeCompare(b.name, undefined, {
          //       numeric: true,
          //     });
          //   }
          // });

          // Function to sort by rowPlace
          const sortByRowPlace = (a, b) => {
            return a.rowPlace - b.rowPlace;
          };

          const sortByRowPlaceDesc = (a, b) => b.rowPlace - a.rowPlace;

          // Filter and sort for each row type
          const srodkowyRzad = list
            .filter((item) => item.row === "Środkowy rząd")
            .sort(sortByRowPlace);
          const prawyRzad = list
            .filter((item) => item.row === "Prawy rząd")
            .sort(sortByRowPlaceDesc);
          const bocznyRzad = list
            .filter((item) => item.row === "Boczny rząd")
            .sort(sortByRowPlace);
          const lewyRzad = list
            .filter((item) => item.row === "Lewy rząd")
            .sort(sortByRowPlace);

          // Concatenate the arrays in the desired order
          const secondList = [
            ...srodkowyRzad,
            ...prawyRzad,
            ...bocznyRzad,
            ...lewyRzad,
          ];

          // Druga lista maszyn

          // Tworzenie trzeciej listy z uwzględnieniem połączeń
          const thirdList = [];

          for (const machine of secondList) {
            const { connection, isAddition } = machine;
            if (
              (connection === "Brak" ||
                !thirdList.find((item) => item.name === connection)) &&
              !isAddition
            ) {
              thirdList.push(machine);
            }
          }

          console.log("trzecia lista");
          console.log(thirdList);

          setNotes(querySnapshot.data()[currentShift]["notes"]);

          setTimeout(() => {
            setLoading(false);
          }, 500);

          setMachines(thirdList);
          setMachinesAll(secondList);
          setServices(list2);
        }
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, [currentDate, currentShift]);

  const showServices = (services) => {
    console.log("sortuje");
    services.sort((a, b) => a.rowPlace - b.rowPlace);
    return services.map((element, index) => {
      return (
        <div className="singleService" key={index}>
          {element.praca === "Tak" ? (
            <div>
              &nbsp; &nbsp;
              <i>
                <b style={{ color: "blue" }}>{element.name}</b>
              </i>
              &nbsp;&nbsp;
              {/* <b>||</b> */}
              <div style={{ textAlign: "center" }}>
                {element.opis ? element.opis : <br />}
              </div>
              <div style={{ textAlign: "center", color: "green" }}>
                {element.worker ? element.worker : <br />}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    });
  };

  const handleButtonClick = () => {
    setCurrentDate(tempDate);
    setCurrentShift(tempShift);
  };

  const handleInputSelectShift = (selectedOption) => {
    setTempShift(selectedOption.value);
  };

  const handleInputSelectDate = (e) => {
    e.preventDefault();
    // setCurrentDate(e.target.value);
    setTempDate(e.target.value);
  };

  function MyVerticallyCenteredModalNotes(props) {
    const [notes2, setNotes2] = useState(notes);

    const handleChange = (e) => {
      setNotes(e.target.value);
      setNotes2(e.target.value);
    };

    const textareaStyle = {
      overflow: "auto", // lub 'hidden', jeśli nie chcesz widocznych pasków przewijania
      whiteSpace: "pre-wrap", // umożliwia łamanie tekstu do kolejnych linii
      height: "auto", // początkowa wysokość pola tekstowego
      minHeight: "100px", // minimalna wysokość pola tekstowego
    };

    const updateDoc2 = async (e) => {
      const machineRef = doc(db, "dates", currentDate);
      await updateDoc(machineRef, {
        [`${currentShift}.notes`]: notes2,
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
            Edycja notatek
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rowInputs">
            <label>Notatki</label>
            <textarea
              className="formInput"
              name="notes"
              placeholder="Notatki"
              value={notes2}
              style={textareaStyle}
              onChange={handleChange}
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

  const modalNotes = useMemo(() => {
    return (
      <MyVerticallyCenteredModalNotes
        show={modalNotesShow}
        onHide={() => setModalNotesShow(false)}
      />
    );
  }, [modalNotesShow]);

  const columns = scheduleColumns(machines, machinesAll);

  return (
    <div className="datatableSchedules container">
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
      {modalNotes}
      <div className="row row1">
        <div className="dateShow print-hide col-12 col-xl-7 ">
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
          </div>
        </div>
      </div>
      <div className="datatableTitleSchedules ">
        <h4 className="titleh2">
          Grafik - zmiana &nbsp;
          <span className="currentShift">{currentShift}</span> &nbsp; dnia
          &nbsp;
          <span className="currentDate">{currentDate}</span>
        </h4>
        <div className="buttonPrinter print-hide">
          {" "}
          <button onClick={() => window.print()}>Drukuj</button>
        </div>
      </div>

      <div className="datagridContainer">
        <DataGrid
          className="datagrid"
          rows={machines}
          columns={columns}
          autoHeight
          getRowHeight={() => "auto"}
          components={{
            Footer: () => null,
            Pagination: () => null,
          }}
          localeText={{
            noRowsLabel: "Brak pracujących maszyn na tej zmianie",
          }}
        />
        <br />
        <div className="serviceList">
          <h4 className="serviceTitle">Montaże</h4>
          <div className="servicesRow">{showServices(services)}</div>
        </div>{" "}
        <hr />
        <div className="notes">
          <div className="datatableTitleSchedules">
            <h4 className="serviceTitle">Uwagi</h4>
            <div className="buttonNotes print-hide">
              <Button
                variant="primary"
                onClick={() => {
                  setModalNotesShow(true);
                }}
              >
                Edytuj
              </Button>{" "}
            </div>
          </div>

          <div className="notesArea">{notes}</div>
          <br />
          <hr />
        </div>
      </div>
    </div>
  );
};

export default DatatableSchedules;
