import React from 'react';
import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./login.scss";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { dispatch } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        dispatch({ type: "LOGIN", payload: user });
        navigate("/");
      })
      .catch((error) => {
        setError(true);
        console.log(error);
      });
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Metchem Planner</span>
        <span className="title">Login</span>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="css-button-shadow-border-sliding--sky"
            type="submit"
          >
            Login
          </button>
          {error && <span>Wrong email or password</span>}
        </form>
      </div>
    </div>
  );
};

export default Login;
