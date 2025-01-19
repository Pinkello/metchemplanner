import React from "react";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import { Spinner } from "react-bootstrap";

const ModalLoad = (props) => {
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [currentDateLoad, setCurrentDateLoad] = useState(props.currentDate);
  const [currentShiftLoad, setCurrentShiftLoad] = useState(props.currentShift);
  const [toLoad, setToLoad] = useState({
    value: "machines",
    label: "Maszyny",
  });

  const optionsShift = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
  ];

  const optionsLoad = [
    { value: "all", label: "Wszystko" },
    { value: "machines", label: "Maszyny" },
    { value: "services", label: "Montaże" },
  ];

  const handleInputSelectShiftLoad = (selectedOption) => {
    setCurrentShiftLoad(selectedOption.value);
  };

  const handleInputSelectOptionsLoad = (selectedOption) => {
    setToLoad(selectedOption);
  };

  const updateDoc2 = async () => {
    try {
      const docRef = doc(db, "dates", currentDateLoad);
      const date = await getDoc(docRef);
      const machinesList = date.data()[currentShiftLoad].machinesToAdd;

      checkedItems.forEach((element) => {
        machinesList[connections[element].machine1]["connection"] = "Brak";
        machinesList[connections[element].machine2]["connection"] = "Brak";

        if (connections[element].addition !== "Brak") {
          machinesList[connections[element].machine1]["connectionAdd"] = "Brak";
          machinesList[connections[element].machine2]["connectionAdd"] = "Brak";

          //usuwam do której to maszyny była dokładka
          if (
            machinesList[connections[element].addition]["addition1"] ===
              connections[element].machine1 ||
            machinesList[connections[element].addition]["addition1"] ===
              connections[element].machine2
          ) {
            machinesList[connections[element].addition]["addition1"] = "Brak";
          }

          if (
            machinesList[connections[element].addition]["addition2"] ===
              connections[element].machine1 ||
            machinesList[connections[element].addition]["addition2"] ===
              connections[element].machine2
          ) {
            machinesList[connections[element].addition]["addition2"] = "Brak";
          }

          //jeżeli już nie jest dokładką do żadnej maszyny to ustawiam na false
          if (
            machinesList[connections[element].addition]["addition1"] ===
              "Brak" &&
            machinesList[connections[element].addition]["addition2"] === "Brak"
          ) {
            machinesList[connections[element].addition]["isAddition"] = false;
          }
        }
      });

      if (
        props.currentDate === currentDateLoad &&
        props.currentShift === currentShiftLoad
      ) {
        toast.error("Nie możesz ładować danych z tego samego dnia i zmiany");
        return;
      }

      const dateToReplace = doc(db, "dates", props.currentDate);
      switch (toLoad.value) {
        case "all":
          await updateDoc(dateToReplace, {
            [`${props.currentShift}.machinesToAdd`]: machinesList,
            [`${props.currentShift}.servicesToAdd`]:
              date.data()[currentShiftLoad].servicesToAdd,
          });
          break;
        case "machines":
          await updateDoc(dateToReplace, {
            [`${props.currentShift}.machinesToAdd`]: machinesList,
          });
          break;
        case "services":
          await updateDoc(dateToReplace, {
            [`${props.currentShift}.servicesToAdd`]:
              date.data()[currentShiftLoad].servicesToAdd,
          });
          break;
        default:
          toast.error("Wystąpił błąd");
      }

      toast.success("Ładuje dane...");
      setTimeout(() => {
        props.onHide(false);
      }, 400);
    } catch (error) {
      toast.error("Brak danych z podanego dnia.");
    }
  };

  useEffect(() => {
    setCheckedItems([]);
    if (props.show) {
      setToLoad({ label: "Maszyny", value: "machines" });
      setCurrentShiftLoad(props.currentShift);
    }
  }, [props.show]);

  useEffect(() => {
    if (props.show) {
      async function pullConnections() {
        setLoading(true);
        const docRef = doc(db, "dates", currentDateLoad);
        const date = await getDoc(docRef);
        const machinesList = date.data()
          ? date.data()[currentShiftLoad].machinesToAdd
          : {};

        const connectionsArray = [];

        const sortedMachines = Object.entries(machinesList).sort((a, b) => {
          const numA = parseInt(a[0].split("-")[1], 10);
          const numB = parseInt(b[0].split("-")[1], 10);

          if (numA < numB) return -1;
          if (numA > numB) return 1;
          return 0;
        });

        sortedMachines.forEach(([key, value]) => {
          if (
            value.connection !== "Brak" &&
            !connectionsArray.some((el) => el.machine1 === value.connection)
          ) {
            connectionsArray.push({
              machine1: key,
              machine2: value.connection,
              addition: value.connectionAdd,
            });
          }
        });

        setConnections(connectionsArray);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }

      pullConnections();
    }
  }, [currentShiftLoad, currentDateLoad, props.show]);

  const handleCheckboxChange = (index) => {
    setCheckedItems((prevCheckedItems) => {
      if (prevCheckedItems.includes(index)) {
        return prevCheckedItems.filter((item) => item !== index); // Usuwanie zaznaczenia
      } else {
        return [...prevCheckedItems, index]; // Dodawanie zaznaczenia
      }
    });
  };

  const handleSelectAll = () => {
    const allIndexes = connections.map((_, index) => index); // Tworzymy tablicę ze wszystkimi indeksami
    setCheckedItems(allIndexes); // Ustawiamy je jako zaznaczone
  };

  const handleDeselectAll = () => {
    setCheckedItems([]); // Usuwamy wszystkie zaznaczenia
  };

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal show={loading} centered>
        <Modal.Body className="d-flex justify-content-center">
          <div>
            <h3>Pobieranie danych... </h3>
          </div>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Modal.Body>
      </Modal>

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
            <label htmlFor="shift">Zmiana:</label>

            <Select
              className="formInput"
              options={optionsShift}
              id="shift"
              name="shift"
              defaultValue={{
                label: props.currentShift,
                value: props.currentShift,
              }}
              onChange={(value) => {
                handleInputSelectShiftLoad(value);
              }}
            />

            <label htmlFor="optionsLoad">Co załadować:</label>
            <Select
              className="formInput"
              options={optionsLoad}
              id="optionsLoad"
              name="optionsLoad"
              defaultValue={{ label: "Maszyny", value: "machines" }}
              onChange={(option) => {
                handleInputSelectOptionsLoad(option);
              }}
            />
          </div>

          <div>
            {connections.length > 0 && (
              <div>
                <h3>Lista połączeń do usunięcia:</h3>
                <ul>
                  {connections.map((con, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`checkbox-${index}`} // Unikalny id dla każdego checkboxa
                        onChange={() => handleCheckboxChange(index)} // Funkcja do obsługi zmiany stanu checkboxa
                        checked={checkedItems.includes(index)}
                      />{" "}
                      <b>{con.machine1}</b> + <b>{con.machine2}</b>
                      {con.addition !== "Brak" ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: ` z dokładką <b>${con.addition}</b>`,
                          }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  ))}
                </ul>
                <button onClick={handleSelectAll}>Zaznacz wszystkie</button>
                <button onClick={handleDeselectAll}>Odznacz wszystkie</button>
              </div>
            )}
          </div>

          <Button className="buttonForm" variant="success" onClick={updateDoc2}>
            Załaduj dane
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalLoad;
