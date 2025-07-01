// src/components/Calendario.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es }
});

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [view, setView]     = useState('week');

  useEffect(() => {
    fetch('/calendario.json')
      .then(r => r.json())
      .then(data => {
        const parsed = data.map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end:   new Date(ev.end)
        }));
        setEvents(parsed);
      });
  }, []);

  const visibleEvents = view === 'month'
    ? events.filter(ev => ev.type !== 'clase')
    : events;

  return (
    <div>
      <h2>Calendario Académico</h2>
      <Calendar
        localizer={localizer}
        events={visibleEvents}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"

        defaultView="week"
        views={['month','week','agenda']}
        onView={v => setView(v)}

        //-- horario entre 9 y 20
        min={new Date(1970, 1, 1, 9, 0)}
        max={new Date(1970, 1, 1, 20, 0)}

        //-- formatos 24h
        formats={{
          timeGutterFormat: 'HH:mm',
          hourFormat: 'HH:mm',
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, 'dd/MM')} – ${format(end, 'dd/MM')}`,
        }}

        style={{ height: 600 }}
      />
    </div>
  );
}
