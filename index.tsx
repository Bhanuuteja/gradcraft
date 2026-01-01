import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global Error Trap
window.onerror = function (msg, url, line, col, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background:red;color:white;padding:20px;font-family:monospace;margin:20px;border-radius:10px;">
        <h1>CRASH DETECTED</h1>
        <p><strong>Error:</strong> ${msg}</p>
        <p><strong>File:</strong> ${url}:${line}:${col}</p>
        <p><strong>Stack:</strong> ${error?.stack}</p>
      </div>
    `;
  }
};

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Could not find root element");

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e: any) {
  window.onerror(e.message, 'index.tsx', 0, 0, e);
}