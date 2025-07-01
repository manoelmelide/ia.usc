import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function HorarioGrid() {
  const [data, setData] = useState([]);
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [group, setGroup] = useState('Todos');

  useEffect(() => {
    Papa.parse('/horario.csv', {
      header: true,
      download: true,
      complete: ({ data }) => setData(data)
    });
  }, []);

  // Generar opciones de semana según rango de fechas:
  const weeks = Array.from(
    new Set(data.map(r => parseInt(r.Semana)))
  ).sort();

  // Filtrado
  const filtered = data
    .filter(r => selectedWeeks.includes(+r.Semana))
    .filter(r => group === 'Todos' || r.GrupoPracticas === group);

  // Pivot simple en React (horas vs días)
  const horas = Array.from(new Set(filtered.map(r => `${r.HoraInicio}-${r.HoraFin}`))).sort();
  const dias  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  return (
    <div>
      <h2>Horario</h2>
      <div style={{ display:'flex', gap: '1rem' }}>
        <select multiple value={selectedWeeks} onChange={e => {
          const vals = Array.from(e.target.selectedOptions).map(o=>+o.value);
          setSelectedWeeks(vals);
        }}>
          {weeks.map(w=> <option key={w} value={w}>Semana {w}</option>)}
        </select>
        <select value={group} onChange={e=>setGroup(e.target.value)}>
          {['Todos', ...Array.from(new Set(data.map(r=>r.GrupoPracticas)))].map(g=>
            <option key={g} value={g}>{g}</option>
          )}
        </select>
      </div>
      <table border="1" cellPadding="4" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Hora</th>
            {dias.map(d=> <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {horas.map(h => (
            <tr key={h}>
              <td><strong>{h}</strong></td>
              {dias.map(d => {
                const cell = filtered.find(r=>`${r.HoraInicio}-${r.HoraFin}`===h && r.Dia.includes(d));
                return <td key={d}>{cell ? `${cell.Asignatura} (${cell.Aula})` : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
