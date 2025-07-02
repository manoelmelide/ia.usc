/* src/pages/Gestion.jsx */
import React from 'react';

export default function Gestion() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Área de Gestión</h1>
    </div>
  );
}

/* src/pages/Home.css */
.login-form {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.login-form input {
  padding: 8px;
}
.login-form button {
  padding: 8px 12px;
}
.courses-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.course-card {
  padding: 12px;
  background: #eee;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
}
.course-detail {
  padding: 16px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
}
