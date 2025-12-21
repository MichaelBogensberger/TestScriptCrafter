"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Settings, ExternalLink, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import type { IGConfiguration, IGSource } from "@/types/ig-types"
import { IGService } from "@/lib/services/ig-service"
import { FixtureTestPanel } from "@/components/debug/fixture-test-panel"

interface IGConfigTabProps {
  onConfigurationChange?: (config: IGConfiguration) => void
}

/**
 * Tab component for configuring Implementation Guide sources
 * Manages HL7.at and other IG sources with validation and testing
 */
export function IGConfigTab({ onConfigurationChange }: IGConfigTabProps) {
  const [config, setConfig] = useState<IGConfiguration>()
  const [testingSource, setTestingSource] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const sourceCounterRef = useRef(0)
  
  // Create service only once using useMemo to prevent re-creation on every render
  const igService = useMemo(() => new IGService(), [])

  // Load default configuration on mount
  useEffect(() => {
    const defaultConfig = igService.getDefaultConfiguration()
    setConfig(defaultConfig)
    onConfigurationChange?.(defaultConfig)
  }, [igService, onConfigurationChange])

  const updateConfiguration = useCallback((newConfig: IGConfiguration) => {
    setConfig(newConfig)
    onConfigurationChange?.(newConfig)
    // Save configuration to persistent storage
    igService.saveConfiguration(newConfig)
  }, [onConfigurationChange, igService])

  const addSource = () => {
    if (!config) return

    // SSR-sichere ID-Generierung mit Counter
    sourceCounterRef.current += 1
    const newSource: IGSource = {
      id: `custom-${sourceCounterRef.current}`,
      name: "Neuer IG",
      url: "",
      enabled: true,
      type: 'custom',
      config: {
        endpoints: {
          manifest: '/package.json',
          examples: '/artifacts.html'
        }
      }
    }

    updateConfiguration({
      ...config,
      sources: [...config.sources, newSource]
    })
  }

  const updateSource = (index: number, updatedSource: IGSource) => {
    if (!config) return

    const newSources = [...config.sources]
    newSources[index] = updatedSource
    updateConfiguration({
      ...config,
      sources: newSources
    })
  }

  const removeSource = (index: number) => {
    if (!config) return

    const newSources = config.sources.filter((_, idx) => idx !== index)
    updateConfiguration({
      ...config,
      sources: newSources
    })
  }

  const testSourceConnection = useCallback(async (source: IGSource) => {
    setTestingSource(source.id)
    setTestResults(prev => ({ ...prev, [source.id]: { success: false, message: 'Testing...' } }))

    try {
      const result = await igService.loadIGMetadata(source.url)
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          [source.id]: {
            success: true,
            message: `Connection successful. IG: ${result.data?.name || 'Unknown'}`
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [source.id]: {
            success: false,
            message: result.error?.message || 'Verbindung fehlgeschlagen'
          }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [source.id]: {
          success: false,
          message: error instanceof Error ? error.message : 'Unbekannter Fehler'
        }
      }))
    } finally {
      setTestingSource(null)
    }
  }, [igService])

  const resetToDefaults = useCallback(() => {
    const defaultConfig = igService.getDefaultConfiguration()
    updateConfiguration(defaultConfig)
    setTestResults({})
  }, [igService, updateConfiguration])

  if (!config) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Implementation Guide Configuration</h4>
          <p className="text-xs text-muted-foreground">
            Manage IG sources for automatic loading of example instances.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={addSource} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add IG
          </Button>
        </div>
      </div>


      {/* IG Sources */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium">Implementation Guide Quellen</h5>
        
        {config.sources.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No IG sources configured</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add Implementation Guide sources to load example instances.
            </p>
            <Button variant="outline" onClick={addSource} className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Add First Source
            </Button>
          </div>
        ) : (
          config.sources.map((source, index) => (
            <Card key={source.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={(checked) => updateSource(index, { ...source, enabled: checked })}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{source.name}</span>
                        <Badge variant={source.type === 'hl7-austria' ? 'default' : 'secondary'}>
                          {source.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{source.url}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSourceConnection(source)}
                      disabled={testingSource === source.id || !source.url}
                      className="flex items-center gap-1"
                    >
                      {testingSource === source.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                      Test
                    </Button>
                    
                    {source.type === 'custom' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSource(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Test Result */}
                {testResults[source.id] && (
                  <Alert className={testResults[source.id].success ? 'border-green-200' : 'border-red-200'}>
                    {testResults[source.id].success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {testResults[source.id].message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Editable fields for custom sources */}
                {source.type === 'custom' && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`source-${index}-name`}>Name</Label>
                      <Input
                        id={`source-${index}-name`}
                        value={source.name}
                        onChange={(e) => updateSource(index, { ...source, name: e.target.value })}
                        placeholder="IG Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`source-${index}-url`}>Base URL</Label>
                      <Input
                        id={`source-${index}-url`}
                        value={source.url}
                        onChange={(e) => updateSource(index, { ...source, url: e.target.value })}
                        placeholder="https://fhir.example.org/ig"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Read-only info for predefined sources */}
                {source.type === 'hl7-austria' && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>HL7 Austria:</strong> Pre-configured source for Austrian FHIR Implementation Guides.
                      Supports automatic parsing of example instances and artifacts.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Austria Focus Info */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>🇦🇹 Focus on HL7 Austria:</strong> This application focuses on Austrian 
          Implementation Guides. Only these have been tested and optimized for the parsing logic used.
        </AlertDescription>
      </Alert>

      {/* Help Section */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Available HL7 Austria IGs:</strong>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• <strong>Core 8.0 (with TestScripts)</strong> - Fully tested, contains example instances</li>
            <li>• <strong>Core R5</strong> - Latest R5-based version, experimental</li>
            <li>• <strong>Core R4 (Standard)</strong> - Base version, possibly without examples</li>
            <li>• All IGs use consistent Austrian naming conventions</li>
            <li>• Caching optimized for repeated access to fhir.hl7.at</li>
          </ul>
        </AlertDescription>
      </Alert>

        {/* Debug Test Panel - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Debug & Testing</h5>
            <FixtureTestPanel igConfiguration={config} />
          </div>
        )}
    </div>
  )
}
