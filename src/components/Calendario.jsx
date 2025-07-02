// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { parseISO, format, startOfWeek, getDay, isWithinInterval } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css';

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es }
});

const CustomEvent = ({ event, title, slotInfo }) => {
  // Determinar si hay eventos superpuestos
  const hasOverlap = slotInfo?.events.some(e => 
    e !== event && 
    isWithinInterval(event.start, { start: e.start, end: e.end }) ||
    isWithinInterval(event.end, { start: e.start, end: e.end }) ||
    isWithinInterval(e.start, { start: event.start, end: event.end })
  );

  // Formato simplificado para eventos superpuestos
  const simplifiedTitle = hasOverlap 
    ? `${title} (${event.aula})`
    : event.grupo === 'todos' 
      ? `${title} (${event.aula})`
      : `${title} - ${event.grupo} (${event.aula})`;

  return (
    <div className={`rbc-event-content ${hasOverlap ? 'overlap-event' : ''}`}>
      <div>{simplifiedTitle}</div>
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
    if (view === 'month') {
      return events;
    }
    return events.filter(event => {
      if (event.allDay) return true;
      
      const eventEndHour = event.end.getHours() + event.end.getMinutes() / 60;
      const eventStartHour = event.start.getHours() + event.start.getMinutes() / 60;
      return eventEndHour > 9 && eventStartHour < 21;
    });
  }, [events, view]);

  const minTime = useMemo(() => new Date(0, 0, 0, 9, 0, 0), []);
  const maxTime = useMemo(() => new Date(0, 0, 0, 21, 0, 0), []);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let color = 'black';
    
    if (event.tipo === 'clase') {
      if (event.grupo === 'G1') {
        backgroundColor = '#FFD700';
      } else if (event.grupo === 'G2') {
        backgroundColor = '#32CD32';
      }
    } 
    else if (event.tipo === 'entrega') {
      if (event.grupo === 'todos') {
        backgroundColor = '#FFDAB9';
      } else if (event.grupo === 'G1') {
        backgroundColor = '#FFFACD';
      } else if (event.grupo === 'G2') {
        backgroundColor = '#90EE90';
      }
    } 
    else if (event.tipo === 'examen') {
      backgroundColor = '#FF6B6B';
      color = 'white';
    }
    
    return {
      style: {
        backgroundColor,
        color,
        borderRadius: '3px',
        border: 'none',
        width: '100%'
      }
    };
  };

  // Función para manejar eventos superpuestos
  const slotPropGetter = (date) => {
    return {
      className: 'time-slot'
    };
  };

  // Componente personalizado para contenedor de eventos
  const EventWrapper = ({ event, children, slotInfo }) => {
    return React.cloneElement(React.Children.only(children), {
      slotInfo: { ...slotInfo, event }
    });
  };

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
        doShowMoreDrillDown={false}
        popup={false}
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
        
        components={{
          event: CustomEvent,
          timeSlotWrapper: EventWrapper
        }}
        
        eventPropGetter={eventStyleGetter}
        slotPropGetter={slotPropGetter}
        
        style={{ height: view === 'month' ? 'auto' : 600 }}
      />
    </div>
  );
}
