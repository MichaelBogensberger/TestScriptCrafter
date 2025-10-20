"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SyntaxHighlighterProps {
  language: string
  code: string
  showLineNumbers?: boolean
  className?: string
  searchTerm?: string
}

/**
 * Vereinfachter Syntax-Highlighter ohne Prism.js
 * Verhindert Hydration-Probleme durch konsistente Server/Client-Rendering
 */
export default function SyntaxHighlighter({
  language,
  code,
  showLineNumbers = true,
  className,
  searchTerm,
}: SyntaxHighlighterProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Highlight-Funktionalität für gesuchte Begriffe
  const processedCode = searchTerm ? highlightSearchTerm(code, searchTerm) : code;

  // Einfache Zeilennummerierung ohne externe Bibliothek
  const lines = processedCode.split('\n')
  const lineNumbers = lines.map((_, index) => index + 1)

  return (
    <div className={cn("relative", className)}>
      <pre className="overflow-x-auto p-4 bg-muted rounded-md">
        <code className={`language-${language}`}>
          {isClient ? (
            <div className="flex">
              {showLineNumbers && (
                <div className="mr-4 select-none text-muted-foreground text-sm">
                  {lineNumbers.map((num) => (
                    <div key={num} className="leading-6">
                      {num}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1">
                {lines.map((line, index) => (
                  <div key={index} className="leading-6">
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex">
              {showLineNumbers && (
                <div className="mr-4 select-none text-muted-foreground text-sm">
                  {lineNumbers.map((num) => (
                    <div key={num} className="leading-6">
                      {num}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1">
                {lines.map((line, index) => (
                  <div key={index} className="leading-6">
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </code>
      </pre>
    </div>
  )
}

/**
 * Hebt Suchbegriffe im Code hervor
 */
function highlightSearchTerm(code: string, searchTerm: string): string {
  if (!searchTerm) return code;
  
  try {
    return code.replace(
      new RegExp(searchTerm, 'gi'), 
      match => `<mark class="bg-yellow-200 dark:bg-yellow-800">${match}</mark>`
    );
  } catch (error) {
    // Fehlerbehandlung für ungültige RegEx
    console.warn("Ungültiger Suchausdruck:", error);
    return code;
  }
} 