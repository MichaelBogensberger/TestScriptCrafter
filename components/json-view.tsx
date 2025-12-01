"use client"

import { TestScript } from "@/types/fhir-enhanced"
import SyntaxHighlighter from "./syntax-highlighter"
import { Button } from "./ui/button"
import { ClipboardCopy, Download, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { formatToJson } from "@/lib/formatters/json-formatter"
import { useFhirVersion } from "@/lib/fhir-version-context"
import { Badge } from "./ui/badge"
import { useMemo } from "react"
import { clientOnly } from "@/hooks/use-client-only"

// Type für Validierungsstate - optional
interface ValidationState {
  validationResult: any
  isValidating: boolean
  validate: (testScript: TestScript) => void
  serverError: string | null
  serverUrl: string
  setServerUrl: (url: string) => void
  currentFhirVersion: string
}

interface JsonViewProps {
  testScript: TestScript
  validationState?: ValidationState
}

export function JsonView({ testScript, validationState }: JsonViewProps) {
  const { currentVersion } = useFhirVersion()
  
  // Verwende IMMER den übergebenen validationState (kein Fallback!)
  const { validationResult } = validationState || { validationResult: null }
  
  // Konvertiere Validierungsfehler zu Zeilen-basierten Fehlern für JSON
  const validationErrors = useMemo(() => {
    console.log('Debug JSON: validationResult:', validationResult)
    console.log('Debug JSON: validationState verfügbar:', !!validationState)
    
    if (!validationResult?.issue) {
      console.log('Debug JSON: Keine issues gefunden')
      return []
    }
    
    console.log('Debug JSON: Gefundene issues:', validationResult.issue.length)
    
    return validationResult.issue
      .filter(issue => issue.line && issue.line > 0)
      .map(issue => ({
        line: issue.line!,
        column: issue.column,
        message: issue.details?.text || issue.diagnostics || 'Unbekannter Fehler',
        severity: (issue.severity === 'error' ? 'error' : 
                  issue.severity === 'warning' ? 'warning' : 'info') as 'error' | 'warning' | 'info'
      }))
  }, [validationResult])

  const hasErrors = validationErrors.some(e => e.severity === 'error')
  const hasWarnings = validationErrors.some(e => e.severity === 'warning')
  const errorCount = validationErrors.filter(e => e.severity === 'error').length
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length

  const copyToClipboard = async () => {
    const content = formatToJson(testScript)
    try {
      await clientOnly.clipboard.writeText(content)
      toast.success("In die Zwischenablage kopiert", {
        description: "TestScript JSON wurde kopiert",
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error("Fehler beim Kopieren", {
        description: message,
      })
    }
  }

  const downloadContent = () => {
    const content = formatToJson(testScript)
    const filename = `testscript_${testScript.id || "export"}.json`

    clientOnly.download.file(content, filename, "application/json")
    
    toast.success("Datei heruntergeladen", {
      description: `${filename} wurde heruntergeladen`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header mit Validation Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            FHIR {currentVersion} JSON
          </Badge>
          
          {validationResult && (
            <div className="flex items-center gap-2">
              {hasErrors ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errorCount} Fehler
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  Gültig
                </Badge>
              )}
              
              {hasWarnings && (
                <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-3 w-3" />
                  {warningCount} Warnungen
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
            <ClipboardCopy className="h-4 w-4" />
            <span>Kopieren</span>
          </Button>

          <Button variant="outline" size="sm" onClick={downloadContent} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Herunterladen</span>
          </Button>
        </div>
      </div>

      {/* JSON mit Syntax Highlighting und Fehler-Markierungen */}
      <div className="border rounded-md overflow-hidden">
        <SyntaxHighlighter 
          language="json" 
          code={formatToJson(testScript)} 
          showLineNumbers
          validationErrors={validationErrors}
        />
      </div>

      {/* Debug-Information (nur in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-md border bg-blue-50 dark:bg-blue-900/20 p-3 text-xs">
          <strong>Debug:</strong> 
          <br />Validation Result: {validationResult ? 'Ja' : 'Nein'}
          <br />Issues: {validationResult?.issue?.length || 0}
          <br />Validation Errors: {validationErrors.length}
          <br />Has Errors: {hasErrors ? 'Ja' : 'Nein'}
        </div>
      )}

      {/* Fehler-Zusammenfassung */}
      {validationResult && (hasErrors || hasWarnings) && (
        <div className="rounded-md border bg-muted/50 p-4">
          <h4 className="text-sm font-medium mb-2">Validierungsprobleme:</h4>
          <div className="space-y-1 text-sm">
            {validationErrors.slice(0, 5).map((error, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-muted-foreground">Zeile {error.line}:</span>
                <span className={
                  error.severity === 'error' ? 'text-red-600 dark:text-red-400' :
                  error.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                }>
                  {error.message}
                </span>
              </div>
            ))}
            {validationErrors.length > 5 && (
              <div className="text-muted-foreground text-xs">
                ... und {validationErrors.length - 5} weitere Probleme
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
