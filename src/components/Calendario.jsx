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

// Componente personalizado para eventos
const CustomEvent = ({ event, title }) => {
  const [showTime, setShowTime] = useState(false);
  
  // Determinar si mostrar la hora (solo para eventos que no son de todo el día)
  const shouldShowTime = !event.allDay && showTime;
  
  return (
    <div 
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
      onClick={() => setShowTime(!showTime)}
    >
      <div>{title}</div>
      {shouldShowTime && (
        <div style={{ fontSize: '0.8em', marginTop: '2px' }}>
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
    if (view === 'month') {
      return events;
    }
    return events.filter(event => {
      const eventEndHour = event.end.getHours() + event.end.getMinutes() / 60;
      const eventStartHour = event.start.getHours() + event.start.getMinutes() / 60;
      return eventEndHour > 9 && eventStartHour < 21;
    });
  }, [events, view]);

  const minTime = useMemo(() => new Date(0, 0, 0, 9, 0, 0), []);
  const maxTime = useMemo(() => new Date(0, 0, 0, 21, 0, 0), []);

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
        className="mi-calendario-sin-scroll"
        
        defaultView="week"
        views={['month', 'week', 'agenda']}
        onView={setView}
        
        min={minTime}
        max={maxTime}
        
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
        
        // Agregar componente personalizado para eventos
        components={{
          event: CustomEvent
        }}
        
        style={{ height: 600 }}
      />
    </div>
  );
}
