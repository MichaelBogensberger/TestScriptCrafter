"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
// Removed Collapsible import - using simple state-based expansion
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  Bug,
  Clock,
  Settings2
} from "lucide-react"
import { testFixtureFeatures } from "@/lib/test-fixture-features"
import type { IGConfiguration, IGSource } from "@/types/ig-types"

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

interface FixtureTestPanelProps {
  igConfiguration?: IGConfiguration
}

/**
 * Debug panel for testing Fixture features
 * Only shown in development mode
 */
export function FixtureTestPanel({ igConfiguration }: FixtureTestPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [showSourceSelection, setShowSourceSelection] = useState(false)

  // Initialize selected sources when configuration changes
  useEffect(() => {
    if (igConfiguration?.sources) {
      const enabledSources = igConfiguration.sources
        .filter(s => s.enabled)
        .map(s => s.id)
      setSelectedSources(new Set(enabledSources))
    }
  }, [igConfiguration])

  const runTests = async () => {
    setIsRunning(true)
    setResults(null)
    
    try {
      // Create filtered configuration with only selected sources
      const testConfig = igConfiguration ? {
        ...igConfiguration,
        sources: igConfiguration.sources.map(source => ({
          ...source,
          enabled: selectedSources.has(source.id)
        }))
      } : undefined

      const testResults = await testFixtureFeatures(testConfig)
      setResults(testResults)
    } catch (error) {
      console.error("Test execution failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const toggleSourceSelection = (sourceId: string) => {
    const newSelected = new Set(selectedSources)
    if (newSelected.has(sourceId)) {
      newSelected.delete(sourceId)
    } else {
      newSelected.add(sourceId)
    }
    setSelectedSources(newSelected)
  }

  const selectAllSources = () => {
    if (igConfiguration?.sources) {
      const allSourceIds = igConfiguration.sources.map(s => s.id)
      setSelectedSources(new Set(allSourceIds))
    }
  }

  const selectEnabledSources = () => {
    if (igConfiguration?.sources) {
      const enabledSourceIds = igConfiguration.sources
        .filter(s => s.enabled)
        .map(s => s.id)
      setSelectedSources(new Set(enabledSourceIds))
    }
  }

  const clearSourceSelection = () => {
    setSelectedSources(new Set())
  }

  const toggleExpanded = (testName: string) => {
    const newExpanded = new Set(expandedTests)
    if (newExpanded.has(testName)) {
      newExpanded.delete(testName)
    } else {
      newExpanded.add(testName)
    }
    setExpandedTests(newExpanded)
  }

  const getTestDisplayName = (testKey: string): string => {
    const names: Record<string, string> = {
      igConfigurationTest: "IG Configuration",
      igLoadingTest: "IG Loading",
      exampleParsingTest: "Example Parsing",
      filteringTest: "Filter Functions",
      fixtureGenerationTest: "Fixture Generation",
      integrationTest: "Full Integration",
      performanceTest: "Performance & Caching"
    }
    return names[testKey] || testKey
  }

  const renderTestResult = (testKey: string, result: TestResult) => {
    const isExpanded = expandedTests.has(testKey)
    
    return (
      <Card key={testKey} className="p-3">
        <div>
          <button 
            onClick={() => toggleExpanded(testKey)}
            className="flex w-full items-center justify-between text-left hover:bg-muted/50 rounded p-2 -m-2"
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">{getTestDisplayName(testKey)}</span>
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">{result.message}</p>
              
              {result.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}
              
              {result.details && (
                <div className="rounded-md bg-muted p-3">
                  <h5 className="text-xs font-medium mb-2">Details:</h5>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }

  const totalTests = results ? Object.keys(results).length : 0
  const passedTests = results ? Object.values(results).filter(r => r.success).length : 0

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Fixture Feature Tests</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSourceSelection(!showSourceSelection)}
              className="flex items-center gap-1"
            >
              <Settings2 className="h-4 w-4" />
              Quellen ({selectedSources.size})
            </Button>
            
            <Button 
              onClick={runTests} 
              disabled={isRunning || selectedSources.size === 0}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tests laufen...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Tests starten
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Führt umfassende Tests aller Fixture-Features durch: IG-Konfiguration, 
          Example-Parsing, Filtering, Fixture-Generierung und Performance.
        </div>

        {/* Source Selection Panel */}
        {showSourceSelection && igConfiguration?.sources && (
          <Card className="p-4 bg-muted/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Select Test Sources</h4>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectEnabledSources}>
                    Enabled
                  </Button>
                  <Button variant="ghost" size="sm" onClick={selectAllSources}>
                    All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSourceSelection}>
                    None
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {igConfiguration.sources.map((source) => (
                  <div key={source.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`test-source-${source.id}`}
                      checked={selectedSources.has(source.id)}
                      onCheckedChange={() => toggleSourceSelection(source.id)}
                    />
                    <Label 
                      htmlFor={`test-source-${source.id}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span>{source.name}</span>
                      <Badge variant={source.enabled ? "default" : "secondary"} className="text-xs">
                        {source.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {source.type === 'hl7-austria' && (
                        <Badge variant="outline" className="text-xs">🇦🇹</Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Select the IG sources to be tested. 
                Only selected sources will be used in tests.
              </div>
            </div>
          </Card>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
                {passedTests}/{totalTests} Tests bestanden
              </Badge>
              
              {passedTests === totalTests ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">All tests passed!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Einige Tests fehlgeschlagen</span>
                </div>
              )}
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {Object.entries(results).map(([testKey, result]) =>
                  renderTestResult(testKey, result)
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Running tests...</span>
            </div>
          </div>
        )}

        {!results && !isRunning && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Klicke auf "Tests starten" um eine umfassende Überprüfung aller 
              Fixture-Features durchzuführen. Die Tests prüfen IG-Konfiguration, 
              Example-Parsing, Filtering, Fixture-Generierung und Performance.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
}
