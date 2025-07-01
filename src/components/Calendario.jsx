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
    : `${title} - ${event.grupo} (${event.aula})`;
  
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      if (event.grupo === 'G1') backgroundColor = '#FFD700';
      else if (event.grupo === 'G2') backgroundColor = '#32CD32';
    } 
    else if (event.tipo === 'entrega') {
      if (event.grupo === 'todos') backgroundColor = '#FFDAB9';
      else if (event.grupo === 'G1') backgroundColor = '#FFFACD';
      else if (event.grupo === 'G2') backgroundColor = '#90EE90';
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
        border: 'none'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const getEventDetails = (event) => {
    if (!event) return null;
    
    const details = {
      title: event.title,
      aula: event.aula,
      grupo: event.grupo,
      tipo: event.tipo
    };
    
    if (event.subtipo) details.subtipo = event.subtipo;
    if (event.convocatoria) details.convocatoria = event.convocatoria;
    if (!event.allDay) {
      details.hora = `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`;
    }
    
    return details;
  };

  const eventDetails = selectedEvent ? getEventDetails(selectedEvent) : null;

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
          event: CustomEvent
        }}
        
        eventPropGetter={eventStyleGetter}
        style={{ height: view === 'month' ? 'auto' : 600 }}
        
        // Nuevo: Manejar selección de evento
        onSelectEvent={handleSelectEvent}
      />
      
      {/* Modal para mostrar detalles del evento */}
      {showModal && eventDetails && (
        <div className="event-modal">
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>×</button>
            <h3>{eventDetails.title}</h3>
            
            <div className="event-details">
              <p><strong>Aula:</strong> {eventDetails.aula}</p>
              <p><strong>Grupo:</strong> {eventDetails.grupo}</p>
              <p><strong>Tipo:</strong> {eventDetails.tipo}</p>
              
              {eventDetails.subtipo && (
                <p><strong>Subtipo:</strong> {eventDetails.subtipo}</p>
              )}
              
              {eventDetails.convocatoria && (
                <p><strong>Convocatoria:</strong> {eventDetails.convocatoria}</p>
              )}
              
              {eventDetails.hora && (
                <p><strong>Horario:</strong> {eventDetails.hora}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
