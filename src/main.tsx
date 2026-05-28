import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import DesignPage from './pages/DesignPage';
import AdminPage from './pages/AdminPage';

function App() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return <AdminPage />;
  return <DesignPage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
