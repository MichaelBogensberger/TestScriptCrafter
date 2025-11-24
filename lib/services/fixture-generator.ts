"use client"

import type { TestScriptFixture } from "@/types/fhir-enhanced"
import type { ExampleInstance, GeneratedFixture, IGParseResult } from "@/types/ig-types"

/**
 * Service for generating TestScript Fixtures from Implementation Guide Example Instances
 * Handles conversion, validation, and metadata enrichment
 */
export class FixtureGeneratorService {
  private readonly defaultTimeout = 10000 // 10 seconds

  /**
   * Generate a TestScript Fixture from an Example Instance
   */
  async generateFixture(example: ExampleInstance): Promise<IGParseResult<GeneratedFixture>> {
    try {
      // Validate input
      if (!example.id || !example.resourceType || !example.url) {
        return {
          success: false,
          error: {
            code: 'INVALID_EXAMPLE_INSTANCE',
            message: 'Example Instance must have id, resourceType, and url',
            details: `Missing required fields in example: ${JSON.stringify(example)}`
          }
        }
      }

      // Generate fixture ID
      const fixtureId = this.generateFixtureId(example)

      // Create resource reference
      const resourceReference = this.createResourceReference(example)

      // Build the generated fixture
      const generatedFixture: GeneratedFixture = {
        id: fixtureId,
        autocreate: false,
        autodelete: false,
        resource: resourceReference,
        source: 'ig-generated',
        igUrl: example.source.igUrl,
        originalResource: example.url,
        metadata: {
          title: example.title,
          resourceType: example.resourceType,
          description: example.description,
          igName: example.source.igName,
          generatedAt: new Date().toISOString()
        }
      }

      // Validate the generated fixture
      const validationResult = this.validateGeneratedFixture(generatedFixture)
      if (!validationResult.success) {
        return validationResult
      }

      return { success: true, data: generatedFixture }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIXTURE_GENERATION_FAILED',
          message: 'Failed to generate fixture from Example Instance',
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Generate multiple fixtures from Example Instances
   */
  async generateFixtures(examples: ExampleInstance[]): Promise<IGParseResult<GeneratedFixture[]>> {
    try {
      const fixtures: GeneratedFixture[] = []
      const errors: string[] = []

      for (const example of examples) {
        const result = await this.generateFixture(example)
        
        if (result.success && result.data) {
          fixtures.push(result.data)
        } else {
          errors.push(`${example.id}: ${result.error?.message || 'Unknown error'}`)
        }
      }

      if (fixtures.length === 0 && errors.length > 0) {
        return {
          success: false,
          error: {
            code: 'ALL_FIXTURES_GENERATION_FAILED',
            message: 'Failed to generate any fixtures',
            details: errors.join('; ')
          }
        }
      }

      return { success: true, data: fixtures }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_FIXTURE_GENERATION_FAILED',
          message: 'Failed to generate fixtures batch',
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Convert a Generated Fixture to a standard TestScript Fixture
   */
  convertToTestScriptFixture(generatedFixture: GeneratedFixture): TestScriptFixture {
    return {
      id: generatedFixture.id,
      autocreate: generatedFixture.autocreate,
      autodelete: generatedFixture.autodelete,
      resource: generatedFixture.resource
    }
  }

  /**
   * Enrich fixture with additional metadata from the original resource
   */
  async enrichFixtureWithResourceData(
    fixture: GeneratedFixture,
    fetchResourceData: boolean = false
  ): Promise<IGParseResult<GeneratedFixture>> {
    try {
      if (!fetchResourceData) {
        return { success: true, data: fixture }
      }

      // Attempt to fetch the actual FHIR resource for additional metadata
      const resourceData = await this.fetchResourceMetadata(fixture.originalResource)
      
      if (resourceData.success && resourceData.data) {
        const enrichedFixture: GeneratedFixture = {
          ...fixture,
          metadata: {
            ...fixture.metadata,
            description: resourceData.data.description || fixture.metadata.description,
            // Add any additional metadata from the resource
          }
        }

        return { success: true, data: enrichedFixture }
      }

      // Return original fixture if enrichment fails
      return { success: true, data: fixture }

    } catch (error) {
      // Return original fixture on error, don't fail the entire operation
      console.warn('Failed to enrich fixture with resource data:', error)
      return { success: true, data: fixture }
    }
  }

  /**
   * Generate a unique fixture ID from Example Instance
   */
  private generateFixtureId(example: ExampleInstance): string {
    // Create a readable, unique ID
    const baseName = example.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const resourceType = example.resourceType.toLowerCase()
    const igPrefix = example.source.igId.replace(/[^a-z0-9]/g, '-')

    return `${igPrefix}-${resourceType}-${baseName}`.substring(0, 64) // Limit length
  }

  /**
   * Create resource reference from Example Instance
   */
  private createResourceReference(example: ExampleInstance): TestScriptFixture['resource'] {
    // Extract resource ID from URL if possible
    const urlParts = example.url.split('/')
    const htmlFile = urlParts[urlParts.length - 1]
    const resourceId = htmlFile?.replace('.html', '') || example.id

    return {
      reference: `${example.resourceType}/${resourceId}`,
      type: example.resourceType,
      display: example.title
    }
  }

  /**
   * Validate a generated fixture
   */
  private validateGeneratedFixture(fixture: GeneratedFixture): IGParseResult<GeneratedFixture> {
    const errors: string[] = []

    // Check required fields
    if (!fixture.id) {
      errors.push('Fixture must have an ID')
    }

    if (!fixture.resource?.reference) {
      errors.push('Fixture must have a resource reference')
    }

    if (!fixture.metadata?.resourceType) {
      errors.push('Fixture metadata must include resourceType')
    }

    if (!fixture.metadata?.title) {
      errors.push('Fixture metadata must include title')
    }

    if (!fixture.originalResource) {
      errors.push('Fixture must reference original resource URL')
    }

    // Check ID format
    if (fixture.id && !/^[a-zA-Z0-9\-_]+$/.test(fixture.id)) {
      errors.push('Fixture ID must contain only alphanumeric characters, hyphens, and underscores')
    }

    // Check resource reference format
    if (fixture.resource?.reference && !/^[A-Z][a-zA-Z]*\/[a-zA-Z0-9\-_.]+$/.test(fixture.resource.reference)) {
      errors.push('Resource reference must be in format ResourceType/id')
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          code: 'FIXTURE_VALIDATION_FAILED',
          message: 'Generated fixture failed validation',
          details: errors.join('; ')
        }
      }
    }

    return { success: true, data: fixture }
  }

  /**
   * Fetch metadata from the original resource URL
   */
  private async fetchResourceMetadata(resourceUrl: string): Promise<IGParseResult<{ description?: string }>> {
    try {
      const response = await fetch(resourceUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/json',
        },
        signal: AbortSignal.timeout(this.defaultTimeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        // Handle JSON FHIR resource
        const resource = await response.json()
        return {
          success: true,
          data: {
            description: resource.description || resource.text?.div
          }
        }
      } else if (contentType.includes('text/html')) {
        // Handle HTML page - extract description from meta tags or content
        const html = await response.text()
        const description = this.extractDescriptionFromHTML(html)
        return {
          success: true,
          data: { description }
        }
      }

      return { success: true, data: {} }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESOURCE_METADATA_FETCH_FAILED',
          message: 'Failed to fetch resource metadata',
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Extract description from HTML content
   */
  private extractDescriptionFromHTML(html: string): string | undefined {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Try meta description first
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content')
      if (metaDescription) {
        return metaDescription
      }

      // Try to find description in common patterns
      const descriptionSelectors = [
        '.description',
        '.summary',
        'p:first-of-type',
        '.lead'
      ]

      for (const selector of descriptionSelectors) {
        const element = doc.querySelector(selector)
        if (element?.textContent?.trim()) {
          return element.textContent.trim().substring(0, 200) // Limit length
        }
      }

      return undefined

    } catch (error) {
      console.warn('Error extracting description from HTML:', error)
      return undefined
    }
  }

  /**
   * Create a preview of what the fixture will look like
   */
  createFixturePreview(example: ExampleInstance): Partial<GeneratedFixture> {
    return {
      id: this.generateFixtureId(example),
      resource: this.createResourceReference(example),
      metadata: {
        title: example.title,
        resourceType: example.resourceType,
        description: example.description,
        igName: example.source.igName,
        generatedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Check if an Example Instance can be converted to a fixture
   */
  canGenerateFixture(example: ExampleInstance): { canGenerate: boolean; reason?: string } {
    if (!example.id) {
      return { canGenerate: false, reason: 'Missing example ID' }
    }

    if (!example.resourceType) {
      return { canGenerate: false, reason: 'Missing resource type' }
    }

    if (!example.url) {
      return { canGenerate: false, reason: 'Missing resource URL' }
    }

    if (!example.title) {
      return { canGenerate: false, reason: 'Missing example title' }
    }

    return { canGenerate: true }
  }
}
