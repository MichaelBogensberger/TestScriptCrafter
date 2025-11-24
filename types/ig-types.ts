/**
 * TypeScript interfaces for Implementation Guide integration
 * Provides type safety for IG parsing, Example Instance handling, and Fixture generation
 */

import type { TestScriptFixture } from "./fhir-enhanced"

/**
 * Metadata for an Implementation Guide
 */
export interface IGMetadata {
  /** Unique identifier for the IG */
  id: string
  /** Display name of the IG */
  name: string
  /** Base URL of the IG */
  url: string
  /** Version of the IG */
  version?: string
  /** Publisher information */
  publisher?: string
  /** Description of the IG */
  description?: string
  /** FHIR version compatibility */
  fhirVersion?: string
  /** Last update timestamp */
  lastUpdated?: string
  /** Status of the IG (active, draft, etc.) */
  status?: 'active' | 'draft' | 'retired' | 'unknown'
}

/**
 * Package manifest structure from FHIR IG packages
 */
export interface IGPackageManifest {
  /** Package name */
  name: string
  /** Package version */
  version: string
  /** FHIR version */
  fhirVersion?: string
  /** Package dependencies */
  dependencies?: Record<string, string>
  /** Package files listing */
  files?: IGPackageFile[]
  /** Package metadata */
  author?: string
  description?: string
  license?: string
}

/**
 * Individual file in an IG package
 */
export interface IGPackageFile {
  /** File name */
  filename: string
  /** Resource type (if FHIR resource) */
  resourceType?: string
  /** Resource ID */
  id?: string
  /** File URL */
  url?: string
  /** File version */
  version?: string
  /** File kind (example, profile, etc.) */
  kind?: 'example' | 'profile' | 'extension' | 'terminology' | 'other'
}

/**
 * Example Instance metadata extracted from IG
 */
export interface ExampleInstance {
  /** Unique identifier */
  id: string
  /** Resource type (Patient, Observation, etc.) */
  resourceType: string
  /** Display title */
  title: string
  /** Description of the example */
  description?: string
  /** URL to the example resource */
  url: string
  /** Source IG information */
  source: {
    igId: string
    igName: string
    igUrl: string
  }
  /** Example metadata */
  metadata?: {
    /** Profile this example conforms to */
    profile?: string
    /** Use case or scenario */
    useCase?: string
    /** Tags or categories */
    tags?: string[]
  }
}

/**
 * Generated fixture with IG source information
 */
export interface GeneratedFixture extends TestScriptFixture {
  /** Source type identifier */
  source: 'ig-generated'
  /** Original IG URL */
  igUrl: string
  /** Reference to original resource */
  originalResource: string
  /** Enhanced metadata */
  metadata: {
    /** Display title */
    title: string
    /** Resource type */
    resourceType: string
    /** Description */
    description?: string
    /** Source IG name */
    igName: string
    /** Generation timestamp */
    generatedAt: string
  }
}

/**
 * IG parsing result with error handling
 */
export interface IGParseResult<T> {
  /** Whether parsing was successful */
  success: boolean
  /** Parsed data (if successful) */
  data?: T
  /** Error information (if failed) */
  error?: {
    /** Error code */
    code: string
    /** Human-readable error message */
    message: string
    /** Technical details */
    details?: string
  }
}

/**
 * Configuration for IG sources
 */
export interface IGConfiguration {
  /** List of configured IG sources */
  sources: IGSource[]
}

/**
 * Individual IG source configuration
 */
export interface IGSource {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Base URL */
  url: string
  /** Whether this source is enabled */
  enabled: boolean
  /** Source type */
  type: 'hl7-austria' | 'simplifier' | 'custom'
  /** Additional configuration */
  config?: {
    /** API endpoints */
    endpoints?: {
      manifest?: string
      examples?: string
    }
    /** Authentication if required */
    auth?: {
      type: 'none' | 'bearer' | 'basic'
      credentials?: string
    }
  }
}

/**
 * Cache entry for IG data
 */
export interface IGCacheEntry<T> {
  /** Cached data */
  data: T
  /** Cache timestamp */
  timestamp: number
  /** Expiry timestamp */
  expires: number
  /** Cache version for invalidation */
  version: string
}

/**
 * Search and filter options for Example Instances
 */
export interface ExampleInstanceFilter {
  /** Text search query */
  query?: string
  /** Filter by resource type */
  resourceType?: string
  /** Filter by source IG */
  igId?: string
  /** Filter by tags */
  tags?: string[]
  /** Sort options */
  sort?: {
    field: 'title' | 'resourceType' | 'lastUpdated'
    direction: 'asc' | 'desc'
  }
  /** Pagination */
  pagination?: {
    page: number
    pageSize: number
  }
}

/**
 * Search result for Example Instances
 */
export interface ExampleInstanceSearchResult {
  /** Found instances */
  instances: ExampleInstance[]
  /** Total count (for pagination) */
  total: number
  /** Current page */
  page: number
  /** Page size */
  pageSize: number
  /** Search metadata */
  metadata: {
    /** Search duration in ms */
    duration: number
    /** Applied filters */
    filters: ExampleInstanceFilter
  }
}
