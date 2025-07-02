// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css';

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es }
});

const CustomEvent = ({ event, title }) => {
  const formattedTitle = ${title} (${event.aula});
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
        setEvents(data.map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end)
        })));
      });
  }, []);

  const visibleEvents = useMemo(() => {
    if (view === 'month') return events;
    return events.filter(ev =>
      ev.allDay ||
      (ev.end.getHours() + ev.end.getMinutes()/60 > 9 &&
       ev.start.getHours() + ev.start.getMinutes()/60 < 21)
    );
  }, [events, view]);

  const minTime = useMemo(() => new Date(0,0,0,9,0), []);
  const maxTime = useMemo(() => new Date(0,0,0,21,0), []);

  const eventStyleGetter = useCallback((event, start, end, isSelected) => {
    let backgroundColor = '#3174ad';
    let color = 'black';
    let width = '100%';
    let left = '0';

    if (event.tipo === 'clase') {
      if (event.grupo === 'G1') {
        backgroundColor = '#FFD700';
        width = 'calc(50% - 1px)';
        left = '0';
      } else if (event.grupo === 'G2') {
        backgroundColor = '#32CD32';
        width = 'calc(50% - 1px)';
        left = 'calc(50% + 1px)';
      }
    } else if (event.tipo === 'entrega') {
      if (event.grupo === 'todos') {
        backgroundColor = '#FFDAB9';
      } else if (event.grupo === 'G1') {
        backgroundColor = '#FFFACD';
        width = 'calc(50% - 1px)';
        left = '0';
      } else if (event.grupo === 'G2') {
        backgroundColor = '#90EE90';
        width = 'calc(50% - 1px)';
        left = 'calc(50% + 1px)';
      }
    } else if (event.tipo === 'examen') {
      backgroundColor = '#FF6B6B';
      color = 'white';
    }

    return {
      style: {
        backgroundColor,
        color,
        borderRadius: '3px',
        border: 'none',
        boxSizing: 'border-box',
        width,
        left,
        position: 'absolute',
        zIndex: isSelected ? 2 : 1,
        overflow: 'hidden'
      }
    };
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
            ${format(start,'HH:mm')} - ${format(end,'HH:mm')},
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }) =>
            ${format(start,'HH:mm')} - ${format(end,'HH:mm')},
          dayRangeHeaderFormat: ({ start, end }) =>
            ${format(start,'dd/MM')} – ${format(end,'dd/MM')}
        }}
        components={{ event: CustomEvent }}
        eventPropGetter={eventStyleGetter}
        style={{ height: view==='month'? 'auto' : 600 }}
      />
    </div>
  );
}
