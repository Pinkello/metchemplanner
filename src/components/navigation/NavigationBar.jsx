import React, { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import { getAuth, signOut } from "firebase/auth";
import Button from "react-bootstrap/Button";
import "./navigationBar.scss";
import { AuthContext } from "../../context/AuthContext";

const NavigationBar = () => {
  const auth = getAuth();
  const { dispatch } = useContext(AuthContext);

  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        bg="dark"
        variant="dark"
        className="example-navbar print-hide"
      >
        <Container className="print-hide">
          <Navbar.Brand className="navbar-header" href="/">
            Metchem Planner
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav" className="example-bg">
            <Nav className="me-auto">
              <Nav.Link className="navbar-link" href="/">
                Widok hali
              </Nav.Link>
              <Nav.Link className="navbar-link" href="../schedule">
                Grafik
              </Nav.Link>
              <Nav.Link className="navbar-link" href="../workers">
                Pracownicy
              </Nav.Link>
              <Nav.Link className="navbar-link" href="../machines">
                Maszyny
              </Nav.Link>
              <Nav.Link className="navbar-link" href="../services">
                Montaże
              </Nav.Link>
              <Nav.Link className="navbar-link" href="../notes">
                Uwagi
              </Nav.Link>
            </Nav>
            <Nav>
              <Button
                onClick={() => {
                  signOut(auth)
                    .then(() => {
                      // Sign-out successful.
                      dispatch({ type: "LOGOUT" });
                    })
                    .catch((error) => {
                      // An error happened.
                      console.log(error);
                    });
                }}
                variant="outline-light"
                className="navbar-logout"
              >
                Wyloguj
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavigationBar;
