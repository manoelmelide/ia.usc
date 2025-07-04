// src/components/GestionCreate.jsx
import React, { useState, useEffect } from 'react';

const JSON_SOURCES = {
  deliverables: '/deliverables.json',
  extras:      '/extras.json',
  schedule:    '/schedule.json',
};

export default function GestionCreate() {
  const [category, setCategory] = useState('deliverables');
  const [schema, setSchema]     = useState([]);
  const [formData, setFormData] = useState({});

  // Campos por categoría (keys internas)
  const camposPorCategoria = {
    deliverables: ['title', 'courseId', 'subtipo', 'grupo', 'aula', 'allDay', 'fecha', 'start', 'end', 'deadline'],
    extras:       ['title', 'courseId', 'allDay', 'fecha', 'start', 'end'],
    schedule:     ['title', 'grupo', 'aula', 'start', 'end'],
  };

  // Opciones de select
  const asignaturas      = ['DXIA', 'ATIA', 'AprRef', 'VisComp', 'TecLin', 'ProxInt'];
  const asignaturasExtras = [...asignaturas, 'Otros'];
  const subtipos         = ['Test', 'Exposición', 'Entrega'];
  const grupos           = ['todos', 'G1', 'G2'];

  // Cuando cambia categoría, reseteamos esquema y formulario
  useEffect(() => {
    const campos = camposPorCategoria[category];
    const init   = {};

    campos.forEach(key => {
      if (key === 'allDay') init[key] = category !== 'schedule';        // allDay solo para deliverables/extras
      else if (key === 'grupo') init[key] = 'todos';                   // grupo por defecto
      else init[key] = '';
    });

    // Campo oculto tipo según categoría
    init.tipo =
      category === 'schedule' ? 'clase'
      : category === 'extras'   ? 'gestion'
                               : 'actividad';

    setSchema(campos);
    setFormData(init);
  }, [category]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Cargar JSON actual
    const resp = await fetch(JSON_SOURCES[category]);
    const data = await resp.json();

    // Construir nuevo objeto con campos no vacíos
    const nuevo = {};
    schema.forEach(key => {
      const val = formData[key];
      if (val !== '' && val != null) {
        nuevo[key] = key === 'allDay' ? Boolean(val) : val;
      }
    });
    // Añadir tipo oculto
    nuevo.tipo = formData.tipo;

    const actualizado = [...data, nuevo];
    console.log(`Nuevo array de ${category}:`, actualizado);
    alert(`Nuevo elemento creado en "${category}".`);
    // TODO: persistir cambios via API
  };

  return (
    <div>
      <h2>Crear nuevo ítem</h2>
      <form onSubmit={handleSubmit}>
        {/* Selector de destino */}
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Destino:&nbsp;
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="deliverables">Actividades</option>
              <option value="extras">Extras</option>
              <option value="schedule">Horario</option>
            </select>
          </label>
        </div>

        {/* Campos dinámicos */}
        {schema.map(field => (
          <div key={field} style={{ marginBottom: '0.75rem' }}>
            {field === 'title' && (
              <label>
                Título:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            )}

            {field === 'courseId' && (
              <label>
                Asignatura:
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                >
                  <option value="">— Selecciona —</option>
                  {(category === 'extras' ? asignaturasExtras : asignaturas).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
            )}

            {field === 'subtipo' && (
              <label>
                Subtipo:
                <select
                  name="subtipo"
                  value={formData.subtipo}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                >
                  <option value="">—</option>
                  {subtipos.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </label>
            )}

            {field === 'grupo' && (
              <label>
                Grupo:
                <select
                  name="grupo"
                  value={formData.grupo}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {grupos.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>
            )}

            {field === 'aula' && (
              <label>
                Aula:
                <input
                  type="text"
                  name="aula"
                  value={formData.aula}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            )}

            {field === 'allDay' && category !== 'schedule' && (
              <label>
                <input
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleChange}
                />{' '}
                Todo el día
              </label>
            )}

            {field === 'fecha' && (
              <label>
                Fecha:
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            )}

            {(field === 'start' || field === 'end') && (
              <label>
                {field === 'start' ? 'Inicio:' : 'Fin:'}
                <input
                  type="datetime-local"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            )}

            {field === 'deadline' && (
              <label>
                Deadline:
                <input
                  type="time"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            )}
          </div>
        ))}

        <button
          type="submit"
          style={{
            marginTop: '1rem',
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Crear
        </button>
      </form>
    </div>
  );
}
