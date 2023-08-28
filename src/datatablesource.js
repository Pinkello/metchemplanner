export const machineColumns = [
  { field: "name", headerName: "Nazwa", width: 100 },
  // { field: "form", headerName: "Forma", width: 150 },
  // { field: "operator", headerName: "Operator", width: 200 },
  // { field: "retooling", headerName: "Przezbrojenie na", width: 100 },
  // { field: "retoolingTime", headerName: "Przezbrojenie o", width: 100 },
  // {
  //   field: "user",
  //   headerName: "User",
  //   width: 230,
  //   renderCell: (params) => {
  //     return (
  //       <div className="cellWithImg">
  //         <img className="cellImg" src={params.row.img} alt="avatar" />
  //         {params.row.username}
  //       </div>
  //     );
  //   },
  // },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
];

export const workerColumns = [
  // { field: "id", headerName: "ID", width: 200 },
  {
    field: "user",
    headerName: "Imię i nazwisko",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.img} alt="avatar" />
          {params.row.name} {params.row.surname}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },
  {
    field: "brigade",
    headerName: "Brygada",
    width: 200,
  },
];

export const scheduleColumns = (machines, usedMachines) => [
  {
    field: "name",
    headerName: "Maszyna",
    width: 150,
    height: 30,
    renderCell: (params) => {
      if (params.row.connection !== "Brak") {
        return (
          <div className="small-column">
            <b style={{ color: "#0066ff" }}>{params.row.name}</b> +{" "}
            <b style={{ color: "#009933" }}>{params.row.connection}</b>{" "}
          </div>
        );
      } else {
        return (
          <div className="small-column">
            <b style={{ color: "#0066ff" }}>{params.row.name}</b>
          </div>
        );
      }
    },
  },
  // Pozostałe kolumny
  {
    field: "retooling",
    headerName: "Przezbrojenie",
    width: 400,
    renderCell: (params) => {
      return renderRetooling(params.row, machines, usedMachines);
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 200,
    renderCell: (params) => {
      return params.row.status === "Praca" ? (
        <div style={{ color: "#008000" }}>Praca</div>
      ) : params.row.status === "Rozruch" ? (
        <div style={{ color: "#b3b300" }}>Rozruch</div>
      ) : (
        <div style={{ color: "#ff7b00" }}>Uruchomienie</div>
      );
    },
  },
  {
    field: "numberOfPeople",
    headerName: "Ilość osób",
    width: 200,
  },
];

// Funkcja do renderowania retoolingu
function renderRetooling(row, machines, usedMachines) {
  if (usedMachines.includes(row.name)) {
    console.log("zawiera " + row.name);
  } else {
    console.log("nie zawiera");
  }
  console.log(usedMachines);
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;

  const connectedMachine = machines.find(
    (machine) => machine.name === connectedMachineName
  );

  if (connectedMachine) {
    return (
      <div>
        <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
        {"-> "}
        <b>{currentMachine.retooling}</b> o {currentMachine.retoolingTime}
        {" | "}
        <b style={{ color: "#009933" }}>{currentMachine.connection}</b>
        {"-> "}
        <b>{connectedMachine.retooling}</b> o {connectedMachine.retoolingTime}
      </div>
    );
  }
  usedMachines.push(connectedMachine);
  return (
    <div>
      <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
      {"-> "}
      <b>{currentMachine.retooling}</b> o {currentMachine.retoolingTime}
    </div>
  );
}
