import React from 'react';
import HorarioGrid from './components/HorarioGrid';
import ParcialesCalendar from './components/ParcialesCalendar';
import ExamenesCalendar from './components/ExamenesCalendar';

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>✅ App montada correctamente</h1>
      <h2>Grao en Intelixencia Artificial – USC</h2>
      <HorarioGrid />
      <hr />
      <ParcialesCalendar />
      <hr />
      <ExamenesCalendar />
    </div>
  );
}
