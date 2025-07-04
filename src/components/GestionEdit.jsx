// src/components/GestionEdit.jsx
import React, { useState, useEffect } from 'react';

const JSON_SOURCES = {
  deliverables: '/deliverables.json',
  extras:      '/extras.json',
  schedule:    '/schedule.json',
};

export default function GestionEdit() {
  const [category, setCategory] = useState('deliverables');
  const [items, setItems]       = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [schema, setSchema]     = useState([]);
  const [formData, setFormData] = useState({});

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

  // Carga los ítems cuando cambie la categoría
  useEffect(() => {
    async function fetchItems() {
      const resp = await fetch(JSON_SOURCES[category]);
      const data = await resp.json();
      setItems(data);
      setSelectedIndex(null);
    }
    fetchItems();

    // Configura esquema y resetea formulario
    const campos = camposPorCategoria[category];
    setSchema(campos);
    setFormData({});
  }, [category]);

  // Cuando se selecciona un ítem, poblar formData
  useEffect(() => {
    if (selectedIndex == null) return;
    const item = items[selectedIndex];
    const fd = {};
    schema.forEach(key => {
      fd[key] = item[key] ?? (key === 'allDay' ? false : '');
    });
    setFormData(fd);
  }, [selectedIndex, items, schema]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (selectedIndex == null) {
      alert('Selecciona primero un ítem para editar.');
      return;
    }
    // Clona array y reemplaza el objeto editado
    const actualizado = [...items];
    const nuevoObj = {};
    schema.forEach(key => {
      const val = formData[key];
      if (val !== '' && val != null) {
        nuevoObj[key] = key === 'allDay' ? Boolean(val) : val;
      }
    });
    actualizado[selectedIndex] = {
      ...items[selectedIndex],
      ...nuevoObj
    };

    console.log(`Array actualizado de ${category}:`, actualizado);
    alert(`Ítem ${selectedIndex + 1} de "${category}" editado.`);
    // TODO: persistir cambios vía API backend
  };

  return (
    <div>
      <h2>Editar ítem existente</h2>
      <form onSubmit={handleSubmit}>
        {/* Selector de categoría */}
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Origen:&nbsp;
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="deliverables">Deliverables</option>
              <option value="extras">Extras</option>
              <option value="schedule">Schedule</option>
            </select>
          </label>
        </div>

        {/* Selector de ítem */}
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Ítem:&nbsp;
            <select
              value={selectedIndex ?? ''}
              onChange={e => setSelectedIndex(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">— Selecciona —</option>
              {items.map((it, idx) => (
                <option key={idx} value={idx}>
                  {it.title || `${category} #${idx + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Campos dinámicos */}
        {selectedIndex != null && schema.map(field => (
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
                  value={formData[field] ?? ''}
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
            backgroundColor: '#ffc107',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
