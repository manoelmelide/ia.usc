import React from 'react';
import HorarioGrid from './components/HorarioGrid';
import ParcialesCalendar from './components/ParcialesCalendar';
import ExamenesCalendar from './components/ExamenesCalendar';

function App() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Grao en Intelixencia Artificial USC</h1>
      <HorarioGrid />
      <ParcialesCalendar />
      <ExamenesCalendar />
    </div>
  );
}

export default App;
