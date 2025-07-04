// src/components/Calendario.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { useLocation, useNavigate } from 'react-router-dom'
import es from 'date-fns/locale/es'
import { parseISO, format, startOfWeek, getDay } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './Calendario.css'

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek,
  getDay,
  locales: { es },
})

const CustomEvent = ({ event, view }) => {
  const { title } = event
  const Time = () =>
    !event.allDay && (
      <div className="event-time-display">
        {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
      </div>
    )

  if (view === 'month') {
    return (
      <div className="rbc-event-content">
        <Time />
        <div>{title}</div>
      </div>
    )
  }
  if (view === 'week') {
    return (
      <div className="rbc-event-content">
        <div>{title}</div>
        <Time />
      </div>
    )
  }
  return (
    <div className="rbc-event-content">
      <div>{title}</div>
      <Time />
    </div>
  )
}

export default function Calendario() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const viewParam = params.get('view') || 'week'
  const dateParam = params.get('date')
    ? new Date(params.get('date'))
    : new Date()

  const [events, setEvents] = useState([])

  useEffect(() => {
    Promise.all([
      fetch('/schedule.json').then(r => r.json()),
      fetch('/deliverables.json').then(r => r.json()),
      fetch('/extras.json').then(r => r.json()),
    ]).then(([sched, deliv, extras]) => {
      const ps = sched.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }))
      const pd = deliv.map(ev => {
        let s, e
        if (ev.allDay) {
          if (ev.deadline) {
            s = new Date(`${ev.fecha}T${ev.deadline}`); e = s
          } else {
            s = new Date(ev.fecha); e = new Date(ev.fecha)
          }
        } else {
          s = new Date(ev.start); e = new Date(ev.end)
        }
        return { ...ev, start: s, end: e }
      })
      const pe = extras.map(ev => {
        let s, e
        if (ev.allDay) {
          s = new Date(ev.fecha); e = new Date(ev.fecha)
        } else {
          s = new Date(ev.start); e = new Date(ev.end)
        }
        return { ...ev, start: s, end: e }
      })
      setEvents([...ps, ...pd, ...pe])
    })
  }, [])

  const visibleEvents = useMemo(() => {
    if (viewParam === 'month') return events
    return events.filter(ev => {
      if (ev.allDay) return true
      const eH = ev.end.getHours() + ev.end.getMinutes() / 60
      const sH = ev.start.getHours() + ev.start.getMinutes() / 60
      return eH > 9 && sH < 21
    })
  }, [events, viewParam])

  const minTime = new Date(0, 0, 0, 9, 0)
  const maxTime = new Date(0, 0, 0, 21, 0)

  const onNavigate = date => {
    navigate(`/?view=week&date=${format(date, 'yyyy-MM-dd')}`)
  }

  return (
    <div>
      <h2>Calendario Académico</h2>
      <Calendar
        localizer={localizer}
        events={visibleEvents}
        view={viewParam}
        date={dateParam}
        onView={v => navigate(`/?view=${v}&date=${format(dateParam, 'yyyy-MM-dd')}`)}
        onNavigate={onNavigate}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        showAllEvents
        popup={false}
        className="mi-calendario-sin-scroll"
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
            `${format(start, 'dd/MM')} – ${format(end, 'dd/MM')}`,
        }}
        dayLayoutAlgorithm="no-overlap"
        components={{ event: props => <CustomEvent {...props} view={viewParam} /> }}
        style={{ height: viewParam === 'month' ? 'auto' : 650 }}
      />
    </div>
  )
}
