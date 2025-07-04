// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import es from 'date-fns/locale/es'
import { parseISO, format, startOfWeek, getDay } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './Calendario.css'

const localizer = dateFnsLocalizer({
  format, parse: parseISO, startOfWeek, getDay, locales: { es }
})

const CustomEvent = ({ event, view }) => {
  const { tipo, grupo, aula, deadline, title, start, end, allDay } = event
  const esActividad = tipo === 'actividad'
  const esGestion   = tipo === 'gestion'
  const grpLabel    = grupo && grupo !== 'todos' ? ` – ${grupo}` : ''

  // helper para mostrar hora
  const Time = () => !allDay && (
    <div className="event-time-display">
      {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
    </div>
  )

  // --- VISTA MES ---
  if (view === 'month') {
    // actividades/exámenes
    if (esActividad || tipo === 'examen') {
      return (
        <div className="rbc-event-content">
          <Time />
          <div>{title}{grpLabel}</div>
          {deadline
            ? <div>({deadline})</div>
            : aula && <div>({aula})</div>}
        </div>
      )
    }
    // gestión: título multiline y hora si no es allDay
    if (esGestion) {
      return (
        <div className="rbc-event-content">
          <Time />
          <div>{title}{grpLabel}</div>
        </div>
      )
    }
    // clases normales
    return (
      <div className="rbc-event-content">
        <Time />
        <div>{title}{aula ? ` (${aula})` : ''}</div>
      </div>
    )
  }

  // --- VISTA SEMANA ---
  if (view === 'week') {
    if (esActividad || tipo === 'examen') {
      return (
        <div className="rbc-event-content">
          <div>{title}{grpLabel}</div>
          {deadline
            ? <div>Fin: {deadline}</div>
            : aula && <div>Aula: {aula}</div>}
        </div>
      )
    }
    if (esGestion) {
      return (
        <div className="rbc-event-content">
          <div>{title}{grpLabel}</div>
          <Time />
        </div>
      )
    }
    return (
      <div className="rbc-event-content">
        <div>{title}{aula ? ` (${aula})` : ''}</div>
        <Time />
      </div>
    )
  }

  // --- AGENDA / OTRAS ---
  return (
    <div className="rbc-event-content">
      <div>{title}{grpLabel}</div>
      <Time />
    </div>
  )
}

export default function Calendario() {
  const [events, setEvents] = useState([])
  const [view, setView]     = useState('week')

  useEffect(() => {
    Promise.all([
      fetch('/schedule.json').then(r => r.json()),
      fetch('/deliverables.json').then(r => r.json()),
      fetch('/extras.json').then(r => r.json())
    ]).then(([schedule, deliverables, extras]) => {
      const ps = schedule.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end:   new Date(ev.end),
      }))
      const pd = deliverables.map(ev => {
        let s, e
        if (ev.allDay) {
          if (ev.deadline) {
            s = new Date(`${ev.fecha}T${ev.deadline}`)
            e = new Date(`${ev.fecha}T${ev.deadline}`)
          } else {
            s = new Date(ev.fecha)
            e = new Date(ev.fecha)
          }
        } else {
          s = new Date(ev.start)
          e = new Date(ev.end)
        }
        return { ...ev, start: s, end: e }
      })
      const pe = extras.map(ev => {
        let s, e
        if (ev.allDay) {
          s = new Date(ev.fecha)
          e = new Date(ev.fecha)
        } else {
          s = new Date(ev.start)
          e = new Date(ev.end)
        }
        return { ...ev, start: s, end: e }
      })
      setEvents([...ps, ...pd, ...pe])
    })
  }, [])

  const visibleEvents = useMemo(() => {
    if (view === 'month') return events
    return events.filter(ev => {
      if (ev.allDay) return true
      const eH = ev.end.getHours() + ev.end.getMinutes() / 60
      const sH = ev.start.getHours() + ev.start.getMinutes() / 60
      return eH > 9 && sH < 21
    })
  }, [events, view])

  const minTime = useMemo(() => new Date(0,0,0,9,0), [])
  const maxTime = useMemo(() => new Date(0,0,0,21,0), [])

  const eventStyleGetter = ev => {
    let bg = '#3174ad', color = 'black'
    if (ev.tipo === 'clase') {
      if (ev.grupo === 'G1') bg = '#FFD700'
      else if (ev.grupo === 'G2') bg = '#32CD32'
    } else if (ev.tipo === 'actividad') {
      bg = ev.grupo === 'todos'
        ? '#FFDAB9'
        : ev.grupo === 'G1'
          ? '#FFFACD'
          : '#90EE90'
    } else if (ev.tipo === 'examen') {
      bg = '#FF6B6B'; color = 'white'
    } else if (ev.tipo === 'gestion') {
      bg = '#8A2BE2'; color = 'white'
    }
    return {
      style: {
        backgroundColor: bg,
        color,
        borderRadius: '3px',
        border: 'none',
        height: 'auto'
      }
    }
  }

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
          timeGutterFormat:'HH:mm',
          eventTimeRangeFormat:({start,end})=>
            `${format(start,'HH:mm')} – ${format(end,'HH:mm')}`,
          agendaTimeFormat:'HH:mm',
          agendaTimeRangeFormat:({start,end})=>
            `${format(start,'HH:mm')} – ${format(end,'HH:mm')}`,
          dayRangeHeaderFormat:({start,end})=>
            `${format(start,'dd/MM')} – ${format(end,'dd/MM')}`
        }}
        dayLayoutAlgorithm="no-overlap"
        components={{ event: props => <CustomEvent {...props} view={view}/> }}
        eventPropGetter={eventStyleGetter}
        style={{ height: view === 'month' ? 'auto' : 650 }}
      />
    </div>
  )
}
