// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css';

const localizer = dateFnsLocalizer({
  format, parse: parseISO, startOfWeek, getDay, locales: { es }
});

// Componente de evento personalizado (igual que antes)
const CustomEvent = ({ event, title }) => {
  const formattedTitle = `${title} (${event.aula})`;
  return (
    <div className="rbc-event-content">
      <div>{formattedTitle}</div>
      {!event.allDay && (
        <div className="event-time-display">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
      )}
    </div>
  );
};

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

  const visibleEvents = useMemo(() => {
    if (view === 'month') return events;
    return events.filter(ev => ev.allDay || (
      ev.end.getHours() + ev.end.getMinutes()/60 > 9 &&
      ev.start.getHours() + ev.start.getMinutes()/60 < 21
    ));
  }, [events, view]);

  const minTime = useMemo(() => new Date(0,0,0,9,0), []);
  const maxTime = useMemo(() => new Date(0,0,0,21,0), []);

  // Estilo dinámico (igual que antes)
  const eventStyleGetter = useCallback(event => {
    // …tu lógica de colores y posicionamiento…
    return { style: { /* estilos */ } };
  }, []);

  return (
    <div>
      <h2>Calendario Académico</h2>
      <Calendar
        localizer={localizer}
        events={visibleEvents}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        showAllEvents
        popup={false}
        className="mi-calendario-sin-scroll"

        defaultView="week"
        views={['month','week','agenda']}
        onView={setView}

        min={minTime}
        max={maxTime}

        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) =>
            `${format(start,'HH:mm')} - ${format(end,'HH:mm')}`,
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }) =>
            `${format(start,'HH:mm')} - ${format(end,'HH:mm')}`,
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start,'dd/MM')} – ${format(end,'dd/MM')}`
        }}

        // --- Aquí el cambio principal ---
        dayLayoutAlgorithm="no-overlap"

        components={{ event: CustomEvent }}
        eventPropGetter={eventStyleGetter}
        style={{ height: view==='month' ? 'auto' : 600 }}
      />
    </div>
  );
}
