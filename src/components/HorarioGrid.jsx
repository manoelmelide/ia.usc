import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es }
});

export default function FusionCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/horario.csv').then(r=>r.text()),
      fetch('/parciales.csv').then(r=>r.text()),
      fetch('/examenes.csv').then(r=>r.text()),
    ]).then(([hTxt,pTxt,eTxt])=>{
      const dataH = Papa.parse(hTxt, {header:true, skipEmptyLines:true}).data;
      const dataP = Papa.parse(pTxt, {header:true, skipEmptyLines:true}).data;
      const dataE = Papa.parse(eTxt, {header:true, skipEmptyLines:true}).data;
      const ev = [];

      // horario
      dataH.forEach(r => {
        const day = parseISO(r.Dia);
        const [sh,sm] = r.HoraInicio.split(':').map(Number);
        const [eh,em] = r.HoraFin.split(':').map(Number);
        const start = new Date(day); start.setHours(sh, sm);
        const end   = new Date(day); end.setHours(eh, em);
        ev.push({ title: r.Asignatura, start, end, allDay: false });
      });
      // parciales + examenes
      [...dataP, ...dataE].forEach(r => {
        const day = parseISO(r.Dia);
        if (r.Hora) {
          const [sh,eh] = r.Hora.split('-');
          ev.push({
            title: `${r.Asignatura}`,
            start: new Date(`${r.Dia}T${sh}`),
            end:   new Date(`${r.Dia}T${eh}`),
            allDay: false
          });
        } else {
          ev.push({ title: r.Asignatura, start: day, end: day, allDay: true });
        }
      });

      setEvents(ev);
    });
  }, []);

  return (
    <div>
      <h2>Calendario Completo</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        defaultView="week"
        views={['week','day','agenda']}
        style={{ height: 600, margin: '20px' }}
      />
    </div>
  );
}
