"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Download, Eye } from "lucide-react"
import { toast } from "sonner"
import { formatToXml } from "@/lib/formatters/xml-formatter"
import { formatToJson } from "@/lib/formatters/json-formatter"
import SyntaxHighlighter from "@/components/syntax-highlighter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Einfaches Props-Interface für den Output-Viewer
function OutputViewer({ testScript }) {
  // State für die ausgewählte Ansicht (JSON oder XML)
  const [format, setFormat] = useState("json")
  
  // State für die Einrückungstiefe
  const [indentSize, setIndentSize] = useState(2)
  
  // State für Zeilennummern anzeigen/ausblenden
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  
  // Helfer-Funktion zum Formatieren des Inhalts
  function getFormattedContent() {
    try {
      // Je nach Format JSON oder XML zurückgeben
      if (format === "json") {
        return formatToJson(testScript, indentSize)
      } else {
        return formatToXml(testScript)
      }
    } catch (error) {
      // Bei Fehlern eine Fehlermeldung anzeigen
      console.error("Formatierungsfehler:", error)
      return "Fehler bei der Formatierung: " + error.message
    }
  }
  
  // Funktion zum Kopieren in die Zwischenablage
  function copyToClipboard() {
    // Aktuellen Inhalt holen
    const content = getFormattedContent()
    
    // In die Zwischenablage kopieren
    navigator.clipboard.writeText(content)
    
    // Erfolgsmeldung anzeigen
    toast.success("In die Zwischenablage kopiert", {
      description: `TestScript ${format.toUpperCase()} wurde kopiert`,
    })
  }
  
  // Funktion zum Herunterladen des Inhalts als Datei
  function downloadFile() {
    // Aktuellen Inhalt holen
    const content = getFormattedContent()
    
    // Dateiendung je nach Format festlegen
    const extension = format === "json" ? "json" : "xml"
    const filename = `testscript.${extension}`
    
    // Blob erstellen und Download starten
    const blob = new Blob([content], { 
      type: format === "json" ? "application/json" : "application/xml" 
    })
    const url = URL.createObjectURL(blob)
    
    // Download-Link erstellen und klicken
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    // Aufräumen
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Erfolgsmeldung anzeigen
    toast.success("Datei heruntergeladen", {
      description: `TestScript wurde als ${filename} heruntergeladen`,
    })
  }

  // UI rendern
  return (
    <div className="space-y-4">
      {/* Obere Leiste mit Tabs und Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        {/* Format-Tabs (JSON/XML) */}
        <Tabs value={format} onValueChange={setFormat}>
          <TabsList>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="xml">XML</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Buttons für Einstellungen und Aktionen */}
        <div className="flex items-center gap-2">
          {/* Einrückungsauswahl (nur für JSON) */}
          {format === "json" && (
            <Select 
              value={indentSize.toString()} 
              onValueChange={(value) => setIndentSize(Number(value))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Einrückung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Leerzeichen</SelectItem>
                <SelectItem value="4">4 Leerzeichen</SelectItem>
                <SelectItem value="8">8 Leerzeichen</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {/* Zeilennummern ein-/ausblenden */}
          <Button variant="outline" size="sm" onClick={() => setShowLineNumbers(!showLineNumbers)}>
            <Eye className="h-4 w-4 mr-2" />
            {showLineNumbers ? "Zeilennummern ausblenden" : "Zeilennummern anzeigen"}
          </Button>
          
          {/* Download-Button */}
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <Download className="h-4 w-4 mr-2" /> Herunterladen
          </Button>
          
          {/* Kopieren-Button */}
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" /> Kopieren
          </Button>
        </div>
      </div>

      {/* Code-Anzeige mit Syntax-Highlighting */}
      <div className="relative">
        <SyntaxHighlighter
          language={format}
          code={getFormattedContent()}
          showLineNumbers={showLineNumbers}
          className="p-4 rounded-md bg-muted overflow-auto max-h-[600px] text-sm"
        />
      </div>
    </div>
  )
}

export default OutputViewer
