// src/components/Calendario.jsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import es from "date-fns/locale/es";
import {
  parseISO,
  format,
  startOfWeek,
  getDay,
  isSameDay,
  areIntervalsOverlapping,
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
        // calcular solapamientos
        const withOverlap = parsed.map((e, i) => {
          const group = parsed.filter((o, j) => {
            if (i === j) return false;
            if (!isSameDay(e.start, o.start)) return false;
            return areIntervalsOverlapping(
              { start: e.start, end: e.end },
              { start: o.start, end: o.end }
            );
          });
          const all = [e, ...group].sort((a, b) => a.start - b.start);
          const idx = all.findIndex((x) => x === e);
          return {
            ...e,
            overlapCount: all.length,
            overlapIndex: idx,
          };
        });
        setEvents(withOverlap);
      });
  }, []);

  const visibleEvents =
    view === "month" ? events.filter((ev) => ev.tipo !== "clase") : events;

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
        dayLayoutAlgorithm="no-overlap"
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
          // reparto horizontal
          const width = `${100 / event.overlapCount}%`;
          const left = `${(100 / event.overlapCount) * event.overlapIndex}%`;
          // color según tipo
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
              position: "absolute",
              width,
              left,
              top: 0,
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
            const simple =
              event.overlapCount > 1 && event.tipo === "clase";
            const text = simple
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
