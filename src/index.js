import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // crea un archivo vacío si no lo tienes

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
