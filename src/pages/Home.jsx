// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';              // ← IMPORT NECESARIO
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

  const handleLogin = async e => { /* ...igual... */ };

  const now = new Date();

  function getEndDate(d) {
    if (!d.allDay) {
      return new Date(d.end || d.start);
    } else {
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

      {/* formulario de login  */}

      <div className="courses-grid">
        {courses.map(course => {
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
                  {active.map((d, idx) => {
                    const endDate = getEndDate(d);
                    const timeLabel = !d.allDay
                      ? format(endDate, 'HH:mm')
                      : 'Todo el día';
                    return (
                      <li key={`${course.id}-${idx}`}>
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

      {/* detalle del curso seleccionado y Calendario */}
    </div>
  );
}
