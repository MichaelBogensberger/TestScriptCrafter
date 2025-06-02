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
}

export default function SyntaxHighlighter({
  language,
  code,
  showLineNumbers = true,
  className,
}: SyntaxHighlighterProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [code, language, showLineNumbers])

  return (
    <pre className={cn(showLineNumbers && "line-numbers", className)}>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  )
} 