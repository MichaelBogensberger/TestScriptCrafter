"use client"

import { TestScript } from "@/types/fhir-enhanced"
import SyntaxHighlighter from "./syntax-highlighter"
import { Button } from "./ui/button"
import { ClipboardCopy, Download } from "lucide-react"
import { toast } from "sonner"
import { formatToXml } from "@/lib/formatters/xml-formatter"
import { clientOnly } from "@/hooks/use-client-only"

interface XmlViewProps {
  testScript: TestScript
}

export function XmlView({ testScript }: XmlViewProps) {
  const copyToClipboard = async () => {
    const content = formatToXml(testScript)
    try {
      await clientOnly.clipboard.writeText(content)
      toast.success("In die Zwischenablage kopiert", {
        description: "TestScript XML wurde kopiert",
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error("Fehler beim Kopieren", {
        description: message,
      })
    }
  }

  const downloadContent = () => {
    const content = formatToXml(testScript)
    const filename = `testscript_${testScript.id || "export"}.xml`

    clientOnly.download.file(content, filename, "application/xml")
    
    toast.success("Datei heruntergeladen", {
      description: `${filename} wurde heruntergeladen`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
          <ClipboardCopy className="h-4 w-4" />
          <span>Kopieren</span>
        </Button>

        <Button variant="outline" size="sm" onClick={downloadContent} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Herunterladen</span>
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <SyntaxHighlighter language="xml" code={formatToXml(testScript)} showLineNumbers />
      </div>
    </div>
  )
}
