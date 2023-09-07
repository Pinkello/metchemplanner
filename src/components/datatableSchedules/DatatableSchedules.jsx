import "./datatableSchedules.scss";
import { DataGrid } from "@mui/x-data-grid";
import { scheduleColumns } from "../../datatablesource";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import Select from "react-select";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DatatableSchedules = () => {
  const [data, setData] = useState([]);
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

  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];

  const handleInputSelectShift = (selectedOption) => {
    setCurrentShift(selectedOption.value);
  };

  useEffect(() => {
    //LISTEN
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "dates", currentDate),
      async (querySnapshot) => {
        let tempMachine = {};
        let list = [];
        let id = 1;

        let tempService = {};
        let list2 = [];

        if (!querySnapshot.data()) {
          console.log("puste na start");
          //pobierz domyślną liste maszyn
        } else {
          console.log("nie puste na start");
          const machinesDatabase = Object.values(
            querySnapshot.data()[currentShift]["machinesToAdd"]
          );

          for (const machine of machinesDatabase) {
            tempMachine = machine;
            const ref = doc(db, "machines", machine.referencja);
            const docSnap2 = await getDoc(ref);

            if (docSnap2.data() && machine.status !== "STOP") {
              tempMachine = {
                ...tempMachine,
                name: docSnap2.data().name,
                row: docSnap2.data().row,
                rowPlace: docSnap2.data().rowPlace,
                id: id,
              };

              list.push(tempMachine);
              id = id + 1;
            }
          }

          const connections = {};
          list.forEach((machine) => {
            if (machine.connection !== "Brak") {
              connections[machine.connection] = machine;
            }
          });

          console.log("connections");
          console.log(connections);

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

          const secondList = list.sort((a, b) => {
            const aNum = parseInt(a.name.replace(/[^\d]/g, ""), 10);
            const bNum = parseInt(b.name.replace(/[^\d]/g, ""), 10);

            if (aNum !== bNum) {
              return aNum - bNum;
            } else {
              return a.name.localeCompare(b.name, undefined, {
                numeric: true,
              });
            }
          });
          console.log("druga lista");
          console.log(secondList);

          // Druga lista maszyn

          // Tworzenie trzeciej listy z uwzględnieniem połączeń
          const thirdList = [];

          for (const machine of secondList) {
            const { name, connection } = machine;

            if (
              connection === "Brak" ||
              !thirdList.find((item) => item.name === connection)
            ) {
              thirdList.push(machine);
            }
          }

          console.log("trzecia lista");
          console.log(thirdList);

          setNotes(querySnapshot.data()[currentShift]["notes"]);

          setTimeout(() => {
            setLoading(false);
          }, 2000);
          console.log("Lista maszyn z dnia");
          console.log(list);
          console.log("Lista usług z dnia");
          console.log(list2);

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

  const loadShift = (someDate, someShift) => {
    console.log("load shift");
    const q = query(collection(db, "dates"));
    const docsArray = [];

    const unsub = onSnapshot(q, async (snapShot) => {
      snapShot.docs.forEach((doc) => {
        docsArray.push(doc.id);
      });
      if (docsArray.includes(someDate)) {
        console.log("jest w tabeli");
      } else {
        console.log("nie jest w tabeli");
      }
    });

    return () => {
      unsub();
    };
  };

  const showServices = (services) => {
    services.sort((a, b) => a.rowPlace - b.rowPlace);
    return services.map((element, index) => {
      return (
        <div className="singleService" key={index}>
          {element.praca === "Tak" ? (
            <div>
              <b>{element.name}</b> |&nbsp;
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    });
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
    <div className="datatableSchedules ">
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
      <div className="dateShow print-hide ">
        <label htmlFor="date"> Data:</label>
        <input
          className="formInput"
          id="date"
          type="date"
          name="date"
          placeholder="Data"
          value={currentDate}
          onChange={(e) => {
            loadShift(e.target.value, currentShift);
            setCurrentDate(e.target.value);
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
          defaultValue={{ label: currentShift, value: currentShift }}
          onChange={(value) => {
            loadShift(currentDate, value.value);
            handleInputSelectShift(value);
          }}
        />
      </div>

      <div className="datatableTitleSchedules ">
        Grafik - zmiana &nbsp;
        <span className="currentShift">{currentShift}</span> &nbsp; dnia &nbsp;
        <span className="currentDate">{currentDate}</span>
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
          <h4 className="serviceTitle">Lista obsługi:</h4>
          <div className="servicesRow">{showServices(services)}</div>
        </div>{" "}
        <hr />
        <br />
        <div className="notes">
          <div className="datatableTitleSchedules">
            Uwagi:
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
          <hr />

          <div className="notesArea">{notes}</div>
        </div>
      </div>
    </div>
  );
};

export default DatatableSchedules;
