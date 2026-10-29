import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './components/ui/ui.css';

const ComponentShowcase = React.lazy(() => import('./components/ComponentShowcase'));
const showComponents = new URLSearchParams(window.location.search).get('view') === 'components';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {showComponents ? <React.Suspense fallback={<main className="app-shell">Loading components…</main>}><ComponentShowcase /></React.Suspense> : <App />}
  </React.StrictMode>,
);
