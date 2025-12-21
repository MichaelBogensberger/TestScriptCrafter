"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ValidationError {
  line: number
  column?: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface SyntaxHighlighterProps {
  language: string
  code: string
  showLineNumbers?: boolean
  className?: string
  searchTerm?: string
  validationErrors?: ValidationError[]
}

/**
 * Vereinfachter Syntax-Highlighter ohne Prism.js
 * Verhindert Hydration-Probleme durch konsistente Server/Client-Rendering
 */
export function SyntaxHighlighter({
  language,
  code,
  showLineNumbers = true,
  className,
  searchTerm,
  validationErrors = [],
}: SyntaxHighlighterProps) {
  // SSR-safe client detection
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const lines = code.split('\n')
  const lineNumbers = lines.map((_, index) => index + 1)

  // Erstelle Fehler-Map für schnellen Zugriff
  const errorMap = new Map<number, ValidationError[]>()
  validationErrors.forEach(error => {
    const lineErrors = errorMap.get(error.line) || []
    lineErrors.push(error)
    errorMap.set(error.line, lineErrors)
  })

  return (
    <div className={cn("relative", className)}>
      <pre className="overflow-x-auto p-4 bg-card border rounded-md shadow-sm">
        <code className={`language-${language}`}>
          <div className="flex">
            {showLineNumbers && (
              <div className="mr-4 select-none text-muted-foreground text-sm font-mono border-r border-border pr-4">
                {lineNumbers.map((num) => {
                  const hasError = errorMap.has(num)
                  const errors = errorMap.get(num) || []
                  const hasErrorSeverity = errors.some(e => e.severity === 'error')
                  const hasWarningSeverity = errors.some(e => e.severity === 'warning')
                  
                  return (
                    <div 
                      key={num} 
                      className={cn(
                        "leading-6 px-1 rounded",
                        hasErrorSeverity && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                        hasWarningSeverity && !hasErrorSeverity && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      )}
                      title={hasError ? errors.map(e => e.message).join('\n') : undefined}
                    >
                      {num}
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex-1 font-mono text-sm">
              {lines.map((line, index) => {
                const lineNum = index + 1
                const hasError = errorMap.has(lineNum)
                const errors = errorMap.get(lineNum) || []
                const hasErrorSeverity = errors.some(e => e.severity === 'error')
                const hasWarningSeverity = errors.some(e => e.severity === 'warning')

                return (
                  <div key={index} className="group relative">
                    <div 
                      className={cn(
                        "leading-6 px-2 -mx-2 rounded",
                        hasErrorSeverity && "bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500",
                        hasWarningSeverity && !hasErrorSeverity && "bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500"
                      )}
                    >
                      {/* SSR-sichere Darstellung: Plain text auf Server, Highlighting nur auf Client */}
                      {isClient ? (
                        <SyntaxHighlightedLine 
                          line={line || '\u00A0'} 
                          language={language}
                          searchTerm={searchTerm}
                          isClient={isClient}
                        />
                      ) : (
                        <span className="text-foreground">{line || '\u00A0'}</span>
                      )}
                    </div>
                    
                    {/* Fehler-Tooltip */}
                    {hasError && (
                      <div className="absolute left-full top-0 ml-2 z-10 hidden group-hover:block">
                        <div className="bg-popover border border-border rounded-md shadow-lg p-3 max-w-md">
                          {errors.map((error, idx) => (
                            <div key={idx} className={cn(
                              "text-xs mb-1 last:mb-0",
                              error.severity === 'error' && "text-red-600 dark:text-red-400",
                              error.severity === 'warning' && "text-yellow-600 dark:text-yellow-400",
                              error.severity === 'info' && "text-blue-600 dark:text-blue-400"
                            )}>
                              <strong>{error.severity.toUpperCase()}:</strong> {error.message}
                              {error.column && ` (Spalte ${error.column})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </code>
      </pre>
    </div>
  )
}

export default SyntaxHighlighter

/**
 * Einzelne Zeile mit Syntax-Highlighting - SSR-sicher
 */
function SyntaxHighlightedLine({ 
  line, 
  language, 
  searchTerm, 
  isClient 
}: { 
  line: string
  language: string
  searchTerm?: string
  isClient: boolean
}) {
  // If search term exists, use innerHTML (only safe client-side)
  if (searchTerm && isClient) {
    const highlightedLine = highlightSearchTerm(line, searchTerm);
    return <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
  }

  // Sichere Syntax-Highlighting mit React-Komponenten
  if (language === 'json') {
    return <JsonLine line={line} />;
  } else if (language === 'xml') {
    return <XmlLine line={line} />;
  }

  return <span>{line}</span>;
}

/**
 * JSON Zeile mit einfachem Syntax-Highlighting - SSR-sicher
 */
function JsonLine({ line }: { line: string }) {
  const trimmed = line.trim();
  
  // JSON Brackets - einfache Erkennung
  if (trimmed.match(/^[{}[\],]+$/)) {
    return <span className="text-gray-600 dark:text-gray-400 font-bold">{line}</span>;
  }
  
  // JSON Properties - vereinfachte Erkennung
  if (trimmed.includes(':')) {
    // String values
    if (trimmed.includes(': "') && trimmed.endsWith('"') || trimmed.endsWith('",')) {
      return <span className="text-green-600 dark:text-green-400">{line}</span>;
    }
    
    // Boolean values
    if (trimmed.includes(': true') || trimmed.includes(': false') || trimmed.includes(': null')) {
      return <span className="text-purple-600 dark:text-purple-400">{line}</span>;
    }
    
    // Number values (einfache Erkennung)
    if (trimmed.match(/:\s*\d+/)) {
      return <span className="text-blue-600 dark:text-blue-400">{line}</span>;
    }
    
    // Property names (alles mit : )
    return <span className="text-blue-700 dark:text-blue-300">{line}</span>;
  }
  
  // Default
  return <span>{line}</span>;
}

/**
 * XML Zeile mit einfachem Syntax-Highlighting - SSR-sicher
 */
function XmlLine({ line }: { line: string }) {
  const trimmed = line.trim();
  
  // XML Declaration
  if (trimmed.startsWith('<?xml')) {
    return <span className="text-purple-600 dark:text-purple-400 italic">{line}</span>;
  }
  
  // XML Comments
  if (trimmed.startsWith('<!--')) {
    return <span className="text-gray-500 dark:text-gray-400 italic">{line}</span>;
  }
  
  // XML Opening tags
  if (trimmed.startsWith('<') && trimmed.endsWith('>') && !trimmed.startsWith('</')) {
    return <span className="text-blue-600 dark:text-blue-400">{line}</span>;
  }
  
  // XML Closing tags
  if (trimmed.startsWith('</')) {
    return <span className="text-blue-600 dark:text-blue-400">{line}</span>;
  }
  
  // XML Text content (eingerückt, kein < )
  if (trimmed && !trimmed.includes('<')) {
    return <span className="text-gray-800 dark:text-gray-200">{line}</span>;
  }
  
  // Default
  return <span>{line}</span>;
}

/**
 * Hebt Suchbegriffe im Code hervor
 */
function highlightSearchTerm(code: string, searchTerm: string): string {
  if (!searchTerm) return code;
  
  try {
    return code.replace(
      new RegExp(searchTerm, 'gi'), 
      match => `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match}</mark>`
    );
  } catch (error) {
    // Fehlerbehandlung für ungültige RegEx
    console.warn("Invalid search expression:", error);
    return code;
  }
} 