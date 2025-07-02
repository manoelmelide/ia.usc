/* src/pages/Home.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendario from '../components/Calendario';
import './Home.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/courses.json')
      .then(res => res.json())
      .then(setCourses);
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    // validación básica (puedes ampliar)
    if (user && pass) navigate('/gestion');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Grao en Intelixencia Artificial – USC</h1>

      {/* Formulario de acceso */}
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={e => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>

      {/* Recuadros de asignaturas */}
      <div className="courses-grid">
        {courses.map(c => (
          <div
            key={c.id}
            className="course-card"
            onClick={() => setSelected(c)}
          >
            {c.title}
          </div>
        ))}
      </div>

      {/* Información ampliada */}
      {selected && (
        <div className="course-detail">
          <h2>{selected.title}</h2>
          <p>Créditos: {selected.credits}</p>
          <p>Ponderaciones: {JSON.stringify(selected.ponderaciones)}</p>
          <p>Sistema de evaluación: {selected.sistema_evaluacion}</p>
          <p>
            Clases: {selected.clases.teoricas ? 'Teóricas ' : ''}{' '}
            {selected.clases.practicas ? 'Prácticas' : ''}
          </p>
          <button onClick={() => setSelected(null)}>Cerrar</button>
        </div>
      )}

      {/* Calendario */}
      <Calendario />
    </div>
  );
}
