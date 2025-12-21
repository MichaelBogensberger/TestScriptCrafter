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
  
  // Funktion zum Finden der Zeilennummer basierend auf Location-Pfad
  const findLineByLocation = (locationPath: string, jsonString: string): number => {
    // Extrahiere alles nach "null*/" aus dem Location-Pfad
    // z.B. "Parameters.parameter[0].resource/*TestScript/null*/.title" -> ".title"
    // oder "Parameters.parameter[0].resource/*TestScript/null*/" -> "" (Root-Level)
    const match = locationPath.match(/null\*\/(.*)$/);
    if (!match) {
      return 1; // Fallback
    }
    
    const pathAfterNull = (match[1] || '').trim();
    
    // Wenn der Pfad leer ist (nur "null*/"), suche nach der ersten Zeile mit "resourceType"
    if (!pathAfterNull || pathAfterNull === '') {
      const lines = jsonString.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"resourceType"')) {
          return i + 1;
        }
      }
      return 1;
    }
    
    // Wenn der Pfad mit "." beginnt, entferne es
    const cleanPath = pathAfterNull.startsWith('.') ? pathAfterNull.substring(1) : pathAfterNull;
    
    // Zerlege den Pfad in Komponenten (behalte Array-Indizes)
    // z.B. "destination[0].profile" -> ["destination[0]", "profile"]
    // oder "title" -> ["title"]
    // oder "test[0].action[0].operation.type" -> ["test[0]", "action[0]", "operation", "type"]
    const pathParts = cleanPath.split(/\.(?![^\[]*\])/); // Split by "." but not inside []
    
    // Suche nach dem letzten Element im Pfad (das ist das Feld, das wir markieren wollen)
    const lastPart = pathParts[pathParts.length - 1];
    const fieldName = lastPart.replace(/\[\d+\]/g, ''); // Entferne Array-Indizes für die Suche
    
    // Teile JSON in Zeilen
    const lines = jsonString.split('\n');
    
    // Für einfache Pfade (nur ein Element wie "title") - direkt suchen
    if (pathParts.length === 1) {
      for (let i = 0; i < lines.length; i++) {
        const fieldRegex = new RegExp(`"${fieldName}"\\s*:`, 'g');
        if (fieldRegex.test(lines[i])) {
          return i + 1;
        }
      }
      return 1;
    }
    
    // Für komplexere Pfade - suche kontextbasiert
    // Baue einen Such-Pfad: suche nach allen Pfad-Teilen in der richtigen Reihenfolge
    const searchPath = pathParts.map(part => {
      const cleanPart = part.replace(/\[\d+\]/g, '');
      return `"${cleanPart}"`;
    });
    
    // Suche nach dem letzten Feld mit Kontext-Check
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line contains the last field
      const lastFieldRegex = new RegExp(`"${fieldName}"\\s*:`, 'g');
      if (!lastFieldRegex.test(line)) {
        continue;
      }
      
      // Check if context matches - look back for previous path parts
      let contextMatches = true;
      let foundParts = 0;
      
      // Go backwards through lines and search for path parts
      for (let j = i - 1; j >= 0 && j >= i - 50; j--) { // Check max. 50 lines back
        const prevLine = lines[j];
        
        // Check if part of path occurs in this line (backwards through path)
        for (let k = searchPath.length - 2; k >= foundParts; k--) {
          if (prevLine.includes(searchPath[k])) {
            foundParts = k + 1;
            break;
          }
        }
        
        // Wenn wir alle Pfad-Teile gefunden haben, ist der Kontext korrekt
        if (foundParts >= searchPath.length - 1) {
          contextMatches = true;
          break;
        }
      }
      
      // Wenn der Kontext passt oder es ein einfacher Pfad war, nehmen wir diese Zeile
      if (contextMatches || foundParts > 0) {
        return i + 1;
      }
    }
    
    // Fallback: Wenn Kontext-Check fehlschlägt, nehme einfach das erste Vorkommen
    for (let i = 0; i < lines.length; i++) {
      const fieldRegex = new RegExp(`"${fieldName}"\\s*:`, 'g');
      if (fieldRegex.test(lines[i])) {
        return i + 1;
      }
    }
    
    return 1; // Fallback
  };
  
  // Formatted JSON for line number calculation
  const formattedJson = formatToJson(testScript);
  
  // Convert validation errors to line-based errors for JSON
  const validationErrors = useMemo(() => {
    if (!validationResult?.issue) {
      return []
    }
    
    return validationResult.issue
      .map(issue => {
        // Korrekte Severity-Mapping: fatal/error -> error, warning -> warning, information -> info, sonst info
        let severity: 'error' | 'warning' | 'info' = 'info';
        if (issue.severity === 'error' || issue.severity === 'fatal') {
          severity = 'error';
        } else if (issue.severity === 'warning') {
          severity = 'warning';
        } else if (issue.severity === 'information') {
          severity = 'info';
        }
        
        // Versuche Zeilennummer aus Location-Pfad zu finden
        let line = issue.line || 1;
        if (issue.location && issue.location.length > 0) {
          // Nutze den ersten Location-Pfad der nicht "Line[X] Col[Y]" ist
          const locationPath = issue.location.find(loc => !loc.includes('Line['));
          if (locationPath) {
            const calculatedLine = findLineByLocation(locationPath, formattedJson);
            if (calculatedLine > 1) {
              line = calculatedLine;
            }
          }
        }
        
        // If still no good line found, try expression
        if (line === 1 && issue.expression && issue.expression.length > 0) {
          const expressionPath = issue.expression[0];
          if (expressionPath) {
            const calculatedLine = findLineByLocation(expressionPath, formattedJson);
            if (calculatedLine > 1) {
              line = calculatedLine;
            }
          }
        }
        
        // Nur zurückgeben wenn wir eine gültige Zeile gefunden haben
        if (line <= 1) {
          return null; // Filter diese später raus
        }
        
        return {
          line,
          column: issue.column || 1,
          message: issue.details?.text || issue.diagnostics || 'Unknown error',
          severity
        };
      })
      .filter((error): error is NonNullable<typeof error> => error !== null) // Entferne null-Werte
  }, [validationResult, formattedJson])

  const hasErrors = validationErrors.some(e => e.severity === 'error')
  const hasWarnings = validationErrors.some(e => e.severity === 'warning')
  const errorCount = validationErrors.filter(e => e.severity === 'error').length
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length

  const copyToClipboard = async () => {
    const content = formatToJson(testScript)
    try {
      await clientOnly.clipboard.writeText(content)
      toast.success("Copied to clipboard", {
        description: "TestScript JSON has been copied",
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error("Error copying", {
        description: message,
      })
    }
  }

  const downloadContent = () => {
    const content = formatToJson(testScript)
    const filename = `testscript_${testScript.id || "export"}.json`

    clientOnly.download.file(content, filename, "application/json")
    
    toast.success("File downloaded", {
      description: `${filename} has been downloaded`,
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
                  {errorCount} Errors
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  Valid
                </Badge>
              )}
              
              {hasWarnings && (
                <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-3 w-3" />
                  {warningCount} Warnings
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
            <ClipboardCopy className="h-4 w-4" />
            <span>Copy</span>
          </Button>

          <Button variant="outline" size="sm" onClick={downloadContent} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* JSON with Syntax Highlighting and Error Markers */}
      <div className="border rounded-md overflow-hidden">
        <SyntaxHighlighter 
          language="json" 
          code={formatToJson(testScript)} 
          showLineNumbers
          validationErrors={validationErrors}
        />
      </div>


      {/* Error Summary */}
      {validationResult && (hasErrors || hasWarnings) && (
        <div className="rounded-md border bg-muted/50 p-4">
          <h4 className="text-sm font-medium mb-2">Validation Issues:</h4>
          <div className="space-y-1 text-sm">
            {validationErrors.slice(0, 5).map((error, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-muted-foreground">Line {error.line}:</span>
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
                ... and {validationErrors.length - 5} more issues
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
