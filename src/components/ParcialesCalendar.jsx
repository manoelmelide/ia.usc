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
  format, parse: (str, fmt) => parse(str, fmt, new Date()), startOfWeek, getDay,
  locales: { 'es': es }
});

export default function ParcialesCalendar() {
  const [events, setEvents] = useState([]);
  const [group, setGroup] = useState('Todos');

  useEffect(() => {
    Papa.parse('/parciales.csv', {
      header: true, download: true,
      complete: ({ data }) => {
        const ev = data
          .filter(r=> r.GrupoPracticas && (group==='Todos'||r.GrupoPracticas===group))
          .map(r => {
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
  }, [group]);

  return (
    <div>
      <h2>Parciales</h2>
      <select value={group} onChange={e=>setGroup(e.target.value)}>
        {['Todos', ...Array.from(new Set(events.map(ev=>ev.title.split(' ')[0])))]  /* opcional */}
        {['Todos', 'A', 'B'].map(g=><option key={g}>{g}</option>)}
      </select>
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
