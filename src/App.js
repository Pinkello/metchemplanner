import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import MachinesList from "./pages/machinesList/MachinesList";
import WorkersList from "./pages/workers_list/WorkersList";
import ServicesList from "./pages/servicesList/ServicesList.jsx";
import SchedulesList from "./pages/schedulesList/SchedulesList.jsx";
import Single from "./pages/single/Single";
import New from "./pages/new/NewMachine";
import NewWorker from "./pages/new_worker/NewWorker";
import NewService from "./pages/newService/NewService";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { workerInputs, machineInputs, serviceInputs } from "./formSource";
import "./style/dark.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route
              index
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route path="machines">
              <Route
                index
                element={
                  <RequireAuth>
                    <MachinesList />
                  </RequireAuth>
                }
              />
              <Route
                path=":machineId"
                element={
                  <RequireAuth>
                    <Single />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <New inputs={machineInputs} title="Dodaj nową maszynę" />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="workers">
              <Route
                index
                element={
                  <RequireAuth>
                    <WorkersList />
                  </RequireAuth>
                }
              />
              <Route
                path=":productId"
                element={
                  <RequireAuth>
                    <Single />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <NewWorker
                      inputs={workerInputs}
                      title="Dodaj nowego pracownika"
                    />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="services">
              <Route
                index
                element={
                  <RequireAuth>
                    <ServicesList />
                  </RequireAuth>
                }
              />
              <Route
                path=":serviceId"
                element={
                  <RequireAuth>
                    <Single />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <NewService
                      inputs={serviceInputs}
                      title="Dodaj nową obsługę"
                    />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="schedule">
              <Route
                index
                element={
                  <RequireAuth>
                    <SchedulesList />
                  </RequireAuth>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
