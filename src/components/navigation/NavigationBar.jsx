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
          <Navbar.Brand href="/">Metchem Planner</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav" className="example-bg">
            <Nav className="me-auto">
              <Nav.Link href="/">Widok hali</Nav.Link>
              <Nav.Link href="../schedule">Grafik</Nav.Link>
              <Nav.Link href="../workers">Pracownicy</Nav.Link>
              <Nav.Link href="../machines">Maszyny</Nav.Link>
              <Nav.Link href="../services">Usługi</Nav.Link>
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
