"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TestTube } from "lucide-react"
import type { TestScriptTest } from "@/types/fhir-enhanced"

interface TestCaseManagerProps {
  tests: TestScriptTest[]
  onAddTest: () => void
  onRemoveTest: (index: number) => void
  onExpandSection: (section: string) => void
}

/**
 * Komponente zur Verwaltung von Testfällen
 * Bietet Funktionen zum Hinzufügen, Entfernen und Bearbeiten von Tests
 */
export function TestCaseManager({
  tests,
  onAddTest,
  onRemoveTest,
  onExpandSection
}: TestCaseManagerProps) {
  
  const handleAddTest = useCallback(() => {
    onAddTest()
    // Automatisch den neuen Testfall aufklappen
    onExpandSection(`test-${tests.length}`)
  }, [onAddTest, onExpandSection, tests.length])

  const totalActions = tests.reduce((sum, test) => sum + (test.action?.length || 0), 0)
  const completedTests = tests.filter(test => test.action && test.action.length > 0).length

  return (
    <div className="space-y-4">
      {/* Testfall-Übersicht */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <TestTube className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Testfälle</h3>
            <p className="text-sm text-muted-foreground">
              {tests.length} Testfall{tests.length !== 1 ? 'e' : ''} • {totalActions} Aktionen
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {completedTests}/{tests.length} vollständig
          </Badge>
          <Button 
            size="sm" 
            onClick={handleAddTest}
            className="flex items-center gap-2"
          >
            <Plus className="h-3 w-3" />
            Testfall hinzufügen
          </Button>
        </div>
      </div>

      {/* Testfall-Liste */}
      {tests.length > 0 && (
        <div className="space-y-2">
          {tests.map((test, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-background border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{test.name || `Testfall ${index + 1}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {test.action?.length || 0} Aktionen
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {test.action && test.action.length > 0 ? (
                  <Badge variant="default" className="text-xs">
                    Aktiv
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Leer
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveTest(index)}
                  className="text-destructive hover:text-destructive"
                >
                  Entfernen
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
