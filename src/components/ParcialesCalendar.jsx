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

export default function ParcialesCalendar() {
  const [events, setEvents] = useState([]);
  const [group, setGroup] = useState('Todos');

  useEffect(() => {
    Papa.parse('/parciales.csv', {
      header: true,
      download: true,
      complete: ({ data }) => {
        const evs = data
          .filter(r => group==='Todos' || r.GrupoPracticas===group)
          .map(r => {
            const [startH,endH] = r.Hora.split('-');
            const date = r.Dia;
            return {
              title: `${r.Asignatura} (${r.Aula})`,
              start: new Date(`${date}T${startH}`),
              end:   new Date(`${date}T${endH}`),
            };
          });
        setEvents(evs);
      }
    });
  }, [group]);

  return (
    <div>
      <h2>Test Parciales</h2>
      <select value={group} onChange={e=>setGroup(e.target.value)}>
        {['Todos', ...new Set(events.map(e=>e.GrupoPracticas))].map(g=>
          <option key={g} value={g}>{g}</option>
        )}
      </select>
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
