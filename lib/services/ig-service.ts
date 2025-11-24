"use client"

import type {
  IGMetadata,
  IGPackageManifest,
  ExampleInstance,
  IGParseResult,
  IGConfiguration,
  IGSource,
  ExampleInstanceFilter,
  ExampleInstanceSearchResult,
} from "@/types/ig-types"
import { getCacheService } from "./cache-service"
import { getIGConfigStorage } from "./ig-config-storage"

/**
 * Service for parsing and managing FHIR Implementation Guides
 * Provides functionality to load IG metadata, parse Example Instances, and search resources
 */
export class IGService {
  private memoryCache = new Map<string, any>()
  private cacheService = getCacheService()
  private configStorage = getIGConfigStorage()
  private readonly defaultTimeout = 10000 // 10 seconds
  private readonly defaultCacheTTL = 30 * 60 * 1000 // 30 minutes

  /**
   * HL7 Austria Implementation Guide sources
   * Focused on Austrian IGs with verified functionality
   */
  private readonly defaultSources: IGSource[] = [
    {
      id: 'hl7-at-core-80-testscripts',
      name: 'HL7 Austria Core 8.0 (mit TestScripts)',
      url: 'https://fhir.hl7.at/r4-core-80-include-testscripts',
      enabled: true,
      type: 'hl7-austria',
      config: {
        endpoints: {
          manifest: '/package.json',
          examples: '/artifacts.html'
        }
      }
    },
    {
      id: 'hl7-at-core-r5',
      name: 'HL7 Austria Core R5',
      url: 'https://fhir.hl7.at/HL7-AT-FHIR-Core-R5',
      enabled: true,
      type: 'hl7-austria',
      config: {
        endpoints: {
          manifest: '/package.json',
          examples: '/artifacts.html'
        }
      }
    },
    {
      id: 'hl7-at-core-r4',
      name: 'HL7 Austria Core R4 (Standard)',
      url: 'https://fhir.hl7.at/r4-core-main',
      enabled: false, // Möglicherweise keine Examples
      type: 'hl7-austria',
      config: {
        endpoints: {
          manifest: '/package.json',
          examples: '/artifacts.html'
        }
      }
    }
  ]

