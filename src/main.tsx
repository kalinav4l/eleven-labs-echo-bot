import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceTracking } from './utils/performanceMonitor'

// Initialize performance tracking
initPerformanceTracking();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
