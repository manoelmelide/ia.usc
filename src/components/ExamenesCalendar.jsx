// ExamenesCalendar.jsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse as parseDate } from 'date-fns';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse: (value, formatStr) => parseDate(value, formatStr, new Date()),
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
        const ev = data.map(r => {
          const [s, e] = r.Hora.split('-');
          const day = parseDate(r.Dia, 'dd-MM-yyyy', new Date());
          const start = new Date(day);
          start.setHours(+s.split(':')[0], +s.split(':')[1]);
          const end = new Date(day);
          end.setHours(+e.split(':')[0], +e.split(':')[1]);
          return {
            title: `${r.Asignatura} (${r.Aula})`,
            start,
            end
          };
        });
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
