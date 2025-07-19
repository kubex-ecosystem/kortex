/**
 * 🗄️ CacheService - Sistema de Cache Avançado com IndexedDB
 * Gerencia armazenamento local, cache inteligente e sincronização
 */

interface CacheOptions {
  ttl?: number; // Time to live em milliseconds
  encrypt?: boolean; // Se deve criptografar os dados
  compress?: boolean; // Se deve comprimir os dados
  syncStrategy?: 'lazy' | 'eager' | 'manual'; // Estratégia de sincronização
}

interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl?: number;
  encrypted?: boolean;
  compressed?: boolean;
  version: number;
  metadata?: Record<string, any>;
}

export default class CacheService {
  private static instance: CacheService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'KortexCache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'cache_entries';
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.initPromise = this.initializeDB();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 🚀 Database Initialization
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        console.warn('IndexedDB not available (SSR or not supported), falling back to localStorage');
        resolve();
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store with key path
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          
          // Create indexes for efficient querying
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('ttl', 'ttl', { unique: false });
          store.createIndex('version', 'version', { unique: false });
          
          console.log('📦 Created IndexedDB object store with indexes');
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * 💾 Core Cache Operations
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    await this.ensureInitialized();

    try {
      let processedData = data;
      
      // Apply compression if requested
      if (options.compress) {
        processedData = await this.compress(data) as T;
      }

      // Apply encryption if requested
      if (options.encrypt) {
        processedData = await this.encrypt(processedData) as T;
      }

      const entry: CacheEntry<T> = {
        key,
        data: processedData,
        timestamp: Date.now(),
        ttl: options.ttl,
        encrypted: options.encrypt,
        compressed: options.compress,
        version: 1,
        metadata: {
          size: this.estimateSize(data),
          type: typeof data,
          syncStrategy: options.syncStrategy || 'manual'
        }
      };

      if (this.db) {
        // Use IndexedDB
        await this.setInIndexedDB(entry);
      } else {
        // Fallback to localStorage
        this.setInLocalStorage(key, entry);
      }

      // Clean up expired entries periodically
      if (Math.random() < 0.1) { // 10% chance
        this.cleanupExpired();
      }

    } catch (error) {
      console.error('Cache set failed:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();

    try {
      let entry: CacheEntry<T> | null = null;

      if (this.db) {
        entry = await this.getFromIndexedDB<T>(key);
      } else {
        entry = this.getFromLocalStorage<T>(key);
      }

      if (!entry) return null;

      // Check if entry has expired
      if (this.isExpired(entry)) {
        await this.remove(key);
        return null;
      }

      let data = entry.data;

      // Apply decryption if needed
      if (entry.encrypted) {
        data = await this.decrypt(data) as T;
      }

      // Apply decompression if needed
      if (entry.compressed) {
        data = await this.decompress(data) as T;
      }

      return data;
    } catch (error) {
      console.error('Cache get failed:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    await this.ensureInitialized();

    try {
      if (this.db) {
        await this.removeFromIndexedDB(key);
      } else {
        localStorage.removeItem(`${this.DB_NAME}_${key}`);
      }
    } catch (error) {
      console.error('Cache remove failed:', error);
    }
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();

    try {
      if (this.db) {
        await this.clearIndexedDB();
      } else {
        // Clear localStorage entries
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`${this.DB_NAME}_`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  }

  /**
   * 📊 Cache Management & Analytics
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    expiredEntries: number;
    oldestEntry: number;
    newestEntry: number;
    encryptedEntries: number;
    compressedEntries: number;
  }> {
    await this.ensureInitialized();

    if (!this.db) {
      return this.getLocalStorageStats();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result;
        const now = Date.now();
        
        const stats = {
          totalEntries: entries.length,
          totalSize: entries.reduce((sum, entry) => sum + (entry.metadata?.size || 0), 0),
          expiredEntries: entries.filter(entry => this.isExpired(entry)).length,
          oldestEntry: Math.min(...entries.map(e => e.timestamp)),
          newestEntry: Math.max(...entries.map(e => e.timestamp)),
          encryptedEntries: entries.filter(e => e.encrypted).length,
          compressedEntries: entries.filter(e => e.compressed).length,
        };
        
        resolve(stats);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async cleanupExpired(): Promise<number> {
    await this.ensureInitialized();

    if (!this.db) {
      return this.cleanupLocalStorageExpired();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      
      let cleanedCount = 0;

      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result;
        const expiredKeys = entries.filter(entry => this.isExpired(entry)).map(e => e.key);
        
        const deletePromises = expiredKeys.map(key => {
          return new Promise<void>((resolveDelete) => {
            const deleteRequest = store.delete(key);
            deleteRequest.onsuccess = () => {
              cleanedCount++;
              resolveDelete();
            };
            deleteRequest.onerror = () => resolveDelete(); // Continue even if one fails
          });
        });

        Promise.all(deletePromises).then(() => {
          console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
          resolve(cleanedCount);
        });
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 🔍 Advanced Query Operations
   */
  async search(pattern: string | RegExp): Promise<Array<{ key: string; data: any; metadata: any }>> {
    await this.ensureInitialized();

    if (!this.db) {
      return this.searchLocalStorage(pattern);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result;
        const results = entries
          .filter(entry => {
            if (typeof pattern === 'string') {
              return entry.key.includes(pattern);
            } else {
              return pattern.test(entry.key);
            }
          })
          .filter(entry => !this.isExpired(entry))
          .map(entry => ({
            key: entry.key,
            data: entry.data,
            metadata: entry.metadata || {}
          }));
        
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 🔐 Encryption/Compression Helpers
   */
  private async encrypt<T>(data: T): Promise<T> {
    // TODO: Implement real encryption with Web Crypto API
    // For now, just return data as-is (development only)
    return data;
  }

  private async decrypt<T>(data: T): Promise<T> {
    // TODO: Implement real decryption
    return data;
  }

  private async compress<T>(data: T): Promise<T> {
    // TODO: Implement compression with CompressionStreams API
    return data;
  }

  private async decompress<T>(data: T): Promise<T> {
    // TODO: Implement decompression
    return data;
  }

  /**
   * 🏪 IndexedDB Operations
   */
  private async setInIndexedDB<T>(entry: CacheEntry<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 📝 LocalStorage Fallback Operations
   */
  private setInLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') {
      console.warn('localStorage not available in SSR environment');
      return;
    }
    
    try {
      localStorage.setItem(`${this.DB_NAME}_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('LocalStorage set failed:', error);
    }
  }

  private getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') {
      console.warn('localStorage not available in SSR environment');
      return null;
    }
    
    try {
      const data = localStorage.getItem(`${this.DB_NAME}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('LocalStorage get failed:', error);
      return null;
    }
  }

  private getLocalStorageStats(): any {
    if (typeof window === 'undefined') {
      return {
        totalEntries: 0,
        totalSize: 0,
        expiredEntries: 0,
        oldestEntry: 0,
        newestEntry: Date.now(),
        encryptedEntries: 0,
        compressedEntries: 0
      };
    }
    
    // Simplified stats for localStorage fallback
    let totalEntries = 0;
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.DB_NAME}_`)) {
        totalEntries++;
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    }

    return {
      totalEntries,
      totalSize,
      expiredEntries: 0, // Would need to parse all entries to calculate
      oldestEntry: 0,
      newestEntry: Date.now(),
      encryptedEntries: 0,
      compressedEntries: 0
    };
  }

  private cleanupLocalStorageExpired(): number {
    if (typeof window === 'undefined') {
      return 0;
    }
    
    let cleanedCount = 0;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.DB_NAME}_`)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (this.isExpired(entry)) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Remove corrupted entries
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

    return cleanedCount;
  }

  private searchLocalStorage(pattern: string | RegExp): Array<{ key: string; data: any; metadata: any }> {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const results = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey?.startsWith(`${this.DB_NAME}_`)) continue;
      
      const key = storageKey.replace(`${this.DB_NAME}_`, '');
      const matches = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
      
      if (matches) {
        try {
          const entry = JSON.parse(localStorage.getItem(storageKey) || '{}');
          if (!this.isExpired(entry)) {
            results.push({
              key,
              data: entry.data,
              metadata: entry.metadata || {}
            });
          }
        } catch (error) {
          // Skip corrupted entries
        }
      }
    }
    
    return results;
  }

  /**
   * 🛠️ Utility Functions
   */
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() > (entry.timestamp + entry.ttl);
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 0;
    }
  }
}

// Singleton export
export const cacheService: CacheService = CacheService.getInstance() as CacheService;
