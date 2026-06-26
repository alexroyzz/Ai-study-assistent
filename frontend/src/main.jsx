import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e2030',
            color: '#f1f5f9',
            border: '1px solid #374151',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1e2030' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1e2030' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
