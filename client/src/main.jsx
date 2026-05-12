import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        containerStyle={{ top: 76, right: 18 }}
        toastOptions={{
          style: {
            background: 'rgba(var(--surface), 0.92)',
            color: 'rgb(var(--text))',
            border: '1px solid rgba(var(--line), 0.12)',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-soft)',
            backdropFilter: 'blur(18px)',
            fontWeight: 700,
          },
          success: { iconTheme: { primary: 'rgb(var(--accent))', secondary: '#0F1115' } },
          error: { iconTheme: { primary: 'rgb(var(--danger))', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
