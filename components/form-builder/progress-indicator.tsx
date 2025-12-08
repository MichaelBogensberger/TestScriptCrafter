"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ProgressIndicatorProps {
  overallProgress: number
  sectionCompleteness: {
    basicInfo: boolean
    metadata: boolean
    setup: boolean
    tests: boolean
    teardown: boolean
  }
}

/**
 * Fortschrittsanzeige-Komponente für den FormBuilder
 * Zeigt den Gesamtfortschritt und Status der einzelnen Sektionen an
 */
export function ProgressIndicator({ overallProgress, sectionCompleteness }: ProgressIndicatorProps) {
  const sections = [
    { key: 'basicInfo', label: 'Grunddaten', complete: sectionCompleteness.basicInfo },
    { key: 'metadata', label: 'Metadaten', complete: sectionCompleteness.metadata },
    { key: 'setup', label: 'Setup', complete: sectionCompleteness.setup },
    { key: 'tests', label: 'Tests', complete: sectionCompleteness.tests },
    { key: 'teardown', label: 'Teardown', complete: sectionCompleteness.teardown }
  ]

  const completedSections = sections.filter(section => section.complete).length
  const totalSections = sections.length

  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-lg p-4 space-y-4">
      {/* Hauptfortschrittsanzeige */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Gesamtfortschritt</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completedSections}/{totalSections} Sektionen
            </Badge>
            <span className="text-sm text-muted-foreground">{overallProgress}%</span>
          </div>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Detaillierte Sektions-Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {sections.map((section) => (
          <div 
            key={section.key}
            className="flex items-center gap-2 p-2 rounded-md bg-background/50"
          >
            {section.complete ? (
              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
