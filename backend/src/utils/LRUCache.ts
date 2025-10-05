interface CacheNode<T> {
  key: string;
  value: T;
  timestamp: number;
  prev?: CacheNode<T>;
  next?: CacheNode<T>;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  averageResponseTime: number;
}

export class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, CacheNode<T>>;
  private head?: CacheNode<T>;
  private tail?: CacheNode<T>;
  private ttl: number; // Time to live in milliseconds
  private stats: CacheStats;
  private responseTimes: number[];
  private cleanupInterval: any;

  constructor(capacity: number, ttlSeconds: number = 60) {
    this.capacity = capacity;
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      averageResponseTime: 0
    };
    this.responseTimes = [];

    // Start background cleanup job
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 30000); // Run every 30 seconds
  }

  get(key: string): T | null {
    const startTime = Date.now();
    const node = this.cache.get(key);

    if (!node) {
      this.stats.misses++;
      this.recordResponseTime(Date.now() - startTime);
      return null;
    }

    // Check if expired
    if (Date.now() - node.timestamp > this.ttl) {
      this.delete(key);
      this.stats.misses++;
      this.recordResponseTime(Date.now() - startTime);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    this.stats.hits++;
    this.recordResponseTime(Date.now() - startTime);
    return node.value;
  }

  set(key: string, value: T): void {
    const existing = this.cache.get(key);

    if (existing) {
      // Update existing
      existing.value = value;
      existing.timestamp = Date.now();
      this.moveToHead(existing);
    } else {
      // Create new node
      const newNode: CacheNode<T> = {
        key,
        value,
        timestamp: Date.now()
      };

      this.cache.set(key, newNode);
      this.addToHead(newNode);
      this.stats.size++;

      // Check capacity
      if (this.cache.size > this.capacity) {
        this.removeTail();
      }
    }
  }

  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    this.stats.size--;
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.head = undefined;
    this.tail = undefined;
    this.stats.size = 0;
    this.responseTimes = [];
  }

  getStats(): CacheStats {
    return {
      ...this.stats,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: CacheNode<T>): void {
    node.prev = undefined;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private removeTail(): void {
    if (this.tail) {
      const key = this.tail.key;
      this.removeNode(this.tail);
      this.cache.delete(key);
      this.stats.size--;
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, node] of this.cache.entries()) {
      if (now - node.timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  private recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    // Keep only last 100 response times for average calculation
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.responseTimes.length) * 100) / 100;
  }

  // Cleanup method for graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}