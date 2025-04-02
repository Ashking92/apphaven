
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.tsx'
import './index.css'
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt'

// Register service worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <>
      <App />
      <AddToHomeScreenPrompt />
      <Analytics />
    </>
  );
} else {
  console.error("Root element not found");
}
