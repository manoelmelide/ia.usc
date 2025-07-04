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

const CustomEvent = ({ event, title, view }) => {
  if (view === 'week') {
    return (
      <div className="rbc-event-content">
        {!event.allDay && (
          <div className="event-time-display">
            {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
          </div>
        )}
        <div className="event-title">{title}</div>
        {event.grupo !== 'todos' && (
          <div className="event-group">{event.grupo}</div>
        )}
        <div className="event-aula">{event.aula}</div>
      </div>
    );
  }
  const formatted = event.grupo === 'todos'
    ? `${title} (${event.aula})`
    : `${title} – ${event.grupo} (${event.aula})`;
  return (
    <div className="rbc-event-content">
      <div>{formatted}</div>
      {!event.allDay && (
        <div className="event-time-display">
          {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
        </div>
      )}
    </div>
  );
};

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');

  useEffect(() => {
    Promise.all([
      fetch('/schedule.json').then(r => r.json()),
      fetch('/deliverables.json').then(r => r.json())
    ]).then(([schedule, deliverables]) => {
      const parsedSchedule = schedule.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end:   new Date(ev.end)
      }));

      const parsedDeliverables = deliverables.map(ev => {
        let start, end;
        if (ev.start && ev.end) {
          start = new Date(ev.start);
          end   = new Date(ev.end);
        } else {
          const date = ev.date;
          if (ev.allDay) {
            start = new Date(date);
            end   = new Date(date);
          } else if (ev.deadline) {
            const ts = `${date}T${ev.deadline}`;
            start = new Date(ts);
            end   = new Date(ts);
          } else {
            start = new Date(date);
            end   = new Date(date);
          }
        }
        return {
          ...ev,
          start,
          end,
          tipo: ev.tipo || 'entrega',
          grupo: ev.grupo || 'todos',
          aula: ev.aula || ''
        };
      });

      setEvents([...parsedSchedule, ...parsedDeliverables]);
    });
  }, []);

  const visibleEvents = useMemo(() => {
    if (view === 'month') return events;
    return events.filter(ev => {
      if (ev.allDay) return true;
      const eH = ev.end.getHours() + ev.end.getMinutes() / 60;
      const sH = ev.start.getHours() + ev.start.getMinutes() / 60;
      return eH > 9 && sH < 21;
    });
  }, [events, view]);

  const minTime = useMemo(() => new Date(0, 0, 0, 9, 0, 0), []);
  const maxTime = useMemo(() => new Date(0, 0, 0, 21, 0, 0), []);

  const eventStyleGetter = ev => {
    let backgroundColor = '#3174ad';
    let color = 'black';
    if (ev.tipo === 'clase') {
      if (ev.grupo === 'G1') backgroundColor = '#FFD700';
      else if (ev.grupo === 'G2') backgroundColor = '#32CD32';
    } else if (ev.tipo === 'entrega') {
      backgroundColor = ev.grupo === 'todos'
        ? '#FFDAB9'
        : ev.grupo === 'G1'
          ? '#FFFACD'
          : '#90EE90';
    } else if (ev.tipo === 'examen') {
      backgroundColor = '#FF6B6B';
      color = 'white';
    }
    return {
      style: {
        backgroundColor,
        color,
        borderRadius: '3px',
        border: 'none'
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
            `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }) =>
            `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, 'dd/MM')} – ${format(end, 'dd/MM')}`
        }}
        dayLayoutAlgorithm="no-overlap"
        components={{ event: props => <CustomEvent {...props} view={view} /> }}
        eventPropGetter={eventStyleGetter}
        style={{ height: view === 'month' ? 'auto' : 650 }}
      />
    </div>
  );
}
