import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceTracking } from './utils/performanceMonitor'
import { initializeBundleOptimizations, preloadCriticalResources } from './utils/bundleOptimizer'
import { preloadCriticalResources as preloadResources } from './utils/cacheOptimizer'

// Initialize all optimizations
initPerformanceTracking();
initializeBundleOptimizations();
preloadCriticalResources();
preloadResources();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
