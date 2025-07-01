// src/components/Calendario.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { parseISO, format, startOfWeek, getDay, setHours } from 'date-fns';
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
  const visibleEvents = React.useMemo(() => {
    if (view === 'month') {
      return events.filter(ev => ev.type !== 'clase');
    }
    // Filtrar eventos que empiezan/terminan dentro del rango visible
    return events.filter(event => {
      const eventEndHour = event.end.getHours();
      const eventStartHour = event.start.getHours();
      // Mantener eventos que solapen con el rango 9-20
      return eventEndHour > 9 && eventStartHour < 21;
    });
  }, [events, view]);

  // Horas fijas para min/max (formato 24h)
  const minTime = setHours(new Date(), 9); // 9:00
  const maxTime = setHours(new Date(), 21); // 20:00

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
        
        // Rango horario visible (9:00 - 20:00)
        min={minTime}
        max={maxTime}
        
        // Formato 24h para todos los elementos
        formats={{
          timeGutterFormat: 'HH:mm', // Barra lateral
          eventTimeRangeFormat: ({ start, end }) => 
            `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`, // Eventos
          agendaTimeFormat: 'HH:mm', // Vista agenda
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
