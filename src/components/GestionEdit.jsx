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
    /
