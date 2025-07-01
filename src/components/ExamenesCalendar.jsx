import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import Papa from 'papaparse';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse: parseISO, startOfWeek: () => new Date(), getDay, locales });

export default function ExamenesCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Papa.parse('/examenes.csv', {
      header: true,
      download: true,
      complete: ({ data }) => {
        const evs = data.map(r => {
          const [startH,endH] = r.Hora.split('-');
          return {
            title: `${r.Asignatura} (${r.Aula})`,
            start: new Date(`${r.Dia}T${startH}`),
            end:   new Date(`${r.Dia}T${endH}`),
          };
        });
        setEvents(evs);
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
        style={{ height: 600, margin: '50px' }}
      />
    </div>
  );
}
