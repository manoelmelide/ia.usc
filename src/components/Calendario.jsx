// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo } from 'react';
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
  const formattedTitle = event.grupo === 'todos'
    ? `${title} (${event.aula})`
    : `${title} ${event.grupo} (${event.aula})`;

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
    return events.filter(ev => {
      if (ev.allDay) return true;
      const endH = ev.end.getHours() + ev.end.getMinutes()/60;
      const startH = ev.start.getHours() + ev.start.getMinutes()/60;
      return endH > 9 && startH < 21;
    });
  }, [events, view]);

  const minTime = useMemo(() => new Date(0,0,0,9,0,0), []);
  const maxTime = useMemo(() => new Date(0,0,0,21,0,0), []);

  const eventStyleGetter = event => {
    let bg = '#3174ad', color = 'black';
    if (event.tipo === 'clase') {
      if (event.grupo === 'G1') bg = '#FFD700';
      else if (event.grupo === 'G2') bg = '#32CD32';
    } else if (event.tipo === 'entrega') {
      if (event.grupo === 'todos') bg = '#FFDAB9';
      else if (event.grupo === 'G1') bg = '#FFFACD';
      else if (event.grupo === 'G2') bg = '#90EE90';
    } else if (event.tipo === 'examen') {
      bg = '#FF6B6B'; color = 'white';
    }
    return {
      style: {
        backgroundColor: bg,
        color,
        borderRadius: '3px',
        border: 'none'
        // <-- quitamos width para que el algoritmo de no-overlap calcule correctamente
      }
    };
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
            `${format(start,'dd/MM')} – ${format(end,'dd/MM')}`,
        }}

        // *** NUEVA PROPIEDAD PARA DIVIDIR EL ANCHO EN SOLAPAMIENTOS ***
        dayLayoutAlgorithm="no-overlap"

        components={{ event: CustomEvent }}
        eventPropGetter={eventStyleGetter}

        // Altura fija para no estirar en exceso
        style={{ height: view==='month' ? 'auto' : 600 }}
      />
    </div>
  );
}
