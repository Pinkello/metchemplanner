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
    width: 300,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.img} alt="Brak" />
          {params.row.name} {params.row.surname}
        </div>
      );
    },
  },
  // {
  //   field: "email",
  //   headerName: "Email",
  //   width: 230,
  // },
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
    width: 300,
    height: 30,
    renderCell: (params) => {
      return renderName(params.row, machines, machinesAll);
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    renderCell: (params) => {
      return params.row.status === "Praca" ? (
        <div style={{ color: "#008000" }}>Praca</div>
      ) : params.row.status === "Rozruch" ? (
        <div style={{ color: " #ff1a1a" }}>Rozruch</div>
      ) : (
        <div style={{ color: "#ff7b00" }}>Uruchomienie</div>
      );
    },
  },
  {
    field: "retooling",
    headerName: "Przezbrojenie",
    width: 250,
    renderCell: (params) => {
      return renderRetooling(params.row, machines, machinesAll);
    },
  },
  {
    field: "transition",
    headerName: "Przejście",
    width: 250,
    renderCell: (params) => {
      return renderTransition(params.row, machines, machinesAll);
    },
  },
  {
    field: "worker",
    headerName: "Pracownik",
    width: 200,
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
        <b style={{ color: "#0066ff" }}>{currentMachine.name} </b>-
        {currentMachine.form}
        {currentMachine.startTime !== "" ? (
          <> o {currentMachine.startTime} + </>
        ) : (
          " + "
        )}
        <b style={{ color: "#009933" }}>{connectedMachine.name}</b>-
        {connectedMachine.form}{" "}
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
      <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>-
      {currentMachine.form}
      {currentMachine.startTime !== "" ? (
        <> o {currentMachine.startTime} </>
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
        {currentMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
            {"->"}
            <b>{currentMachine.retooling}</b> o {currentMachine.retoolingTime}
          </>
        ) : (
          <> --</>
        )}
        {" | "}
        {connectedMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#009933" }}>{currentMachine.connection}</b>
            {"->"}
            <b>{connectedMachine.retooling}</b> o{" "}
            {connectedMachine.retoolingTime}
          </>
        ) : (
          <>--</>
        )}
      </div>
    );
  }
  return (
    <div>
      {currentMachine.retooling !== "" ? (
        <>
          <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
          {"->"}
          <b>{currentMachine.retooling}</b> o {currentMachine.retoolingTime}
        </>
      ) : (
        <>--</>
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
        {currentMachine.transition !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
            {"->"}
            <b>{currentMachine.transition}</b> o {currentMachine.transitionTime}
          </>
        ) : (
          <>--</>
        )}
        {" | "}
        {connectedMachine.transition !== "" ? (
          <>
            <b style={{ color: "#009933" }}>{currentMachine.connection}</b>
            {"->"}
            <b>{connectedMachine.transition}</b> o{" "}
            {connectedMachine.transitionTime}
          </>
        ) : (
          <>--</>
        )}
      </div>
    );
  }
  return (
    <div>
      {currentMachine.transition !== "" ? (
        <>
          <b style={{ color: "#0066ff" }}>{currentMachine.name}</b>
          {"->"}
          <b>{currentMachine.transition}</b> o {currentMachine.transitionTime}
        </>
      ) : (
        <>--</>
      )}
    </div>
  );
}
