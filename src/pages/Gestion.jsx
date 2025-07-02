/* src/Gestion.jsx */
import React from 'react';

export default function Gestion({ user }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Zona de Gestión</h2>
      <p>Bienvenido, {user.user_metadata.full_name || user.email}</p>
      {/* Aquí pones tu interfaz de gestión */}
    </div>
  );
}
