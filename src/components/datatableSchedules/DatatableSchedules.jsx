import "./datatableSchedules.scss";
import { DataGrid } from "@mui/x-data-grid";
import { scheduleColumns } from "../../datatablesource";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase";
import Select from "react-select";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";

const DatatableSchedules = () => {
  const [data, setData] = useState([]);
  const [machines, setMachines] = useState([]);
  const [services, setServices] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currentShift, setCurrentShift] = useState("I");
  const [loading, setLoading] = useState(true);

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

          const emptyConnectionMachines = list.filter(
            (machine) => machine.connection === "Brak"
          );
          emptyConnectionMachines.sort((a, b) =>
            a.connection.localeCompare(b.name)
          );

          console.log("emptyConnectionMachines");
          console.log(emptyConnectionMachines);

          const sortedMachines = [];
          let index = 0;
          emptyConnectionMachines.forEach((machine) => {
            sortedMachines.push(machine);
            if (connections[machine.name]) {
              sortedMachines.splice(index + 1, 0, connections[machine.name]);
              index++;
            }
            index++;
          });
          console.log("sorted");
          console.log(sortedMachines);

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

          setTimeout(() => {
            setLoading(false);
          }, 2000);
          console.log("Lista maszyn z dnia");
          console.log(list);
          console.log("Lista usług z dnia");
          console.log(list2);
          setMachines(list);
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
          <b>{element.name}</b> &nbsp;{" "}
          {element.praca === "Tak" ? (
            <span className="serviceWork">Pracuje</span>
          ) : (
            <span className="serviceStop">Nie pracuje</span>
          )}{" "}
          &nbsp; | &nbsp;
        </div>
      );
    });
  };

  return (
    <div className="datatable">
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

      <div className="datatableTitle">
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
          columns={scheduleColumns}
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
        </div>
        <br />
        <div className="notes">
          <div>
            <h4 className="notesTitle">Uwagi:</h4>
          </div>

          <div className="notesArea">ASDASDSA</div>
        </div>
      </div>
    </div>
  );
};

export default DatatableSchedules;
