/* Login.jsx */
import React from 'react';
import './Login.css';

export default function Login({ netlifyIdentity }) {
  const handleLogin = () => netlifyIdentity.open('login');
  return (
    <div className="login-page">
      <h2>Acceso a Gestión</h2>
      <button onClick={handleLogin}>Iniciar sesión</button>
    </div>
  );
}
