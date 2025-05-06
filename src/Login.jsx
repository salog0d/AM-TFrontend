import React, { useState } from "react";
import axios from "axios";
import logo from "./assets/SHIELD_logo.jpg";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/custom_auth/login/", {
        username,
  /**
   * Función que maneja el inicio de sesión.
   * @returns {Promise<void>}
   */
        password,
      }, {
        withCredentials: true, // importante si usas cookies/sesiones
      });
      console.log("Login exitoso:", response.data);
      // Redirige o guarda la sesión aquí si es necesario
    } catch (err) {
      console.error("Error en login:", err);
      setError("No se pudo conectar con el servidor o las credenciales son incorrectas");
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logo} alt="SHIELD Logo" className="logo-image" />
      </div>

      <div className="login-box">
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Iniciar Sesión</button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="circle circle-purple"></div>
      <div className="circle circle-blue circle-top"></div>
      <div className="circle circle-blue circle-bottom"></div>
    </div>
  );
}

export default Login;
