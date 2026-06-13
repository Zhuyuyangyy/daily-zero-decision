import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './theme/clay.css';

// === Round 6 M2: window.onerror 唯一挂载点 ===
window.addEventListener('error', (event) => {
  console.error('[window.onerror]', event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandledrejection]', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);