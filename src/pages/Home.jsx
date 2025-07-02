/* src/pages/Home.jsx */
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Grao en Intelixencia Artificial – USC</h1>
      <Link to="/gestion">Acceder a Gestión</Link>
    </div>
  );
}
