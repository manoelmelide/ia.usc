// src/pages/Gestion.jsx
import React, { useState } from 'react';
import GestionCreate from '../components/GestionCreate';
import GestionEdit from '../components/GestionEdit';

export default function Gestion() {
  // Estado para alternar entre crear y editar
  const [mode, setMode] = useState('create'); // 'create' o 'edit'

  return (
    <div style={{ padding: 20 }}>
      <h1>Área de Gestión</h1>
      {/* Botones para cambiar de modo */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setMode('create')}
          style={{
            marginRight: 10,
            backgroundColor: mode === 'create' ? '#007bff' : '#ccc',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Crear
        </button>
        <button
          onClick={() => setMode('edit')}
          style={{
            backgroundColor: mode === 'edit' ? '#007bff' : '#ccc',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Editar
        </button>
      </div>

      {/* Sección dinámica según el modo */}
      <div>
        {mode === 'create' && <GestionCreate />}
        {mode === 'edit' && <GestionEdit />}
      </div>
    </div>
  );
}
