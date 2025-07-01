import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function HorarioGrid() {
  const [data, setData] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selWeeks, setSelWeeks] = useState([]);
  const [group, setGroup] = useState('Todos');

  useEffect(() => {
    Papa.parse('/horario.csv', {
      header: true,
      download: true,
      complete: ({ data }) => {
        const clean = data.filter(r => r.Semana);
        setData(clean);
        const w = Array.from(new Set(clean.map(r => +r.Semana))).sort();
        setWeeks(w);
        setSelWeeks([w[0]]);
      },
      error: err => {
        console.error('Error cargando horario.csv:', err);
        setData([]);
      }
    });
  }, []);

  if (data === null) return <p>Cargando horario…</p>;
  if (data.length === 0) return <p>No hay datos de horario.</p>;

  const filtered = data
    .filter(r => selWeeks.includes(+r.Semana))
    .filter(r => group === 'Todos' || r.GrupoPracticas === group);

  const horas = Array.from(new Set(
    filtered.map(r => `${r.HoraInicio}-${r.HoraFin}`)
  )).sort();
  const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  return (
    <div>
      <h2>Horario</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <select
          multiple
          size={weeks.length}
          value={selWeeks}
          onChange={e =>
            setSelWeeks(Array.from(e.target.selectedOptions, o => +o.value))
          }
        >
          {weeks.map(w => (
            <option key={w} value={w}>
              Semana {w}
            </option>
          ))}
        </select>
        <select value={group} onChange={e => setGroup(e.target.value)}>
          {['Todos', ...Array.from(new Set(data.map(r => r.GrupoPracticas)))].map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Hora</th>
            {dias.map(d => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map(h => (
            <tr key={h}>
              <td>
                <strong>{h}</strong>
              </td>
              {dias.map(d => {
                const cell = filtered.find(
                  r => `${r.HoraInicio}-${r.HoraFin}` === h && r.Dia.includes(d)
                );
                return <td key={d}>{cell ? `${cell.Asignatura} (${cell.Aula})` : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
