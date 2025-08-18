import { supabase } from '@/integrations/supabase/client';

export const supabaseOptimized = supabase;

// Optimized query builder with performance considerations
export class OptimizedQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private whereConditions: string[] = [];
  private orderByClause: string = '';
  private limitValue: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  where(condition: string) {
    this.whereConditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'desc') {
    this.orderByClause = `${field} ${direction.toUpperCase()}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  async execute() {
    let query = supabase.from(this.tableName).select(this.selectFields);

    // Apply conditions
    this.whereConditions.forEach(condition => {
      const [field, operator, value] = condition.split(' ');
      switch (operator) {
        case '=':
        case 'eq':
          query = query.eq(field, value);
          break;
        case '!=':
        case 'neq':
          query = query.neq(field, value);
          break;
        case '>':
        case 'gt':
          query = query.gt(field, value);
          break;
        case '<':
        case 'lt':
          query = query.lt(field, value);
          break;
        case '>=':
        case 'gte':
          query = query.gte(field, value);
          break;
        case '<=':
        case 'lte':
          query = query.lte(field, value);
          break;
      }
    });

    // Apply ordering
    if (this.orderByClause) {
      const [field, direction] = this.orderByClause.split(' ');
      query = query.order(field, { ascending: direction === 'ASC' });
    }

    // Apply limit
    if (this.limitValue) {
      query = query.limit(this.limitValue);
    }

    return query;
  }
}

// Connection pool manager
class ConnectionPoolManager {
  private activeConnections = 0;
  private maxConnections = 10;
  private waitingQueue: (() => void)[] = [];

  async acquireConnection(): Promise<void> {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  releaseConnection(): void {
    this.activeConnections--;
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      if (next) {
        this.activeConnections++;
        next();
      }
    }
  }

  async executeWithConnection<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquireConnection();
    try {
      return await operation();
    } finally {
      this.releaseConnection();
    }
  }
}

export const connectionPool = new ConnectionPoolManager();

// Optimized batch operations
export const batchOperations = {
  async batchInsert<T>(tableName: string, records: T[], batchSize = 1000) {
    const results = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const result = await connectionPool.executeWithConnection(async () => {
        return supabase.from(tableName).insert(batch);
      });
      
      results.push(result);
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < records.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  },

  async batchUpdate<T>(tableName: string, updates: Array<{ id: string; data: Partial<T> }>, batchSize = 500) {
    const results = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(({ id, data }) =>
          connectionPool.executeWithConnection(async () => {
            return supabase.from(tableName).update(data).eq('id', id);
          })
        )
      );
      
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
  }
};

// Query caching for read-heavy operations
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100;

  set(key: string, data: any, ttl = 60000) { // Default 1 minute TTL
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const queryCache = new QueryCache();