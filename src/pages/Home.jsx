// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Calendario from '../components/Calendario';

export default function Home() {
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/courses.json')
      .then(res => res.json())
      .then(data => setCourses(data));

    fetch('/deliverables.json')
      .then(res => res.json())
      .then(data => setDeliverables(data));
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

  const now = new Date();

  // Helper para calcular la fecha de fin real de un deliverable
  function getEndDate(d) {
    if (!d.allDay) {
      // usa su campo end si existe
      return new Date(d.end || d.start);
    } else {
      // si tiene deadline, fecha+hora, si no, fin de día
      if (d.deadline) {
        return new Date(`${d.fecha}T${d.deadline}`);
      } else {
        const dt = new Date(d.fecha);
        dt.setHours(23, 59, 59);
        return dt;
      }
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Grao en Intelixencia Artificial – USC</h1>

      <form className="login-form" onSubmit={handleLogin}>
        <span className="login-label">Acceso área de edición</span>
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
        {courses.map(course => {
          // filtrar deliverables activas para este curso
          const active = deliverables
            .filter(d => d.courseId === course.id)
            .filter(d => getEndDate(d) >= now);

          return (
            <div key={course.id} className="course-with-activities">
              <div
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

              {active.length > 0 && (
                <ul className="course-activities">
                  {active.map(d => {
                    const endDate = getEndDate(d);
                    const timeLabel = !d.allDay
                      ? format(endDate, 'HH:mm')
                      : 'Todo el día';
                    return (
                      <li key={`${course.id}-${d.id}`}>
                        <span className="activity-title">{d.title}</span>
                        <span className="activity-time">{timeLabel}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="course-detail">
          <h2>{selectedCourse.title}</h2>
          <p><strong>Créditos:</strong> {selectedCourse.credits}</p>
          <p>
            <strong>Ponderaciones:</strong>{' '}
            {Object.entries(selectedCourse.ponderaciones)
              .map(([k,v])=>`${k}: ${v}%`)
              .join(', ')}
          </p>
          <p>
            <strong>Sistema de evaluación:</strong>{' '}
            {selectedCourse.sistema_evaluacion}
          </p>
          <p>
            <strong>Clases obligatorias:</strong>{' '}
            {selectedCourse.clases.practicas ? 'Prácticas' : ''}
            {selectedCourse.clases.practicas && selectedCourse.clases.teoricas ? ', ' : ''}
            {selectedCourse.clases.teoricas ? 'Teóricas' : ''}
          </p>
          <button onClick={()=>setSelectedCourse(null)}>Cerrar</button>
        </div>
      )}

      <Calendario />
    </div>
  );
}
