"use client"

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'

import { 
  useFhirVersion, 
  useCurrentFhirConfig 
} from '@/lib/fhir-version-context'
import { 
  FhirVersion, 
  getAvailableFhirVersions 
} from '@/types/fhir-config'

interface VersionSelectorProps {
  /** Optional: Custom onChange handler */
  onVersionChange?: (version: FhirVersion) => void
  /** Optional: Compact mode für weniger Platz */
  compact?: boolean
  /** Optional: Label anzeigen */
  showLabel?: boolean
  /** Optional: Custom class name */
  className?: string
}

/**
 * Version Selector Component
 * Allows selection of FHIR version with information about each version
 */
export function VersionSelector({ 
  onVersionChange,
  compact = false,
  showLabel = true,
  className
}: VersionSelectorProps) {
  const { currentVersion, setVersion } = useFhirVersion()
  const currentConfig = useCurrentFhirConfig()
  const availableVersions = getAvailableFhirVersions()

  const handleVersionChange = (value: string) => {
    const version = value as FhirVersion
    setVersion(version)
    onVersionChange?.(version)
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="fhir-version-selector" className="text-sm font-medium">
            FHIR Version
          </Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <Info className="h-3 w-3" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">FHIR Version Information</h4>
                <div className="space-y-2 text-xs">
                  {availableVersions.map(config => (
                    <div key={config.version} className="flex items-start gap-2">
                      <Badge variant={config.version === currentVersion ? "default" : "secondary"} className="text-xs">
                        {config.version}
                      </Badge>
                      <div>
                        <p className="font-medium">{config.display}</p>
                        <p className="text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          {currentConfig.isDefault && (
            <Badge variant="outline" className="text-xs">
              Standard
            </Badge>
          )}
        </div>
      )}

      <Select 
        value={currentVersion} 
        onValueChange={handleVersionChange}
      >
        <SelectTrigger id="fhir-version-selector" className={compact ? "h-8" : undefined}>
          <SelectValue placeholder="Select FHIR Version..." />
        </SelectTrigger>
        <SelectContent>
          {availableVersions.map(config => {
            const isCurrentVersion = config.version === currentVersion
            return (
              <SelectItem 
                key={config.version} 
                value={config.version}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{config.display}</span>
                  {config.isDefault && (
                    <Badge variant="outline" className="text-xs ml-2">
                      Standard
                    </Badge>
                  )}
                  {isCurrentVersion && (
                    <Badge variant="default" className="text-xs ml-2">
                      Aktiv
                    </Badge>
                  )}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {!compact && (
        <p className="text-xs text-muted-foreground mt-1">
          {currentConfig.description}
        </p>
      )}
    </div>
  )
}

/**
 * Kompakte Version des Version Selectors
 * Für Verwendung in Space-limitierten Bereichen
 */
export function CompactVersionSelector(props: Omit<VersionSelectorProps, 'compact'>) {
  return <VersionSelector {...props} compact={true} />
}

/**
 * Version Badge - zeigt aktuelle Version als Badge an
 */
export function VersionBadge({ className }: { className?: string }) {
  const currentConfig = useCurrentFhirConfig()
  
  return (
    <Badge variant="outline" className={className}>
      {currentConfig.version}
    </Badge>
  )
}
