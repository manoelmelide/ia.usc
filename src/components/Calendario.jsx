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

  useEffect(() => {
    fetch('/calendario.json')
      .then(r => r.json())
      .then(data => {
        const parsed = data.map(ev => ({
          ...ev,
          start: ev.allDay ? new Date(ev.start) : new Date(ev.start),
          end: ev.allDay ? new Date(ev.end) : new Date(ev.end)
        }));
        setEvents(parsed);
      });
  }, []);

  return (
    <div>
      <h2>Calendario Académico</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        defaultView="week"
        views={['week', 'agenda']}
        style={{ height: 600 }}
      />
    </div>
  );
}
