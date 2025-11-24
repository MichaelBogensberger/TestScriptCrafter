"use client"

import type { IGConfiguration } from "@/types/ig-types"

/**
 * Service for persisting IG configuration in localStorage
 * Handles saving and loading of IG source states (enabled/disabled)
 */
export class IGConfigStorageService {
  private readonly storageKey = 'testscript-crafter-ig-config'
  private readonly version = '1.0'

  /**
   * Save IG configuration to localStorage
   */
  saveConfiguration(config: IGConfiguration): void {
    try {
      const storageData = {
        version: this.version,
        timestamp: Date.now(),
        config: {
          sources: config.sources.map(source => ({
            id: source.id,
            enabled: source.enabled,
            // Only save essential fields to avoid storage bloat
            name: source.name,
            type: source.type
          }))
        }
      }

      localStorage.setItem(this.storageKey, JSON.stringify(storageData))
    } catch (error) {
      console.warn('Failed to save IG configuration:', error)
    }
  }

  /**
   * Load IG configuration from localStorage
   */
  loadConfiguration(): Partial<IGConfiguration> | null {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return null

      const storageData = JSON.parse(stored)
      
      // Check version compatibility
      if (storageData.version !== this.version) {
        console.warn('IG configuration version mismatch, ignoring stored config')
        return null
      }

      // Check if data is not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
      if (Date.now() - storageData.timestamp > maxAge) {
        console.warn('IG configuration too old, ignoring stored config')
        return null
      }

      return storageData.config
    } catch (error) {
      console.warn('Failed to load IG configuration:', error)
      return null
    }
  }

  /**
   * Merge saved configuration with default configuration
   */
  mergeWithDefaults(defaultConfig: IGConfiguration): IGConfiguration {
    const savedConfig = this.loadConfiguration()
    if (!savedConfig || !savedConfig.sources) {
      return defaultConfig
    }

    // Create a map of saved source states
    const savedSourceStates = new Map(
      savedConfig.sources.map(source => [source.id, source.enabled])
    )

    // Apply saved states to default sources
    const mergedSources = defaultConfig.sources.map(source => ({
      ...source,
      enabled: savedSourceStates.has(source.id) 
        ? savedSourceStates.get(source.id)! 
        : source.enabled
    }))

    return {
      ...defaultConfig,
      sources: mergedSources
    }
  }

  /**
   * Clear saved configuration
   */
  clearConfiguration(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('Failed to clear IG configuration:', error)
    }
  }

  /**
   * Get storage statistics
   */
  getStorageInfo(): { hasStoredConfig: boolean; timestamp?: number; size?: number } {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return { hasStoredConfig: false }
      }

      const storageData = JSON.parse(stored)
      return {
        hasStoredConfig: true,
        timestamp: storageData.timestamp,
        size: stored.length
      }
    } catch (error) {
      return { hasStoredConfig: false }
    }
  }
}

// Singleton instance
let configStorageInstance: IGConfigStorageService | null = null

/**
 * Get the singleton config storage service instance
 */
export function getIGConfigStorage(): IGConfigStorageService {
  if (!configStorageInstance) {
    configStorageInstance = new IGConfigStorageService()
  }
  return configStorageInstance
}
