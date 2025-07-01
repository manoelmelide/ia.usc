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
  parse: (value, formatStr) => new Date(value), // basta con new Date(ISO)
  startOfWeek,
  getDay,
  locales: { es }
});

export default function ExamenesCalendar() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    Papa.parse('/examenes.csv', {
      header: true,
      download: true,
      complete: ({ data }) => {
        console.log('raw examenes.csv rows:', data);
        const ev = data
          .filter(r => r.Dia && r.Hora)     // filtra filas inválidas
          .map(r => {
            const [startH, endH] = r.Hora.split('-');
            const day = new Date(r.Dia);     // ISO -> Date
            const start = new Date(day);
            start.setHours(+startH.split(':')[0], +startH.split(':')[1]);
            const end = new Date(day);
            end.setHours(+endH.split(':')[0], +endH.split(':')[1]);
            return {
              title: `${r.Asignatura} (${r.Aula})`,
              start,
              end
            };
          });
        console.log('parsed exam events:', ev);
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
