import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Client-side rendering instead of hydration to avoid mismatch issues
const rootElement = document.getElementById('root')!;

// Clear server-rendered content
rootElement.innerHTML = '';

// Render fresh on client
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
