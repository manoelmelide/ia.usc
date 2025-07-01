// src/components/ExamenesCalendar.jsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse: (value) => new Date(value),
  startOfWeek,
  getDay,
  locales: { es }
});

export default function ExamenesCalendar() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    // 1) Prueba con fetch directa para ver si el CSV baja bien
    fetch('/examenes.csv')
      .then(r => {
        console.log('fetch /examenes.csv status:', r.status);
        return r.text();
      })
      .then(text => {
        console.log('contenido CSV:\n', text);
      });

    // 2) Luego Papa.parse
    Papa.parse('/examenes.csv', {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        console.log('Papa.parse rows:', data);
        const ev = data
          .filter(r => r.Dia && r.Hora)
          .map(r => {
            const [startH, endH] = r.Hora.split('-');
            const day = new Date(r.Dia); 
            const start = new Date(day);
            const [sh, sm] = startH.split(':').map(Number);
            start.setHours(sh, sm);
            const end = new Date(day);
            const [eh, em] = endH.split(':').map(Number);
            end.setHours(eh, em);
            return { title: `${r.Asignatura} (${r.Aula})`, start, end };
          });
        console.log('parsed events:', ev);
        setEvents(ev);
      },
      error: err => {
        console.error('Error cargando examenes.csv', err);
        setEvents([]);
      }
    });
  }, []);

  if (events === null) return <p>Cargando exámenes…</p>;
  if (events.length === 0) return <p>No hay exámenes programados.</p>;

  return (
    <div>
      <h2>Exámenes Finales</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '20px 0' }}
      />
    </div>
  );
}
