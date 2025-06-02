"use client"

import { useEffect } from "react"
import Prism from "prismjs"
import "prismjs/components/prism-json"
import "prismjs/components/prism-xml-doc"
import "prismjs/plugins/line-numbers/prism-line-numbers"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"
import "prismjs/themes/prism-tomorrow.css"
import { cn } from "@/lib/utils"

interface SyntaxHighlighterProps {
  language: string
  code: string
  showLineNumbers?: boolean
  className?: string
  searchTerm?: string
}

/**
 * Syntax-Highlighter Komponente für Code-Darstellung
 * Unterstützt verschiedene Sprachen und Zeilennummerierung
 */
export default function SyntaxHighlighter({
  language,
  code,
  showLineNumbers = true,
  className,
  searchTerm,
}: SyntaxHighlighterProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [code, language, showLineNumbers])

  // Highlight-Funktionalität für gesuchte Begriffe
  const processedCode = searchTerm ? highlightSearchTerm(code, searchTerm) : code;

  return (
    <pre className={cn(showLineNumbers && "line-numbers", className)}>
      <code className={`language-${language}`}>{code}</code>
    </pre>
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