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

export const scheduleColumns = [
  { field: "name", headerName: "Nazwa", width: 150 },
  { field: "connection", headerName: "Połączenie", width: 150 },
  { field: "form", headerName: "Forma", width: 150 },
  { field: "retooling", headerName: "Przezbrojenie na", width: 150 },
  { field: "retoolingTime", headerName: "Przezbrojenie o", width: 150 },
  { field: "numberOfPeople", headerName: "Osoby", width: 100 },

  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return <div className={`${params.row.status}`}>{params.row.status}</div>;
    },
  },
];
