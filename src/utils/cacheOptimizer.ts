// Advanced caching optimization utilities
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

class AdvancedCache {
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, value: any): void {
    // Remove expired entries
    this.cleanup();
    
    // Enforce size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      hits: 0
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToRemove: string;
    
    switch (this.config.strategy) {
      case 'lru':
        keyToRemove = Array.from(this.cache.keys())[0];
        break;
      case 'lfu':
        keyToRemove = Array.from(this.cache.entries())
          .sort(([,a], [,b]) => a.hits - b.hits)[0][0];
        break;
      case 'fifo':
      default:
        keyToRemove = Array.from(this.cache.keys())[0];
        break;
    }
    
    this.cache.delete(keyToRemove);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Query result cache
export const queryCache = new AdvancedCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  strategy: 'lru'
});

// Component data cache
export const componentCache = new AdvancedCache({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50,
  strategy: 'lfu'
});

// Image cache
export const imageCache = new AdvancedCache({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  strategy: 'lru'
});

// Cache key generators
export const generateCacheKey = (...parts: (string | number | boolean)[]): string => {
  return parts.map(p => String(p)).join(':');
};

// Local storage with compression
export const compressedStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const compressed = JSON.stringify(value);
      localStorage.setItem(key, compressed);
    } catch (error) {
      console.warn('Failed to store item:', error);
    }
  },

  getItem: (key: string): any | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to retrieve item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  }
};

// Prefetch utility
export const prefetchResource = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

// Preload critical resources
export const preloadCriticalResources = (): void => {
  // Preload fonts
  const fontUrls = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];

  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    document.head.appendChild(link);
  });
};