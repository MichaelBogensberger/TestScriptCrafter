"use client"

import { TestScript } from "@/types/fhir-enhanced"
import SyntaxHighlighter from "./syntax-highlighter"
import { Button } from "./ui/button"
import { ClipboardCopy, Download } from "lucide-react"
import { toast } from "sonner"
import { formatToXml } from "@/lib/formatters/xml-formatter"
import { clientOnly } from "@/hooks/use-client-only"
import { useFhirVersion } from "@/lib/fhir-version-context"
import { Badge } from "./ui/badge"

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

interface XmlViewProps {
  testScript: TestScript
  validationState?: ValidationState
}

export function XmlView({ testScript, validationState }: XmlViewProps) {
  const { currentVersion } = useFhirVersion()
  
  // Validation errors are NOT shown in XML, as line numbers don't match
  // Validation is performed against JSON, so errors are only shown in JSON view
  const validationErrors: never[] = []

  const copyToClipboard = async () => {
    const content = formatToXml(testScript)
    try {
      await clientOnly.clipboard.writeText(content)
      toast.success("Copied to clipboard", {
        description: "TestScript XML has been copied",
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error("Error copying", {
        description: message,
      })
    }
  }

  const downloadContent = () => {
    const content = formatToXml(testScript)
    const filename = `testscript_${testScript.id || "export"}.xml`

    clientOnly.download.file(content, filename, "application/xml")
    
    toast.success("File downloaded", {
      description: `${filename} has been downloaded`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            FHIR {currentVersion} XML
          </Badge>
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

      {/* XML with Syntax Highlighting and Error Markers */}
      <div className="border rounded-md overflow-hidden">
        <SyntaxHighlighter 
          language="xml" 
          code={formatToXml(testScript)} 
          showLineNumbers
          validationErrors={validationErrors}
        />
      </div>

      {/* Note: Validation errors are only shown in JSON view, as validation is performed against JSON */}
    </div>
  )
}
