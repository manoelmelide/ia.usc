import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format, parse: (str, fmt) => parse(str, fmt, new Date()),
  startOfWeek, getDay, locales: { 'es': es }
});

export default function ExamenesCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Papa.parse('/examenes.csv', {
      header: true, download: true,
      complete: ({ data }) => {
        const ev = data.map(r => {
          const [s,e] = r.Hora.split('-');
          return {
            title: `${r.Asignatura} (${r.Aula})`,
            start: new Date(`${r.Dia}T${s}`),
            end:   new Date(`${r.Dia}T${e}`)
          };
        });
        setEvents(ev);
      }
    });
  }, []);

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
