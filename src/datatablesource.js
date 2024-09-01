import React from "react";

export const machineColumns = [
  {
    field: "name",
    headerName: "Nazwa",
    width: 600,
    renderCell: (params) => {
      return <div className="machineNames">{params.row.name}</div>;
    },
  },
];

export const serviceColumns = [
  {
    field: "name",
    headerName: "Nazwa",
    width: 600,
    renderCell: (params) => {
      return <div className="serviceNames">{params.row.name}</div>;
    },
  },
];

export const notesColumns = [
  {
    field: "note",
    headerName: "Notatka",
    width: 600,
    renderCell: (params) => {
      return <div className="machineNames">{params.row.notes}</div>;
    },
  },
];

export const workerColumns = [
  // { field: "id", headerName: "ID", width: 200 },
  {
    field: "user",
    headerName: "Imię i nazwisko",
    width: 400,
    renderCell: (params) => {
      if (params.row.id.startsWith("gap"))
        return <div className="cellWithImg"></div>;
      return (
        <div className="cellWithImg workerNames">
          <img className="cellImg" src={params.row.img} alt="Brak" />
          {params.row.surname} {params.row.name}
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
    width: 400,
    renderCell: (params) => {
      return <div className="brigadeNames">{params.row.brigade}</div>;
    },
  },
];

export const scheduleColumns = (machines, machinesAll) => [
  {
    field: "worker",
    headerName: "Pracownik",
    width: 200,
    renderCell: (params) => {
      return renderWorker(params.row, machines, machinesAll);
    },
  },
  {
    field: "name",
    headerName: "Maszyna - forma + start",
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
      return renderStatus(params.row, machines, machinesAll);
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
];

function renderName(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;
  const connectedAdditionMachineName = currentMachine.connectionAdd;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );
  const connectedAddMachine = machinesAll.find(
    (machine) => machine.name === connectedAdditionMachineName
  );
  if (connectedMachine && connectedAddMachine) {
    return (
      <div className="small-column">
        <b style={{ color: "#0066ff" }}>{currentMachine.name} </b> -{" "}
        <b>{currentMachine.form}</b>{" "}
        {currentMachine.startTime !== "" ? (
          <> o {currentMachine.startTime} </>
        ) : (
          ""
        )}
        <br />
        <b style={{ color: "#cc9f19" }}>{connectedMachine.name}</b> -{" "}
        <b>{connectedMachine.form}</b>{" "}
        {connectedMachine.startTime !== "" ? (
          <> o {connectedMachine.startTime} </>
        ) : (
          ""
        )}
        <br />
        <b style={{ color: "#990099" }}>{connectedAddMachine.name}</b> -{" "}
        <b>{connectedAddMachine.form}</b>{" "}
        {connectedAddMachine.startTime !== "" ? (
          <> o {connectedAddMachine.startTime} </>
        ) : (
          ""
        )}
      </div>
    );
  }
  if (connectedMachine) {
    return (
      <div className="small-column">
        <b style={{ color: "#0066ff" }}>{currentMachine.name} </b> -{" "}
        <b>{currentMachine.form}</b>{" "}
        {currentMachine.startTime !== "" ? (
          <> o {currentMachine.startTime} </>
        ) : (
          ""
        )}
        <br />
        <b style={{ color: "#cc9f19" }}>{connectedMachine.name}</b> -{" "}
        <b>{connectedMachine.form}</b>{" "}
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
      <b style={{ color: "#0066ff" }}>{currentMachine.name}</b> -{" "}
      <b>{currentMachine.form}</b>{" "}
      {currentMachine.startTime !== "" ? (
        <> o {currentMachine.startTime} </>
      ) : (
        ""
      )}
    </div>
  );
}

function renderStatus(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;
  const connectedAdditionMachineName = currentMachine.connectionAdd;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );
  const connectedAddMachine = machinesAll.find(
    (machine) => machine.name === connectedAdditionMachineName
  );

  if (connectedMachine && connectedAddMachine) {
    return (
      <div className="small-column">
        {row.status === "Praca" ? (
          <div style={{ color: "#008000" }}>Praca</div>
        ) : row.status === "Rozruch" ? (
          <div style={{ color: " #ff1a1a" }}>Rozruch</div>
        ) : (
          <div style={{ color: "#ff7b00" }}>Uruch</div>
        )}
        {connectedMachine.status === "Praca" ? (
          <div style={{ color: "#008000" }}>Praca</div>
        ) : connectedMachine.status === "Rozruch" ? (
          <div style={{ color: " #ff1a1a" }}>Rozruch</div>
        ) : (
          <div style={{ color: "#ff7b00" }}>Uruch</div>
        )}
        {connectedAddMachine.status === "Praca" ? (
          <div style={{ color: "#008000" }}>Praca</div>
        ) : connectedAddMachine.status === "Rozruch" ? (
          <div style={{ color: " #ff1a1a" }}>Rozruch</div>
        ) : (
          <div style={{ color: "#ff7b00" }}>Uruch</div>
        )}
      </div>
    );
  } else if (connectedMachine) {
    return (
      <div className="small-column">
        {row.status === "Praca" ? (
          <div style={{ color: "#008000" }}>Praca</div>
        ) : row.status === "Rozruch" ? (
          <div style={{ color: " #ff1a1a" }}>Rozruch</div>
        ) : (
          <div style={{ color: "#ff7b00" }}>Uruch</div>
        )}
        {connectedMachine.status === "Praca" ? (
          <div style={{ color: "#008000" }}>Praca</div>
        ) : connectedMachine.status === "Rozruch" ? (
          <div style={{ color: " #ff1a1a" }}>Rozruch</div>
        ) : (
          <div style={{ color: "#ff7b00" }}>Uruch</div>
        )}
      </div>
    );
  } else {
    return (
      <>
        {row.status === "Praca" ? (
          <div style={{ color: "#008000" }}>Praca</div>
        ) : row.status === "Rozruch" ? (
          <div style={{ color: " #ff1a1a" }}>Rozruch</div>
        ) : (
          <div style={{ color: "#ff7b00" }}>Uruch</div>
        )}
      </>
    );
  }
}

// Funkcja do renderowania retoolingu
function renderRetooling(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;
  const connectedAdditionMachineName = currentMachine.connectionAdd;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );
  const connectedAddMachine = machinesAll.find(
    (machine) => machine.name === connectedAdditionMachineName
  );

  if (connectedMachine && connectedAddMachine) {
    return (
      <div>
        {currentMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.retooling}</b> ok.{" "}
            {currentMachine.retoolingTime}
          </>
        ) : (
          <> --</>
        )}
        <br />
        {connectedMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedMachine.retooling}</b> ok.{" "}
            {connectedMachine.retoolingTime}
          </>
        ) : (
          <>--</>
        )}
        <br />
        {connectedAddMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedAddMachine.retooling}</b>{" "}
            ok. {connectedAddMachine.retoolingTime}
          </>
        ) : (
          <>--</>
        )}
      </div>
    );
  } else if (connectedMachine) {
    return (
      <div>
        {currentMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.retooling}</b> ok.{" "}
            {currentMachine.retoolingTime}
          </>
        ) : (
          <> --</>
        )}
        <br />
        {connectedMachine.retooling !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedMachine.retooling}</b> ok.{" "}
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
          <b style={{ color: "#0066ff" }}>{currentMachine.retooling}</b> ok.{" "}
          {currentMachine.retoolingTime}
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
  const connectedAdditionMachineName = currentMachine.connectionAdd;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );
  const connectedAddMachine = machinesAll.find(
    (machine) => machine.name === connectedAdditionMachineName
  );

  if (connectedMachine && connectedAddMachine) {
    return (
      <div>
        {currentMachine.transition !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.transition}</b> ok.{" "}
            {currentMachine.transitionTime}
          </>
        ) : (
          <>--</>
        )}
        <br />
        {connectedMachine.transition !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedMachine.transition}</b>{" "}
            ok. {connectedMachine.transitionTime}
          </>
        ) : (
          <>--</>
        )}
        <br />
        {connectedAddMachine.transition !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedAddMachine.transition}</b>{" "}
            ok. {connectedAddMachine.transitionTime}
          </>
        ) : (
          <>--</>
        )}
      </div>
    );
  } else if (connectedMachine) {
    return (
      <div>
        {currentMachine.transition !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.transition}</b> ok.{" "}
            {currentMachine.transitionTime}
          </>
        ) : (
          <>--</>
        )}
        <br />
        {connectedMachine.transition !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedMachine.transition}</b>{" "}
            ok. {connectedMachine.transitionTime}
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
          <b style={{ color: "#0066ff" }}>{currentMachine.transition}</b> ok.{" "}
          {currentMachine.transitionTime}
        </>
      ) : (
        <>--</>
      )}
    </div>
  );
}

