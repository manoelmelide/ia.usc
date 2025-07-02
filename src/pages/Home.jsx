// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Calendario from '../components/Calendario';

export default function Home() {
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carga las asignaturas desde el JSON
    fetch('/courses.json')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/.netlify/functions/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const { ok } = await res.json();
      if (ok) navigate('/gestion');
      else alert('Contraseña incorrecta');
    } catch {
      alert('Error de conexión');
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <h1>Grao en Intelixencia Artificial – USC</h1>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      <div className="courses-grid">
        {courses.map(course => (
          <div
            key={course.id}
            className="course-card"
            onClick={() =>
              setSelectedCourse(
                selectedCourse && selectedCourse.id === course.id
                  ? null
                  : course
              )
            }
          >
            {course.title}
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="course-detail">
          <h2>{selectedCourse.title}</h2>
          <p><strong>Créditos:</strong> {selectedCourse.credits}</p>
          <p><strong>Ponderaciones:</strong> {selectedCourse.weights}</p>
          <p><strong>Sistema de evaluación:</strong> {selectedCourse.evaluation}</p>
          <p>
            <strong>Clases obligatorias:</strong>{' '}
            {selectedCourse.practicas ? 'Prácticas, ' : ''}
            {selectedCourse.expositivas ? 'Expositivas' : ''}
          </p>
          <button onClick={() => setSelectedCourse(null)}>Cerrar</button>
        </div>
      )}

      <Calendario />
    </div>
  );
}
