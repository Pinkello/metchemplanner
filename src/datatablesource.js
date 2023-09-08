export const machineColumns = [
  { field: "name", headerName: "Nazwa", width: 400 },
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
  // {
  //   field: "status",
  //   headerName: "Status",
  //   width: 160,
  //   renderCell: (params) => {
  //     return (
  //       <div className={`cellWithStatus ${params.row.status}`}>
  //         {params.row.status}
  //       </div>
  //     );
  //   },
  // },
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

export const scheduleColumns = (machines, machinesAll) => [
  {
    field: "name",
    headerName: "Maszyna i start",
    width: 150,
    height: 30,
    renderCell: (params) => {
      return renderName(params.row, machines, machinesAll);
    },
  },
  // Pozostałe kolumny
  {
    field: "retooling",
    headerName: "Przezbrojenie",
    width: 200,
    renderCell: (params) => {
      return renderRetooling(params.row, machines, machinesAll);
    },
  },
  {
    field: "transition",
    headerName: "Przejście",
    width: 200,
    renderCell: (params) => {
      return renderTransition(params.row, machines, machinesAll);
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 75,
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
    headerName: "Osoby",
    width: 70,
  },
];

function renderName(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );

  if (connectedMachine) {
    return (
      <div className="small-column">
        <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
        {currentMachine.startTime !== "" ? (
          <> o {currentMachine.startTime} + </>
        ) : (
          " + "
        )}
        <b style={{ color: "#009933" }}>{connectedMachine.name}</b>{" "}
        {connectedMachine.startTime !== "" ? (
          <> o {connectedMachine.startTime} </>
        ) : (
          ""
        )}
      </div>
    );
  }
  return (
    <div className="small-column">
      <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>{" "}
      {currentMachine.startTime !== "" ? (
        <>o {currentMachine.startTime} </>
      ) : (
        ""
      )}
    </div>
  );
}

// Funkcja do renderowania retoolingu
function renderRetooling(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );

  if (connectedMachine) {
    return (
      <div>
        <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
        {currentMachine.retooling !== "" ? (
          <>
            {"-> "}
            <b>{currentMachine.retooling}</b> o {currentMachine.retoolingTime}
          </>
        ) : (
          <>{"->"} brak</>
        )}
        {" | "}
        <b style={{ color: "#009933" }}>{currentMachine.connection}</b>
        {connectedMachine.retooling !== "" ? (
          <>
            {"-> "}
            <b>{connectedMachine.retooling}</b> o{" "}
            {connectedMachine.retoolingTime}
          </>
        ) : (
          <>{"->"} brak</>
        )}
      </div>
    );
  }
  return (
    <div>
      <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
      {currentMachine.retooling !== "" ? (
        <>
          {" "}
          {"-> "}
          <b>{currentMachine.retooling}</b> o {currentMachine.retoolingTime}
        </>
      ) : (
        <>{"->"} brak</>
      )}
    </div>
  );
}

// Funkcja do renderowania transition
function renderTransition(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );

  if (connectedMachine) {
    return (
      <div>
        <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
        {currentMachine.transition !== "" ? (
          <>
            {" "}
            {"-> "}
            <b>{currentMachine.transition}</b> o {currentMachine.transitionTime}
          </>
        ) : (
          <>{"->"} brak</>
        )}
        {" | "}
        <b style={{ color: "#009933" }}>{currentMachine.connection}</b>
        {connectedMachine.transition !== "" ? (
          <>
            {" "}
            {"-> "}
            <b>{connectedMachine.transition}</b> o{" "}
            {connectedMachine.transitionTime}
          </>
        ) : (
          <>{"->"} brak</>
        )}
      </div>
    );
  }
  return (
    <div>
      <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
      {currentMachine.transition !== "" ? (
        <>
          {" "}
          {"-> "}
          <b>{currentMachine.transition}</b> o {currentMachine.transitionTime}
        </>
      ) : (
        <>{"->"} brak</>
      )}
    </div>
  );
}
