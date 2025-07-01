// src/components/Calendario.jsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import es from "date-fns/locale/es";
import {
  parseISO,
  format,
  startOfWeek,
  getDay,
} from "date-fns";
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
  const [view, setView] = useState("week");

  useEffect(() => {
    fetch("/calendario.json")
      .then((r) => r.json())
      .then((data) => {
        const parsed = data.map((ev) => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
        }));
        setEvents(parsed);
      });
  }, []);

  const visibleEvents =
    view === "month"
      ? events.filter((ev) => ev.tipo !== "clase")
      : events;

  const minTime = new Date(1970, 1, 1, 9, 0);
  const maxTime = new Date(1970, 1, 1, 21, 0);

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
        views={["month", "week", "agenda"]}
        onView={setView}

        min={minTime}
        max={maxTime}

        // permitir stacking nativo
        stackEvents
        eventOffset={10}

        formats={{
          timeGutterFormat: "HH:mm",
          eventTimeRangeFormat: ({ start, end }) =>
            `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
          agendaTimeFormat: "HH:mm",
          agendaTimeRangeFormat: ({ start, end }) =>
            `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, "dd/MM")} – ${format(end, "dd/MM")}`,
        }}

        eventPropGetter={(event) => {
          let bg = "#3174ad",
            color = "black";
          if (event.tipo === "clase") {
            if (event.grupo === "G1") bg = "#FFD700";
            if (event.grupo === "G2") bg = "#32CD32";
          } else if (event.tipo === "entrega") {
            if (event.grupo === "todos") bg = "#FFDAB9";
            if (event.grupo === "G1") bg = "#FFFACD";
            if (event.grupo === "G2") bg = "#90EE90";
          } else if (event.tipo === "examen") {
            bg = "#FF6B6B";
            color = "white";
          }
          return {
            style: {
              backgroundColor: bg,
              color,
              borderRadius: "3px",
              border: "none",
              padding: "2px 4px",
              boxSizing: "border-box",
            },
          };
        }}

        components={{
          event: ({ event, title }) => {
            const text =
              view === "week" && event.tipo === "clase" && event.grupo !== "todos"
                ? `${title} (${event.aula})`
                : event.grupo === "todos"
                ? `${title} (${event.aula})`
                : `${title} - ${event.grupo} (${event.aula})`;
            return (
              <div className="rbc-event-content">
                <div>{text}</div>
                {!event.allDay && (
                  <div className="event-time-display">
                    {format(event.start, "HH:mm")} -{" "}
                    {format(event.end, "HH:mm")}
                  </div>
                )}
              </div>
            );
          },
        }}

        className="mi-calendario-sin-scroll"
        style={{ height: view === "month" ? "auto" : 600 }}
      />
    </div>
  );
}
