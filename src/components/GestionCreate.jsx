// src/components/GestionCreate.jsx
import React, { useState, useEffect } from 'react';

const JSON_SOURCES = {
  deliverables: '/deliverables.json',
  extras:      '/extras.json',
  schedule:    '/schedule.json',
};

export default function GestionCreate() {
  const [category, setCategory] = useState('deliverables');
  const [schema, setSchema] = useState([]);
  const [formData, setFormData] = useState({});

  // Definición de campos por categoría
  const camposPorCategoria = {
    deliverables: [
      'title', 'courseId', 'tipo', 'subtipo',
      'grupo', 'aula', 'allDay', 'fecha',
      'start', 'end', 'deadline'
    ],
    extras: [
      'title', 'courseId', 'tipo',
      'allDay', 'fecha',
      'start', 'end'
    ],
    schedule: [
      'title', 'tipo', 'grupo',
      'aula', 'allDay',
      'start', 'end'
    ],
  };

  // Cada vez que cambie la categoría, reseteamos el formulario
  useEffect(() => {
    const campos = camposPorCategoria[category];
    const nuevoForm = {};
    campos.forEach(c => { nuevoForm[c] = ''; });
    setSchema(campos);
    setFormData(nuevoForm);
  }, [category]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Cargar el JSON actual
    const url = JSON_SOURCES[category];
    const resp = await fetch(url);
    const data = await resp.json();

    // Construir nuevo objeto filtrando campos vacíos
    const nuevoElemento = schema.reduce((obj, key) => {
      const val = formData[key];
      if (val !== '' && val != null) {
        // convertir allDay a boolean
        obj[key] = key === 'allDay' ? Boolean(val) : val;
      }
      return obj;
    }, {});

    // Añadir al array y, idealmente, hacer POST al backend para persistir
    const actualizado = [...data, nuevoElemento];
    console.log(`Nuevo array de ${category}:`, actualizado);
    alert(`Se ha creado un nuevo elemento en "${category}".`);
    // TODO: implementar persistencia real vía API
  };

  return (
    <div>
      <h2>Crear nuevo ítem</h2>
      <form onSubmit={handleSubmit}>
        {/* Selector de categoría */}
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Destino:&nbsp;
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="deliverables">Deliverables</option>
              <option value="extras">Extras</option>
              <option value="schedule">Schedule</option>
            </select>
          </label>
        </div>

        {/* Campos dinámicos según categoría */}
        {schema.map(field => (
          <div key={field} style={{ marginBottom: '0.5rem' }}>
            {field === 'allDay' ? (
              <label>
                <input
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay || false}
                  onChange={handleChange}
                />{' '}
                Todo el día
              </label>
            ) : (
              <label style={{ display: 'block' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
                <input
                  type={
                    ['fecha', 'start', 'end', 'deadline'].includes(field)
                      ? 'datetime-local'
                      : 'text'
                  }
                  name={field}
                  value={formData[field]}
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
