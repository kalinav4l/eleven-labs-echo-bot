// Performance monitoring utilities
export const trackPerformance = () => {
  if (typeof window !== 'undefined') {
    // Custom metrics
    performance.mark('app-start');
    
    window.addEventListener('load', () => {
      performance.mark('app-loaded');
      performance.measure('app-load-time', 'app-start', 'app-loaded');
      
      const measure = performance.getEntriesByName('app-load-time')[0];
      console.log('App Load Time:', measure.duration);
      
      if (measure.duration > 3000) {
        console.warn('Slow app load time:', measure.duration);
      }
    });

    // Track navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        windowLoad: navigation.loadEventEnd - navigation.fetchStart
      };

      console.log('Navigation Metrics:', metrics);
    });
  }
};

// Resource loading performance tracker
export const trackResourceLoading = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const slowResources = resources.filter(resource => resource.duration > 1000);
      if (slowResources.length > 0) {
        console.warn('Slow loading resources:', slowResources.map(r => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize
        })));
      }

      // Track largest resources
      const largeResources = resources
        .filter(r => r.transferSize > 100000) // > 100KB
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 10);
      
      if (largeResources.length > 0) {
        console.log('Largest resources:', largeResources.map(r => ({
          name: r.name.split('/').pop(),
          size: `${(r.transferSize / 1024).toFixed(1)}KB`,
          duration: `${r.duration.toFixed(1)}ms`
        })));
      }
    });
  }
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      
      Promise.all([
        ...scripts.map(script => 
          fetch(script.src, { method: 'HEAD' })
            .then(response => ({
              url: script.src,
              size: parseInt(response.headers.get('content-length') || '0'),
              type: 'script'
            }))
            .catch(() => ({ url: script.src, size: 0, type: 'script' }))
        ),
        ...styles.map(style => 
          fetch(style.href, { method: 'HEAD' })
            .then(response => ({
              url: style.href,
              size: parseInt(response.headers.get('content-length') || '0'),
              type: 'style'
            }))
            .catch(() => ({ url: style.href, size: 0, type: 'style' }))
        )
      ]).then(assets => {
        const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
        console.log('Bundle Analysis:', {
          totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
          scripts: assets.filter(a => a.type === 'script').length,
          styles: assets.filter(a => a.type === 'style').length,
          largestAssets: assets
            .sort((a, b) => b.size - a.size)
            .slice(0, 5)
            .map(a => ({
              name: a.url.split('/').pop(),
              size: `${(a.size / 1024).toFixed(1)}KB`,
              type: a.type
            }))
        });
      });
    });
  }
};

// Initialize all performance tracking
export const initPerformanceTracking = () => {
  trackPerformance();
  trackResourceLoading();
  analyzeBundleSize();
};