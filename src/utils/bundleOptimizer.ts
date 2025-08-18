import React from 'react';

// Advanced bundle optimization utilities

// Tree shaking analyzer
export const analyzeUnusedCode = () => {
  if (typeof window === 'undefined') return;
  
  const modules = Object.keys(window as any).filter(key => 
    key.startsWith('__webpack') || key.startsWith('__vite')
  );
  
  console.log('Loaded modules:', modules.length);
  
  // Analyze bundle size
  const scripts = Array.from(document.scripts);
  let totalSize = 0;
  
  scripts.forEach(script => {
    if (script.src) {
      fetch(script.src, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;
          console.log(`Script ${script.src}: ${(size / 1024).toFixed(2)}KB`);
        })
        .catch(() => {});
    }
  });
};

// Dynamic import with retry
export const dynamicImportWithRetry = async <T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};

// Component lazy loading with better error handling
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(() => 
    dynamicImportWithRetry(importFn)
  );
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense 
      fallback={
        fallback ? React.createElement(fallback) : 
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Resource hints optimizer
export const optimizeResourceHints = () => {
  // DNS prefetch for external resources
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.elevenlabs.io'
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
  
  // Preconnect to critical resources
  const preconnectDomains = [
    'https://api.elevenlabs.io',
    'https://fonts.googleapis.com'
  ];
  
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    .loading-spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
};

// Webpack chunk optimization hints
export const optimizeChunkLoading = () => {
  // Prefetch non-critical chunks
  const prefetchChunks = [
    '/pages/Settings',
    '/pages/Analytics',
    '/pages/Documentation'
  ];
  
  prefetchChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = chunk;
    document.head.appendChild(link);
  });
};

// Service worker registration for aggressive caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered:', registration);
      
      // Update on reload
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, refresh page
              window.location.reload();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Initialize all optimizations
export const initializeBundleOptimizations = () => {
  // Run immediately
  optimizeResourceHints();
  inlineCriticalCSS();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeChunkLoading();
      analyzeUnusedCode();
    });
  } else {
    optimizeChunkLoading();
    analyzeUnusedCode();
  }
  
  // Register service worker
  registerServiceWorker();
};