function renderWorker(row, machines, machinesAll) {
  const currentMachine = row;
  const connectedMachineName = currentMachine.connection;
  const connectedAdditionMachineName = currentMachine.connectionAdd;

  const connectedMachine = machinesAll.find(
    (machine) => machine.name === connectedMachineName
  );
  const connectedAddMachine = machinesAll.find(
    (machine) => machine.name === connectedAdditionMachineName
  );

  if (connectedMachine && connectedAddMachine) {
    if (
      connectedMachine.worker === connectedAddMachine.worker &&
      connectedMachine.worker === currentMachine.worker
    ) {
      return (
        <div>
          {currentMachine.worker !== "" ? (
            <>
              <b style={{ color: "#0066ff" }}>{currentMachine.worker}</b>
              <br />
            </>
          ) : (
            ""
          )}
        </div>
      );
    } else
      return (
        <div>
          {currentMachine.worker !== "" ? (
            <>
              <b style={{ color: "#0066ff" }}>{currentMachine.worker}</b>
              <br />
            </>
          ) : (
            ""
          )}
          {connectedMachine.worker !== "" ? (
            <>
              <b style={{ color: "#cc9f19" }}>{connectedMachine.worker}</b>
              <br />
            </>
          ) : (
            ""
          )}
          {connectedAddMachine.worker !== "" ? (
            <>
              <b style={{ color: "#990099" }}>{connectedAddMachine.worker}</b>
              <br />
            </>
          ) : (
            ""
          )}
        </div>
      );
  }
  if (connectedMachine) {
    return (
      <div>
        {currentMachine.worker !== "" ? (
          <>
            <b style={{ color: "#0066ff" }}>{currentMachine.worker}</b>
            <br />
          </>
        ) : (
          ""
        )}
        {connectedMachine.worker !== "" ? (
          <>
            <b style={{ color: "#cc9f19" }}>{connectedMachine.worker}</b>
            <br />
          </>
        ) : (
          ""
        )}
      </div>
    );
  }
  return (
    <div>
      {currentMachine.worker !== "" ? (
        <>
          <b style={{ color: "#0066ff" }}>{currentMachine.worker}</b>
          <br />
        </>
      ) : (
        ""
      )}
    </div>
  );
}
