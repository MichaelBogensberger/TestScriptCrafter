"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Plus, 
  Loader2, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Download
} from "lucide-react"
import type { 
  IGConfiguration, 
  ExampleInstance, 
  ExampleInstanceFilter,
  ExampleInstanceSearchResult,
  GeneratedFixture
} from "@/types/ig-types"
import type { TestScript } from "@/types/fhir-enhanced"
import { IGService } from "@/lib/services/ig-service"
import { FixtureGeneratorService } from "@/lib/services/fixture-generator"
import { toast } from "sonner"

interface IGBrowserTabProps {
  fixtures: TestScript["fixture"]
  updateFixtures: (fixtures: TestScript["fixture"]) => void
  igConfiguration?: IGConfiguration
}

/**
 * Tab component for browsing and selecting Example Instances from Implementation Guides
 * Provides search, filtering, preview, and fixture generation capabilities
 */
export function IGBrowserTab({ fixtures, updateFixtures, igConfiguration }: IGBrowserTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResourceType, setSelectedResourceType] = useState<string>("__all__")
  const [selectedIG, setSelectedIG] = useState<string>("__all__")
  const [searchResult, setSearchResult] = useState<ExampleInstanceSearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExample, setSelectedExample] = useState<ExampleInstance | null>(null)
  const [previewFixture, setPreviewFixture] = useState<Partial<GeneratedFixture> | null>(null)
  const [addingFixture, setAddingFixture] = useState<string | null>(null)

  // Create services only once using useMemo to prevent re-creation on every render
  const igService = useMemo(() => new IGService(), [])
  const fixtureGenerator = useMemo(() => new FixtureGeneratorService(), [])

  // Available resource types for filtering
  const resourceTypes = [
    "Patient", "Practitioner", "Organization", "Location",
    "Observation", "Encounter", "Procedure", "Medication",
    "DiagnosticReport", "Condition", "AllergyIntolerance"
  ]

  // Get enabled IG sources
  const enabledSources = useMemo(() => {
    return igConfiguration?.sources.filter(s => s.enabled) || []
  }, [igConfiguration])

  // Perform search when filters change (removed selectedExample from dependencies to prevent infinite loop)
  useEffect(() => {
    if (enabledSources.length === 0) {
      setSearchResult(null)
      setSelectedExample(null)
      return
    }

    const performSearch = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const filter: ExampleInstanceFilter = {
          query: searchQuery.trim() || undefined,
          resourceType: selectedResourceType === "__all__" ? undefined : selectedResourceType,
          igId: selectedIG === "__all__" ? undefined : selectedIG,
          sort: { field: 'title', direction: 'asc' },
          pagination: { page: 1, pageSize: 50 }
        }

        const result = await igService.searchExampleInstances(enabledSources, filter)
        setSearchResult(result)

        // Reset selected example when search changes
        setSelectedExample(null)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error loading examples')
        setSearchResult(null)
        setSelectedExample(null)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [searchQuery, selectedResourceType, selectedIG, enabledSources, igService])

  // Update preview when selected example changes
  useEffect(() => {
    if (selectedExample) {
      const preview = fixtureGenerator.createFixturePreview(selectedExample)
      setPreviewFixture(preview)
    } else {
      setPreviewFixture(null)
    }
  }, [selectedExample, fixtureGenerator])

  const handleExampleSelect = (example: ExampleInstance) => {
    setSelectedExample(example)
  }

  const handleAddFixture = useCallback(async (example: ExampleInstance) => {
    setAddingFixture(example.id)
    setError(null) // Clear any previous errors

    try {
      const result = await fixtureGenerator.generateFixture(example)
      
      if (result.success && result.data) {
        const standardFixture = fixtureGenerator.convertToTestScriptFixture(result.data)
        const currentFixtures = fixtures || []
        
        // Check for duplicate ID
        const isDuplicate = currentFixtures.some(f => f.id === standardFixture.id)
        if (isDuplicate) {
          toast.error("Duplicate Fixture", {
            description: `A fixture with ID "${standardFixture.id}" already exists.`,
          })
          setAddingFixture(null)
          return
        }
        
        updateFixtures([...currentFixtures, standardFixture])
        
        // Show success feedback
        toast.success("Fixture added successfully", {
          description: `${example.title || example.id} has been added as a fixture.`,
        })
        setTimeout(() => setAddingFixture(null), 1000)
      } else {
        setError(result.error?.message || 'Error generating fixture')
        toast.error("Error adding", {
          description: result.error?.message || 'Error generating fixture',
        })
        setAddingFixture(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error("Error adding", {
        description: errorMessage,
      })
      setAddingFixture(null)
    }
  }, [fixtureGenerator, fixtures, updateFixtures])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedResourceType("__all__")
    setSelectedIG("__all__")
    setSelectedExample(null)
    setError(null)
  }, [])

  if (enabledSources.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No Implementation Guide sources configured. 
            Switch to the "IG Configuration" tab to add sources.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">IG Example Browser</h4>
        <p className="text-xs text-muted-foreground">
          Browse example instances from configured Implementation Guides and add them as fixtures.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <h5 className="text-sm font-medium">Suche & Filter</h5>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <Label htmlFor="search-query">Suchbegriff</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Patient, Example, ..."
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resource-type-filter">Resource Type</Label>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger id="resource-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  {resourceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ig-filter">Implementation Guide</Label>
              <Select value={selectedIG} onValueChange={setSelectedIG}>
                <SelectTrigger id="ig-filter">
                  <SelectValue placeholder="All IGs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All IGs</SelectItem>
                  {enabledSources.map(source => (
                    <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <Filter className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Search Results Summary */}
          {searchResult && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {searchResult.total} Example{searchResult.total !== 1 ? 's' : ''} gefunden
                {searchResult.metadata.duration && ` (${searchResult.metadata.duration}ms)`}
              </span>
              {(searchQuery || (selectedResourceType !== "__all__") || (selectedIG !== "__all__")) && (
                <Badge variant="secondary">Gefiltert</Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading Example Instances...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Grid */}
      {searchResult && !isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
          {/* Example List */}
          <Card className="p-4">
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Example Instances</h5>
              
              {searchResult.instances.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Database className="mx-auto h-12 w-12 mb-2" />
                  <p className="text-sm">No examples found</p>
                  <p className="text-xs">Try different search terms or filters</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-2">
                  <div className="space-y-2">
                    {searchResult.instances.map((example) => (
                      <div
                        key={example.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedExample?.id === example.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => handleExampleSelect(example)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {example.resourceType}
                              </Badge>
                              <span className="text-xs text-muted-foreground truncate">
                                {example.source.igName}
                              </span>
                            </div>
                            <h6 className="text-sm font-medium truncate">{example.title}</h6>
                            {example.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {example.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(example.url, '_blank')
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddFixture(example)
                              }}
                              disabled={addingFixture === example.id}
                              className="h-8 px-2"
                            >
                              {addingFixture === example.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </Card>

          {/* Preview Panel */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h5 className="text-sm font-medium">Fixture Preview</h5>
              </div>

              {selectedExample && previewFixture ? (
                <div className="space-y-4">
                  {/* Example Details */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Example Instance</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{selectedExample.resourceType}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(selectedExample.url, '_blank')}
                            className="h-6 px-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        <h6 className="text-sm font-medium">{selectedExample.title}</h6>
                        {selectedExample.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedExample.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Quelle: {selectedExample.source.igName}
                        </p>
                      </div>
                    </div>

                    {/* Generated Fixture Preview */}
                    <div>
                      <Label className="text-xs">Generiertes Fixture</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-md border">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-medium">ID:</span> {previewFixture.id}
                          </div>
                          <div>
                            <span className="font-medium">Reference:</span> {previewFixture.resource?.reference}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {previewFixture.resource?.type}
                          </div>
                          <div>
                            <span className="font-medium">Display:</span> {previewFixture.resource?.display}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Button */}
                  <Button
                    onClick={() => handleAddFixture(selectedExample)}
                    disabled={addingFixture === selectedExample.id}
                    className="w-full"
                  >
                    {addingFixture === selectedExample.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add as Fixture
                      </>
                    )}
                  </Button>

                  {/* Success Feedback */}
                  {addingFixture === selectedExample.id && (
                    <Alert className="border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Fixture successfully added!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Eye className="mx-auto h-12 w-12 mb-2" />
                  <p className="text-sm">Select an example from the list</p>
                  <p className="text-xs">to see a fixture preview</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
