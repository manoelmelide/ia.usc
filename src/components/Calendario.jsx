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

  // Define rango horario fijo (9:00 - 21:00) con minutos y segundos a 0
  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(21, 0, 0, 0);

  // Filtrar eventos visibles según vista y rango horario
  const visibleEvents = React.useMemo(() => {
    if (view === 'month') {
      return events.filter(ev => ev.type !== 'clase');
    }
    // Para vistas semana y agenda, filtrar eventos que toquen el rango 9-21
    return events.filter(event => 
      event.end > minTime && event.start < maxTime
    );
  }, [events, view, minTime, maxTime]);

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
        min={minTime}
        max={maxTime}
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
