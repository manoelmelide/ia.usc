// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo } from 'react';
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
  const [view, setView] = useState('week');

  useEffect(() => {
    fetch('/calendario.json')
      .then(r => r.json())
      .then(data => {
        const parsed = data.map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end)
        }));
        setEvents(parsed);
      });
  }, []);

  // Filtrar eventos para todas las vistas
  const visibleEvents = useMemo(() => {
    if (view === 'month') {
      return events;  // Mostrar todos los eventos, sin filtrar por tipo
    }
    // Para otras vistas, mantiene el filtro que tenías
    return events.filter(event => {
      const eventEndHour = event.end.getHours() + event.end.getMinutes() / 60;
      const eventStartHour = event.start.getHours() + event.start.getMinutes() / 60;
      return eventEndHour > 9 && eventStartHour < 21;
    });
  }, [events, view]);


  // Horas fijas para min/max (sin fecha actual)
  const minTime = useMemo(() => new Date(0, 0, 0, 9, 0, 0), []);  // 9:00 fijo
  const maxTime = useMemo(() => new Date(0, 0, 0, 21, 0, 0), []); // 21:00 fijo

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
        onView={setView}
        
        // Rango horario fijo (9:00 - 21:00)
        min={minTime}
        max={maxTime}
        
        // Formato 24h consistente
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => 
            `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }) => 
            `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, 'dd/MM')} – ${format(end, 'dd/MM')}`,
        }}
        
        style={{ height: 600 }}
      />
    </div>
  );
}
