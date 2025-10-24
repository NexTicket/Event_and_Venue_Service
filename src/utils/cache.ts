import { createClient, RedisClientType } from 'redis';

class CacheManager {
  private client: RedisClientType | null = null;
  private isEnabled: boolean = false;
  private defaultTTL: number = 300; // 5 minutes default

  async connect(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis max retries reached, disabling cache');
              this.isEnabled = false;
              return new Error('Max retries reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isEnabled = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isEnabled = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
        this.isEnabled = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      this.isEnabled = false;
      this.client = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isEnabled = false;
    }
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value with TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<boolean> {
    if (!this.isEnabled || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cached value(s)
   */
  async del(keys: string | string[]): Promise<boolean> {
    if (!this.isEnabled || !this.client) {
      return false;
    }

    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      await this.client.del(keyArray);
      return true;
    } catch (error) {
      console.error(`Cache delete error:`, error);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache delete pattern error:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<boolean> {
    if (!this.isEnabled || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Check if cache is enabled and connected
   */
  isConnected(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.isEnabled || !this.client) {
      return { enabled: false };
    }

    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbSize();
      
      return {
        enabled: true,
        connected: this.isEnabled,
        dbSize,
        info
      };
    } catch (error) {
      return { enabled: false, error: String(error) };
    }
  }
}

// Singleton instance
export const cache = new CacheManager();

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  // Event keys
  allEvents: (status?: string, category?: string) => {
    let key = 'events:all';
    if (status) key += `:status:${status}`;
    if (category) key += `:category:${category}`;
    return key;
  },
  eventById: (id: string) => `event:${id}`,
  eventsByVenue: (venueId: string) => `events:venue:${venueId}`,
  eventsByTenant: (tenantId: string) => `events:tenant:${tenantId}`,
  
  // Venue keys
  allVenues: () => 'venues:all',
  venueById: (id: string) => `venue:${id}`,
  venuesByType: (type: string) => `venues:type:${type}`,
  venuesByTenant: (tenantId: string) => `venues:tenant:${tenantId}`,
  
  // Tenant keys
  tenantByUid: (firebaseUid: string) => `tenant:uid:${firebaseUid}`,
  tenantById: (id: string) => `tenant:${id}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,        // 1 minute - for frequently changing data
  MEDIUM: 300,      // 5 minutes - for normal data
  LONG: 1800,       // 30 minutes - for rarely changing data
  VERY_LONG: 3600,  // 1 hour - for static data
};

/**
 * Invalidate cache patterns when data changes
 */
export const invalidateEventCache = async (eventId?: string, venueId?: string, tenantId?: string) => {
  const patterns = [
    'events:all*',  // All event listings
  ];

  if (eventId) {
    patterns.push(CacheKeys.eventById(eventId));
  }
  if (venueId) {
    patterns.push(CacheKeys.eventsByVenue(venueId));
  }
  if (tenantId) {
    patterns.push(CacheKeys.eventsByTenant(tenantId));
  }

  for (const pattern of patterns) {
    await cache.delPattern(pattern);
  }
};

export const invalidateVenueCache = async (venueId?: string, type?: string, tenantId?: string) => {
  const patterns = [
    'venues:all*',  // All venue listings
  ];

  if (venueId) {
    patterns.push(CacheKeys.venueById(venueId));
  }
  if (type) {
    patterns.push(CacheKeys.venuesByType(type));
  }
  if (tenantId) {
    patterns.push(CacheKeys.venuesByTenant(tenantId));
  }

  for (const pattern of patterns) {
    await cache.delPattern(pattern);
  }
};
