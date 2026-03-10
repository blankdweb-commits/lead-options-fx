import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Wrap in a basic error boundary or try-catch for debugging production crashes
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Rendering Error:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crash</h1><p>${error}</p></div>`;
}
