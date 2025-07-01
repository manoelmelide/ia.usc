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

  // Si estamos en vista 'month', filtramos las clases
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
        views={['month', 'week', 'agenda']}
        onView={v => setView(v)}
        style={{ height: 600 }}
      />
    </div>
  );
}