  /**
   * Load Implementation Guide metadata from URL
   */
  async loadIGMetadata(igUrl: string): Promise<IGParseResult<IGMetadata>> {
    try {
      const cacheKey = `ig-metadata-${igUrl}`
      
      // Check memory cache first
      if (this.memoryCache.has(cacheKey)) {
        return {
          success: true,
          data: this.memoryCache.get(cacheKey)
        }
      }

      // Check persistent cache
      const cachedData = await this.cacheService.get<IGMetadata>(cacheKey)
      if (cachedData) {
        this.memoryCache.set(cacheKey, cachedData)
        return {
          success: true,
          data: cachedData
        }
      }

      // Try to load package.json first
      const packageResult = await this.loadPackageManifest(igUrl)
      if (packageResult.success && packageResult.data) {
        const metadata: IGMetadata = {
          id: this.generateIGId(igUrl),
          name: packageResult.data.name || this.extractNameFromUrl(igUrl),
          url: igUrl,
          version: packageResult.data.version,
          description: packageResult.data.description,
          fhirVersion: packageResult.data.fhirVersion,
          lastUpdated: new Date().toISOString(),
          status: 'active'
        }

        // Cache the metadata
        this.memoryCache.set(cacheKey, metadata)
        await this.cacheService.set(cacheKey, metadata, this.defaultCacheTTL)
        return { success: true, data: metadata }
      }

      // Fallback: Create metadata from URL
      const fallbackMetadata: IGMetadata = {
        id: this.generateIGId(igUrl),
        name: this.extractNameFromUrl(igUrl),
        url: igUrl,
        lastUpdated: new Date().toISOString(),
        status: 'unknown'
      }

      return { success: true, data: fallbackMetadata }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'IG_METADATA_LOAD_FAILED',
          message: 'Failed to load Implementation Guide metadata',
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Load package manifest (package.json) from IG
   */
  async loadPackageManifest(igUrl: string): Promise<IGParseResult<IGPackageManifest>> {
    try {
      const manifestUrl = `${igUrl.replace(/\/$/, '')}/package.json`
      
      const response = await fetch(manifestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(this.defaultTimeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const manifest: IGPackageManifest = await response.json()
      
      return { success: true, data: manifest }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PACKAGE_MANIFEST_LOAD_FAILED',
          message: 'Failed to load package manifest',
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Parse Example Instances from IG artifacts page
   */
  async parseExampleInstances(igUrl: string): Promise<IGParseResult<ExampleInstance[]>> {
    try {
      const cacheKey = `examples-${igUrl}`
      
      // Check memory cache first
      if (this.memoryCache.has(cacheKey)) {
        return {
          success: true,
          data: this.memoryCache.get(cacheKey)
        }
      }

      // Check persistent cache
      const cachedData = await this.cacheService.get<ExampleInstance[]>(cacheKey)
      if (cachedData) {
        this.memoryCache.set(cacheKey, cachedData)
        return {
          success: true,
          data: cachedData
        }
      }

      // Load IG metadata first
      const metadataResult = await this.loadIGMetadata(igUrl)
      if (!metadataResult.success || !metadataResult.data) {
        throw new Error('Failed to load IG metadata')
      }

      const igMetadata = metadataResult.data

      // Try to parse from artifacts.html
      const artifactsUrl = `${igUrl.replace(/\/$/, '')}/artifacts.html`
      const examples = await this.parseArtifactsPage(artifactsUrl, igMetadata)

      // Cache the examples
      this.memoryCache.set(cacheKey, examples)
      await this.cacheService.set(cacheKey, examples, this.defaultCacheTTL)
      return { success: true, data: examples }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXAMPLE_INSTANCES_PARSE_FAILED',
          message: 'Failed to parse Example Instances',
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Parse artifacts.html page to extract Example Instances
   */
  private async parseArtifactsPage(artifactsUrl: string, igMetadata: IGMetadata): Promise<ExampleInstance[]> {
    try {
      const response = await fetch(artifactsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(this.defaultTimeout)
      })

      if (!response.ok) {
        throw new Error(`Failed to load artifacts page: ${response.status}`)
      }

      const html = await response.text()
      return this.extractExamplesFromHTML(html, igMetadata)

    } catch (error) {
      console.warn('Failed to parse artifacts page, returning empty examples:', error)
      return []
    }
  }

  /**
   * Extract Example Instances from HTML content
   */
  private extractExamplesFromHTML(html: string, igMetadata: IGMetadata): ExampleInstance[] {
    const examples: ExampleInstance[] = []
    
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // Look for example links in various patterns
      const linkSelectors = [
        'a[href*="Patient-"]',
        'a[href*="Observation-"]',
        'a[href*="Encounter-"]',
        'a[href*="Practitioner-"]',
        'a[href*="Organization-"]',
        'a[href*="Example"]',
        'a[href$=".html"][href*="-"]'
      ]

      linkSelectors.forEach(selector => {
        const links = doc.querySelectorAll(selector)
        links.forEach(link => {
          const href = link.getAttribute('href')
          const text = link.textContent?.trim()
          
          if (href && text && this.isExampleLink(href, text)) {
            const example = this.createExampleFromLink(href, text, igMetadata)
            if (example && !examples.find(e => e.id === example.id)) {
              examples.push(example)
            }
          }
        })
      })

    } catch (error) {
      console.warn('Error parsing HTML for examples:', error)
    }

    return examples
  }

  /**
   * Check if a link represents an Example Instance
   */
  private isExampleLink(href: string, text: string): boolean {
    // Skip navigation and non-example links
    if (href.includes('#') || href.includes('index.html') || href.includes('toc.html')) {
      return false
    }

    // Look for example patterns
    const examplePatterns = [
      /Patient-.*\.html$/,
      /Observation-.*\.html$/,
      /Encounter-.*\.html$/,
      /Practitioner-.*\.html$/,
      /Organization-.*\.html$/,
      /.*Example.*\.html$/,
      /.*-example.*\.html$/i
    ]

    return examplePatterns.some(pattern => pattern.test(href)) ||
           text.toLowerCase().includes('example') ||
           /^[A-Z][a-zA-Z]*-[A-Za-z0-9]+$/.test(text)
  }

  /**
   * Create ExampleInstance from link information
   */
  private createExampleFromLink(href: string, text: string, igMetadata: IGMetadata): ExampleInstance | null {
    try {
      // Extract resource type and ID from href
      const match = href.match(/([A-Z][a-zA-Z]*)-([A-Za-z0-9\-_]+)\.html$/)
      if (!match) return null

      const [, resourceType, resourceId] = match
      const fullUrl = href.startsWith('http') ? href : `${igMetadata.url}/${href}`

      return {
        id: `${igMetadata.id}-${resourceType}-${resourceId}`,
        resourceType,
        title: text || `${resourceType} Example`,
        description: `Example ${resourceType} from ${igMetadata.name}`,
        url: fullUrl,
        source: {
          igId: igMetadata.id,
          igName: igMetadata.name,
          igUrl: igMetadata.url
        },
        metadata: {
          useCase: 'Example Instance',
          tags: ['example', resourceType.toLowerCase()]
        }
      }
    } catch (error) {
      console.warn('Error creating example from link:', error)
      return null
    }
  }

  /**
   * Search Example Instances with filters
   */
  async searchExampleInstances(
    sources: IGSource[],
    filter: ExampleInstanceFilter = {}
  ): Promise<ExampleInstanceSearchResult> {
    const startTime = Date.now()
    let allInstances: ExampleInstance[] = []

    // Load examples from all enabled sources
    for (const source of sources.filter(s => s.enabled)) {
      try {
        const result = await this.parseExampleInstances(source.url)
        if (result.success && result.data) {
          // Map the source ID to the examples for proper filtering
          const mappedExamples = result.data.map(example => ({
            ...example,
            source: {
              ...example.source,
              igId: source.id // Use the actual source ID for filtering
            }
          }))
          allInstances.push(...mappedExamples)
        }
      } catch (error) {
        console.warn(`Failed to load examples from ${source.name}:`, error)
      }
    }

    // Apply filters
    let filteredInstances = allInstances

    if (filter.query) {
      const query = filter.query.toLowerCase()
      filteredInstances = filteredInstances.filter(instance =>
        instance.title.toLowerCase().includes(query) ||
        instance.description?.toLowerCase().includes(query) ||
        instance.resourceType.toLowerCase().includes(query)
      )
    }

    if (filter.resourceType) {
      filteredInstances = filteredInstances.filter(instance =>
        instance.resourceType === filter.resourceType
      )
    }

    if (filter.igId) {
      filteredInstances = filteredInstances.filter(instance =>
        instance.source.igId === filter.igId
      )
    }

    if (filter.tags && filter.tags.length > 0) {
      filteredInstances = filteredInstances.filter(instance =>
        filter.tags!.some(tag =>
          instance.metadata?.tags?.includes(tag)
        )
      )
    }

    // Apply sorting
    if (filter.sort) {
      filteredInstances.sort((a, b) => {
        const { field, direction } = filter.sort!
        let aValue: string, bValue: string

        switch (field) {
          case 'title':
            aValue = a.title
            bValue = b.title
            break
          case 'resourceType':
            aValue = a.resourceType
            bValue = b.resourceType
            break
          case 'lastUpdated':
            aValue = a.source.igName // Fallback to IG name
            bValue = b.source.igName
            break
          default:
            aValue = a.title
            bValue = b.title
        }

        const comparison = aValue.localeCompare(bValue)
        return direction === 'desc' ? -comparison : comparison
      })
    }

    // Apply pagination
    const page = filter.pagination?.page || 1
    const pageSize = filter.pagination?.pageSize || 20
    const startIndex = (page - 1) * pageSize
    const paginatedInstances = filteredInstances.slice(startIndex, startIndex + pageSize)

    return {
      instances: paginatedInstances,
      total: filteredInstances.length,
      page,
      pageSize,
      metadata: {
        duration: Date.now() - startTime,
        filters: filter
      }
    }
  }

  /**
   * Get default IG configuration (merged with saved preferences)
   */
  getDefaultConfiguration(): IGConfiguration {
    const defaultConfig: IGConfiguration = {
      sources: [...this.defaultSources]
    }

    // Merge with saved configuration
    return this.configStorage.mergeWithDefaults(defaultConfig)
  }

  /**
   * Save IG configuration to persistent storage
   */
  saveConfiguration(config: IGConfiguration): void {
    this.configStorage.saveConfiguration(config)
  }

  /**
   * Get configuration storage info
   */
  getConfigurationStorageInfo() {
    return this.configStorage.getStorageInfo()
  }

  /**
   * Generate unique IG ID from URL
   */
  private generateIGId(url: string): string {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
  }

  /**
   * Extract readable name from IG URL
   */
  private extractNameFromUrl(url: string): string {
    const parts = url.replace(/^https?:\/\//, '').split('/')
    return parts[parts.length - 1] || parts[parts.length - 2] || 'Unknown IG'
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  async clearCache(): Promise<void> {
    this.memoryCache.clear()
    await this.cacheService.clear()
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cacheService.getStats()
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupCache(): Promise<number> {
    return await this.cacheService.cleanup()
  }
}
