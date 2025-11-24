"use client"

import type { IGCacheEntry } from "@/types/ig-types"

/**
 * Service for caching Implementation Guide data in the browser
 * Uses IndexedDB for persistent storage with fallback to localStorage
 */
export class CacheService {
  private readonly dbName = 'testscript-crafter-ig-cache'
  private readonly dbVersion = 1
  private readonly storeName = 'ig-data'
  private readonly fallbackPrefix = 'tsc-ig-'
  private db: IDBDatabase | null = null
  private initialized = false

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.db = await this.openIndexedDB()
      this.initialized = true
    } catch (error) {
      console.warn('IndexedDB not available, falling back to localStorage:', error)
      this.initialized = true
    }
  }

  /**
   * Store data in cache with expiration
   */
  async set<T>(key: string, data: T, ttlMs: number = 30 * 60 * 1000): Promise<void> {
    await this.initialize()

    const entry: IGCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttlMs,
      version: '1.0'
    }

    try {
      if (this.db) {
        await this.setIndexedDB(key, entry)
      } else {
        this.setLocalStorage(key, entry)
      }
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }

  /**
   * Retrieve data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    await this.initialize()

    try {
      let entry: IGCacheEntry<T> | null = null

      if (this.db) {
        entry = await this.getIndexedDB<T>(key)
      } else {
        entry = this.getLocalStorage<T>(key)
      }

      if (!entry) return null

      // Check expiration
      if (Date.now() > entry.expires) {
        await this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error)
      return null
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    await this.initialize()

    try {
      if (this.db) {
        await this.deleteIndexedDB(key)
      } else {
        this.deleteLocalStorage(key)
      }
    } catch (error) {
      console.warn('Failed to delete cached data:', error)
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await this.initialize()

    try {
      if (this.db) {
        await this.clearIndexedDB()
      } else {
        this.clearLocalStorage()
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number
    totalSize: number
    expiredEntries: number
    storageType: 'indexeddb' | 'localstorage' | 'none'
  }> {
    await this.initialize()

    try {
      if (this.db) {
        return await this.getIndexedDBStats()
      } else {
        return this.getLocalStorageStats()
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error)
      return {
        totalEntries: 0,
        totalSize: 0,
        expiredEntries: 0,
        storageType: 'none'
      }
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    await this.initialize()

    let cleanedCount = 0

    try {
      if (this.db) {
        cleanedCount = await this.cleanupIndexedDB()
      } else {
        cleanedCount = this.cleanupLocalStorage()
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error)
    }

    return cleanedCount
  }

  // IndexedDB implementation
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  private async setIndexedDB<T>(key: string, entry: IGCacheEntry<T>): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put({ key, ...entry })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async getIndexedDB<T>(key: string): Promise<IGCacheEntry<T> | null> {
    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { key: _, ...entry } = result
          resolve(entry as IGCacheEntry<T>)
        } else {
          resolve(null)
        }
      }
    })
  }

  private async deleteIndexedDB(key: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async getIndexedDBStats(): Promise<{
    totalEntries: number
    totalSize: number
    expiredEntries: number
    storageType: 'indexeddb'
  }> {
    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const entries = request.result
        const now = Date.now()
        let totalSize = 0
        let expiredEntries = 0

        entries.forEach(entry => {
          totalSize += JSON.stringify(entry).length
          if (now > entry.expires) {
            expiredEntries++
          }
        })

        resolve({
          totalEntries: entries.length,
          totalSize,
          expiredEntries,
          storageType: 'indexeddb'
        })
      }
    })
  }

  private async cleanupIndexedDB(): Promise<number> {
    if (!this.db) throw new Error('IndexedDB not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const entries = request.result
        const now = Date.now()
        let cleanedCount = 0

        entries.forEach(entry => {
          if (now > entry.expires) {
            store.delete(entry.key)
            cleanedCount++
          }
        })

        resolve(cleanedCount)
      }
    })
  }

  // localStorage fallback implementation
  private setLocalStorage<T>(key: string, entry: IGCacheEntry<T>): void {
    try {
      const storageKey = this.fallbackPrefix + key
      localStorage.setItem(storageKey, JSON.stringify(entry))
    } catch (error) {
      // Handle quota exceeded or other localStorage errors
      console.warn('localStorage write failed:', error)
    }
  }

  private getLocalStorage<T>(key: string): IGCacheEntry<T> | null {
    try {
      const storageKey = this.fallbackPrefix + key
      const item = localStorage.getItem(storageKey)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('localStorage read failed:', error)
      return null
    }
  }

  private deleteLocalStorage(key: string): void {
    try {
      const storageKey = this.fallbackPrefix + key
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('localStorage delete failed:', error)
    }
  }

  private clearLocalStorage(): void {
    try {
      const keysToDelete: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.fallbackPrefix)) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('localStorage clear failed:', error)
    }
  }

  private getLocalStorageStats(): {
    totalEntries: number
    totalSize: number
    expiredEntries: number
    storageType: 'localstorage'
  } {
    let totalEntries = 0
    let totalSize = 0
    let expiredEntries = 0
    const now = Date.now()

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.fallbackPrefix)) {
          totalEntries++
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += item.length
            try {
              const entry = JSON.parse(item)
              if (now > entry.expires) {
                expiredEntries++
              }
            } catch {
              // Invalid JSON, count as expired
              expiredEntries++
            }
          }
        }
      }
    } catch (error) {
      console.warn('localStorage stats failed:', error)
    }

    return {
      totalEntries,
      totalSize,
      expiredEntries,
      storageType: 'localstorage'
    }
  }

  private cleanupLocalStorage(): number {
    let cleanedCount = 0
    const now = Date.now()
    const keysToDelete: string[] = []

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.fallbackPrefix)) {
          const item = localStorage.getItem(key)
          if (item) {
            try {
              const entry = JSON.parse(item)
              if (now > entry.expires) {
                keysToDelete.push(key)
              }
            } catch {
              // Invalid JSON, delete it
              keysToDelete.push(key)
            }
          }
        }
      }

      keysToDelete.forEach(key => {
        localStorage.removeItem(key)
        cleanedCount++
      })
    } catch (error) {
      console.warn('localStorage cleanup failed:', error)
    }

    return cleanedCount
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null

/**
 * Get the singleton cache service instance
 */
export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService()
  }
  return cacheServiceInstance
}
