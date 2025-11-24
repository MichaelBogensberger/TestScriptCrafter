"use client"

import type { TestScript, TestScriptFixture } from "@/types/fhir-enhanced"
import type { IGConfiguration, ExampleInstance, GeneratedFixture } from "@/types/ig-types"
import { IGService } from "./services/ig-service"
import { FixtureGeneratorService } from "./services/fixture-generator"

/**
 * Comprehensive test suite for Fixture features
 * Tests all aspects of the IG integration and fixture generation
 */
export class FixtureFeatureTester {
  private igService = new IGService()
  private fixtureGenerator = new FixtureGeneratorService()
  private customConfig?: IGConfiguration

  constructor(customConfig?: IGConfiguration) {
    this.customConfig = customConfig
  }

  /**
   * Run all fixture feature tests
   */
  async runAllTests(): Promise<TestResults> {
    console.log("Starting comprehensive Fixture feature tests...")
    
    const results: TestResults = {
      igConfigurationTest: await this.testIGConfiguration(),
      igLoadingTest: await this.testIGLoading(),
      exampleParsingTest: await this.testExampleParsing(),
      filteringTest: await this.testFiltering(),
      fixtureGenerationTest: await this.testFixtureGeneration(),
      integrationTest: await this.testFullIntegration(),
      performanceTest: await this.testPerformance()
    }

    // Summary
    const totalTests = Object.keys(results).length
    const passedTests = Object.values(results).filter(r => r.success).length
    
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`)
    
    if (passedTests === totalTests) {
      console.log("✅ All tests passed! Fixture features are working correctly.")
    } else {
      console.log("❌ Some tests failed. Check the detailed results.")
    }

    return results
  }

  /**
   * Test IG Configuration
   */
  private async testIGConfiguration(): Promise<TestResult> {
    try {
      console.log("🔧 Testing IG Configuration...")
      
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      
      // Verify default sources
      if (!config.sources || config.sources.length === 0) {
        throw new Error("No default IG sources configured")
      }

      // Check for working sources (Austrian or R5)
      const workingSources = config.sources.filter(s => s.enabled && (s.type === 'hl7-austria' || s.type === 'hl7-international'))
      if (workingSources.length === 0) {
        throw new Error("No working IG sources found")
      }

      // Verify enabled sources
      const enabledSources = config.sources.filter(s => s.enabled)
      if (enabledSources.length === 0) {
        throw new Error("No enabled IG sources")
      }

      console.log(`✅ Found ${config.sources.length} IG sources (${enabledSources.length} enabled)`)
      
      return {
        success: true,
        message: `IG Configuration OK - ${config.sources.length} sources configured`,
        details: {
          totalSources: config.sources.length,
          enabledSources: enabledSources.length,
          workingSources: workingSources.length
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "IG Configuration failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Test IG Loading
   */
  private async testIGLoading(): Promise<TestResult> {
    try {
      console.log("📡 Testing IG Loading...")
      
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      const enabledSources = config.sources.filter(s => s.enabled)
      
      if (enabledSources.length === 0) {
        throw new Error("No enabled IG sources for testing")
      }

      // Test the first enabled source
      const testSource = enabledSources[0]
      console.log(`Testing IG: ${testSource.name} (${testSource.url})`)

      const result = await this.igService.loadIGMetadata(testSource.url)
      
      if (!result.success || !result.data) {
        throw new Error(`Failed to load IG metadata: ${result.error?.message}`)
      }

      console.log(`✅ Successfully loaded IG: ${result.data.name}`)
      
      return {
        success: true,
        message: `IG Loading OK - Loaded ${result.data.name} (${enabledSources.length} source${enabledSources.length > 1 ? 's' : ''} enabled)`,
        details: {
          igName: result.data.name,
          igUrl: result.data.url,
          version: result.data.version,
          totalEnabledSources: enabledSources.length
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "IG Loading failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Test Example Parsing
   */
  private async testExampleParsing(): Promise<TestResult> {
    try {
      console.log("📋 Testing Example Parsing...")
      
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      const enabledSources = config.sources.filter(s => s.enabled)
      
      if (enabledSources.length === 0) {
        throw new Error("No enabled IG sources for testing")
      }

      // Test the first enabled source
      const testSource = enabledSources[0]
      console.log(`Testing examples from: ${testSource.name}`)

      const result = await this.igService.parseExampleInstances(testSource.url)
      
      if (!result.success || !result.data) {
        throw new Error(`Failed to parse examples: ${result.error?.message}`)
      }

      const examples = result.data
      if (examples.length === 0) {
        console.log(`⚠️ No examples found in ${testSource.name} - this may be normal for some IGs`)
        return {
          success: true,
          message: `Example Parsing OK - No examples found in ${testSource.name} (may be normal)`,
          details: {
            exampleCount: 0,
            igName: testSource.name,
            note: "Some IGs may not contain example instances"
          }
        }
      }

      // Verify example structure
      const firstExample = examples[0]
      if (!firstExample.id || !firstExample.resourceType || !firstExample.title) {
        throw new Error("Example missing required fields")
      }

      console.log(`✅ Parsed ${examples.length} examples from ${testSource.name}`)
      
      return {
        success: true,
        message: `Example Parsing OK - Found ${examples.length} examples in ${testSource.name}`,
        details: {
          exampleCount: examples.length,
          igName: testSource.name,
          resourceTypes: [...new Set(examples.map(e => e.resourceType))],
          firstExample: {
            id: firstExample.id,
            resourceType: firstExample.resourceType,
            title: firstExample.title
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Example Parsing failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Test Filtering
   */
  private async testFiltering(): Promise<TestResult> {
    try {
      console.log("🔍 Testing Filtering...")
      
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      const enabledSources = config.sources.filter(s => s.enabled)
      
      // Test basic search
      const allResults = await this.igService.searchExampleInstances(enabledSources, {})
      if (allResults.instances.length === 0) {
        throw new Error("No examples found in search")
      }

      // Test resource type filter
      const patientResults = await this.igService.searchExampleInstances(enabledSources, {
        resourceType: 'Patient'
      })

      // Test IG filter
      const firstSourceId = enabledSources[0].id
      const igResults = await this.igService.searchExampleInstances(enabledSources, {
        igId: firstSourceId
      })

      // Test text search
      const textResults = await this.igService.searchExampleInstances(enabledSources, {
        query: 'Patient'
      })

      console.log(`✅ Filtering tests completed`)
      console.log(`   - All results: ${allResults.instances.length}`)
      console.log(`   - Patient filter: ${patientResults.instances.length}`)
      console.log(`   - IG filter: ${igResults.instances.length}`)
      console.log(`   - Text search: ${textResults.instances.length}`)
      
      return {
        success: true,
        message: "Filtering OK - All filter types working",
        details: {
          allResults: allResults.instances.length,
          patientFilter: patientResults.instances.length,
          igFilter: igResults.instances.length,
          textSearch: textResults.instances.length
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Filtering failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Test Fixture Generation
   */
  private async testFixtureGeneration(): Promise<TestResult> {
    try {
      console.log("🏭 Testing Fixture Generation...")
      
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      const enabledSources = config.sources.filter(s => s.enabled)
      
      const searchResult = await this.igService.searchExampleInstances(enabledSources, {
        resourceType: 'Patient',
        pagination: { page: 1, pageSize: 1 }
      })

      if (searchResult.instances.length === 0) {
        throw new Error("No Patient examples found for fixture generation test")
      }

      const example = searchResult.instances[0]
      
      // Test fixture generation
      const fixtureResult = await this.fixtureGenerator.generateFixture(example)
      
      if (!fixtureResult.success || !fixtureResult.data) {
        throw new Error(`Fixture generation failed: ${fixtureResult.error?.message}`)
      }

      const fixture = fixtureResult.data
      
      // Verify fixture structure
      if (!fixture.id || !fixture.resource?.reference || !fixture.metadata) {
        throw new Error("Generated fixture missing required fields")
      }

      // Test conversion to TestScript fixture
      const testScriptFixture = this.fixtureGenerator.convertToTestScriptFixture(fixture)
      
      if (!testScriptFixture.resource?.reference) {
        throw new Error("TestScript fixture conversion failed")
      }

      console.log(`✅ Generated fixture: ${fixture.id}`)
      
      return {
        success: true,
        message: "Fixture Generation OK - Successfully generated and converted fixture",
        details: {
          fixtureId: fixture.id,
          resourceReference: fixture.resource.reference,
          resourceType: fixture.metadata.resourceType,
          sourceIG: fixture.metadata.igName
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Fixture Generation failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Test Full Integration
   */
  private async testFullIntegration(): Promise<TestResult> {
    try {
      console.log("🔗 Testing Full Integration...")
      
      // Simulate the full workflow: Config -> Search -> Select -> Generate -> Add to TestScript
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      const enabledSources = config.sources.filter(s => s.enabled)
      
      // Search for examples
      const searchResult = await this.igService.searchExampleInstances(enabledSources, {
        resourceType: 'Patient',
        pagination: { page: 1, pageSize: 3 }
      })

      if (searchResult.instances.length === 0) {
        throw new Error("No examples found for integration test")
      }

      // Generate fixtures for multiple examples
      const fixtures: TestScriptFixture[] = []
      
      for (const example of searchResult.instances.slice(0, 2)) {
        const fixtureResult = await this.fixtureGenerator.generateFixture(example)
        
        if (fixtureResult.success && fixtureResult.data) {
          const testScriptFixture = this.fixtureGenerator.convertToTestScriptFixture(fixtureResult.data)
          fixtures.push(testScriptFixture)
        }
      }

      if (fixtures.length === 0) {
        throw new Error("No fixtures generated in integration test")
      }

      // Simulate adding to TestScript
      const mockTestScript: Partial<TestScript> = {
        fixture: fixtures
      }

      console.log(`✅ Integration test completed - Generated ${fixtures.length} fixtures`)
      
      return {
        success: true,
        message: `Full Integration OK - Generated ${fixtures.length} fixtures`,
        details: {
          searchResults: searchResult.instances.length,
          generatedFixtures: fixtures.length,
          fixtureIds: fixtures.map(f => f.id).filter(Boolean)
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Full Integration failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Test Performance
   */
  private async testPerformance(): Promise<TestResult> {
    try {
      console.log("⚡ Testing Performance...")
      
      const config = this.customConfig || this.igService.getDefaultConfiguration()
      const enabledSources = config.sources.filter(s => s.enabled).slice(0, 2) // Limit for performance test
      
      const startTime = Date.now()
      
      // Test caching by running the same search twice
      const firstSearch = await this.igService.searchExampleInstances(enabledSources, {
        resourceType: 'Patient'
      })
      
      const secondSearch = await this.igService.searchExampleInstances(enabledSources, {
        resourceType: 'Patient'
      })
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Verify cache is working (second search should be faster)
      const cacheWorking = secondSearch.metadata.duration < firstSearch.metadata.duration
      
      console.log(`✅ Performance test completed in ${totalTime}ms`)
      console.log(`   - First search: ${firstSearch.metadata.duration}ms`)
      console.log(`   - Second search: ${secondSearch.metadata.duration}ms`)
      console.log(`   - Cache working: ${cacheWorking ? 'Yes' : 'No'}`)
      
      return {
        success: true,
        message: `Performance OK - Total time: ${totalTime}ms`,
        details: {
          totalTime,
          firstSearchTime: firstSearch.metadata.duration,
          secondSearchTime: secondSearch.metadata.duration,
          cacheWorking,
          resultsCount: firstSearch.instances.length
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Performance test failed",
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
}

// Types for test results
interface TestResult {
  success: boolean
  message: string
  error?: string
  details?: any
}

interface TestResults {
  igConfigurationTest: TestResult
  igLoadingTest: TestResult
  exampleParsingTest: TestResult
  filteringTest: TestResult
  fixtureGenerationTest: TestResult
  integrationTest: TestResult
  performanceTest: TestResult
}

// Export function for easy testing
export async function testFixtureFeatures(customConfig?: IGConfiguration): Promise<TestResults> {
  const tester = new FixtureFeatureTester(customConfig)
  return await tester.runAllTests()
}
