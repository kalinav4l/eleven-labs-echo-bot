import { useMemo, useCallback, useRef, useEffect } from 'react';
import { queryCache, generateCacheKey } from '@/utils/cacheOptimizer';

// Advanced React optimization hook
export const useAdvancedOptimization = () => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (timeSinceLastRender < 16) { // More than 60 FPS
      console.warn(`High frequency renders detected: ${renderCountRef.current} renders`);
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCountRef.current,
    optimizationMetrics: {
      renderFrequency: Date.now() - lastRenderTime.current
    }
  };
};

// Memoized query hook with advanced caching
export const useCachedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
) => {
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options;
  
  const cacheKey = generateCacheKey(...queryKey);
  
  const memoizedQuery = useMemo(() => {
    if (!enabled) return null;
    
    // Check cache first
    const cached = queryCache.get(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }
    
    // Execute query and cache result
    return queryFn().then(result => {
      queryCache.set(cacheKey, result);
      return result;
    });
  }, [cacheKey, enabled]);

  return memoizedQuery;
};

// Batch operation hook
export const useBatchOperations = () => {
  const batchQueue = useRef<Array<() => Promise<any>>>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout>();

  const addToBatch = useCallback((operation: () => Promise<any>) => {
    batchQueue.current.push(operation);
    
    // Clear existing timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    // Set new timeout to execute batch
    batchTimeoutRef.current = setTimeout(() => {
      executeBatch();
    }, 50); // 50ms debounce
  }, []);

  const executeBatch = useCallback(async () => {
    if (batchQueue.current.length === 0) return;
    
    const operations = [...batchQueue.current];
    batchQueue.current = [];
    
    try {
      await Promise.allSettled(operations.map(op => op()));
    } catch (error) {
      console.error('Batch operation failed:', error);
    }
  }, []);

  return { addToBatch, executeBatch };
};

// Resource preloader hook
export const useResourcePreloader = () => {
  const preloadedResources = useRef(new Set<string>());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadRoute = useCallback((route: string) => {
    // Preload route component
    import(`@/pages/${route}`).catch(() => {
      // Route might not exist, ignore error
    });
  }, []);

  return { preloadImage, preloadRoute };
};

// Virtual scrolling optimization
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const scrollTop = useRef(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop.current / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = event.currentTarget.scrollTop;
  }, []);

  return {
    visibleItems,
    handleScroll
  };
};