// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css'; // Importa el archivo CSS específico

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es }
});

// Componente personalizado para eventos MODIFICADO
const CustomEvent = ({ event, title }) => {
  // Determinar el formato del título según el grupo
  const formattedTitle = event.grupo === 'todos' 
    ? `${title} (${event.aula})`
    : `${title} - ${event.grupo} (${event.aula})`;
  
  return (
    <div className="rbc-event-content">
      <div>{formattedTitle}</div>
      {/* Mostrar la hora solo en vista mes */}
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
      // Incluir eventos allDay en vista semana
      if (event.allDay) return true;
      
      const eventEndHour = event.end.getHours() + event.end.getMinutes() / 60;
      const eventStartHour = event.start.getHours() + event.start.getMinutes() / 60;
      return eventEndHour > 9 && eventStartHour < 21;
    });
  }, [events, view]);

  const minTime = useMemo(() => new Date(0, 0, 0, 9, 0, 0), []);
  const maxTime = useMemo(() => new Date(0, 0, 0, 21, 0, 0), []);

  // Función para asignar colores a los eventos
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // Azul por defecto (para clases todos)
    let color = 'black'; // Color de texto
    
    if (event.tipo === 'clase') {
      if (event.grupo === 'G1') {
        backgroundColor = '#FFD700'; // Amarillo medio
      } else if (event.grupo === 'G2') {
        backgroundColor = '#32CD32'; // Verde medio
      }
    } 
    else if (event.tipo === 'entrega') {
      if (event.grupo === 'todos') {
        backgroundColor = '#FFDAB9'; // Melocotón claro
      } else if (event.grupo === 'G1') {
        backgroundColor = '#FFFACD'; // Amarillo claro
      } else if (event.grupo === 'G2') {
        backgroundColor = '#90EE90'; // Verde claro
      }
    } 
    else if (event.tipo === 'examen') {
      backgroundColor = '#FF6B6B'; // Rojo
      color = 'white'; // Texto blanco para mejor contraste
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
        
        // Componentes personalizados
        components={{
          event: CustomEvent
        }}
        
        // Asignador de estilos para eventos
        eventPropGetter={eventStyleGetter}
        
        // Altura dinámica basada en la vista
        style={{ height: view === 'month' ? 'auto' : 600 }}
      />
    </div>
  );
}
