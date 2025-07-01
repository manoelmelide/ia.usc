// src/components/Calendario.jsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import es from "date-fns/locale/es";
import { parseISO, format, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendario.css";

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es },
});

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [view, setView]     = useState("week");

  useEffect(() => {
    fetch("/calendario.json")
      .then((r) => r.json())
      .then((data) => {
        setEvents(
          data.map((ev) => ({
            ...ev,
            start: new Date(ev.start),
            end:   new Date(ev.end),
          }))
        );
      });
  }, []);

  // Oculta las clases en month, muestra todo en week/agenda
  const visible = view === "month"
    ? events.filter((ev) => ev.tipo !== "clase")
    : events;

  const minTime = new Date(1970,1,1,9,0);
  const maxTime = new Date(1970,1,1,21,0);

  return (
    <div>
      <h2>Calendario Académico</h2>
      <Calendar
        localizer={localizer}
        events={visible}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"

        defaultView="week"
        views={["month","week","agenda"]}
        onView={setView}

        min={minTime}
        max={maxTime}

        // Apila nativo, no hace falta para el CSS que viene
        stackEvents
        eventOffset={10}

        formats={{
          timeGutterFormat: "HH:mm",
          eventTimeRangeFormat: ({ start,end }) =>
            `${format(start,"HH:mm")} - ${format(end,"HH:mm")}`,
          agendaTimeFormat: "HH:mm",
          agendaTimeRangeFormat: ({ start,end }) =>
            `${format(start,"HH:mm")} - ${format(end,"HH:mm")}`,
          dayRangeHeaderFormat: ({ start,end }) =>
            `${format(start,"dd/MM")} – ${format(end,"dd/MM")}`,
        }}

        // Aquí viene la magia
        eventPropGetter={(event) => {
          let backgroundColor = "#3174ad", color = "black";
          // color según tipo/grupo (igual que antes)
          if (event.tipo === "clase") {
            if (event.grupo === "G1") backgroundColor = "#FFD700";
            if (event.grupo === "G2") backgroundColor = "#32CD32";
          } else if (event.tipo === "entrega") {
            if (event.grupo === "todos") backgroundColor = "#FFDAB9";
            if (event.grupo === "G1")      backgroundColor = "#FFFACD";
            if (event.grupo === "G2")      backgroundColor = "#90EE90";
          } else if (event.tipo === "examen") {
            backgroundColor = "#FF6B6B"; color = "white";
          }

          // estilo de anchura/posición según grupo SOLO en vista week
          let style = { backgroundColor, color, borderRadius:"3px", border:"none", padding:"2px 4px" };
          if (view === "week" && !event.allDay) {
            if (event.grupo === "G1") {
              style = { ...style, width:"50%", left:"0%",  position:"absolute" };
            } else if (event.grupo === "G2") {
              style = { ...style, width:"50%", left:"50%", position:"absolute" };
            } else if (event.grupo === "todos") {
              style = { ...style, width:"100%", left:"0%",  position:"absolute" };
            }
          }
          return { style };
        }}

        components={{
          event: ({ event, title }) => (
            <div className="rbc-event-content">
              <div>
                {view === "week" && event.grupo !== "todos"
                  ? `${title} (${event.aula})`
                  : `${title} (${event.aula})`}
              </div>
              {!event.allDay && (
                <div className="event-time-display">
                  {format(event.start,"HH:mm")} – {format(event.end,"HH:mm")}
                </div>
              )}
            </div>
          ),
        }}

        className="mi-calendario-sin-scroll"
        style={{ height: view === "month" ? "auto" : 600 }}
      />
    </div>
  );
}
