"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ClipboardCopy, EyeIcon, Code, FileJson, FileX } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatToXml } from "@/lib/formatters/xml-formatter"
import { formatToJson } from "@/lib/formatters/json-formatter"
import SyntaxHighlighter from "@/components/syntax-highlighter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StructuredView } from "@/components/structured-view"
import { TestScript } from "@/types/test-script"
import { validateTestScript } from "@/lib/validators/test-script-validator"
import { TestScriptFilteredView } from "@/components/test-script-filtered-view"
import { Badge } from "@/components/ui/badge"

interface OutputViewerProps {
  testScript: TestScript
}

/**
 * OutputViewer Komponente für die Anzeige und Bearbeitung eines TestScripts
 * 
 * Bietet verschiedene Ansichten:
 * - JSON-Ansicht mit Syntax-Hervorhebung
 * - XML-Ansicht mit Syntax-Hervorhebung
 * - Strukturierte Ansicht mit fokussierten Bereichen
 * - Gefilterte Ansicht für spezifische Teile des TestScripts
 * 
 * Funktionen:
 * - Kopieren in die Zwischenablage
 * - Herunterladen als Datei
 * - Anpassung der Einrückung
 * - Ein-/Ausblenden von Zeilennummern
 */
export default function OutputViewer({ testScript }: OutputViewerProps) {
  // Verschiedene Anzeige-States
  const [viewMode, setViewMode] = useState<"json" | "xml" | "structured" | "filtered">("json")
  const [indentSize, setIndentSize] = useState<number>(2)
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true)
  const [focusArea, setFocusArea] = useState<"all" | "setup" | "test" | "teardown" | "common">("all")
  
  // Validierung des TestScripts
  const validationResult = validateTestScript(testScript)
  
  /**
   * Filtert das TestScript nach dem ausgewählten Bereich
   */
  function getFilteredTestScript(): any {
    if (focusArea === "all") return testScript
    
    const filtered = { ...testScript }
    
    // Nur die ausgewählten Bereiche beibehalten
    if (focusArea !== "setup") delete filtered.setup
    if (focusArea !== "test") delete filtered.test
    if (focusArea !== "teardown") delete filtered.teardown
    if (focusArea !== "common") delete filtered.common
    
    return filtered
  }
  
  /**
   * Formatiert das TestScript entsprechend des ausgewählten Formats
   */
  function getFormattedContent(): string {
    try {
      const filtered = getFilteredTestScript()
      
      if (viewMode === "json") {
        return formatToJson(filtered, indentSize)
      } else {
        return formatToXml(filtered)
      }
    } catch (error) {
      console.error("Formatierungsfehler:", error)
      return `Fehler bei der Formatierung: ${error.message}`
    }
  }
  
  /**
   * Kopiert den formatierten Inhalt in die Zwischenablage
   */
  function copyToClipboard(): void {
    const content = getFormattedContent()
    
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success("In die Zwischenablage kopiert", {
          description: `TestScript ${viewMode.toUpperCase()} wurde kopiert`,
        })
      })
      .catch((error) => {
        toast.error("Fehler beim Kopieren", {
          description: error.message,
        })
      })
  }
  
  /**
   * Lädt den formatierten Inhalt als Datei herunter
   */
  function downloadContent(): void {
    const content = getFormattedContent()
    const extension = viewMode === "json" ? "json" : "xml"
    const filename = `testscript_${testScript.id || "export"}.${extension}`
    
    const blob = new Blob([content], { type: `application/${extension}` })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    // Aufräumen
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    toast.success("Datei heruntergeladen", {
      description: `${filename} wurde heruntergeladen`,
    })
  }
  
  return (
    <div className="space-y-4">
      {/* Validierungshinweis */}
      {!validationResult.valid && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <div className="flex items-start">
            <div className="ml-3">
              <p className="font-medium">Validierungswarnung</p>
              <ul className="mt-1 list-disc list-inside">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* TestScript Metadaten */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{testScript.name}</h2>
              {testScript.description && (
                <p className="text-muted-foreground mt-1">{testScript.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {testScript.status && (
                <Badge variant={testScript.status === "active" ? "default" : "outline"}>
                  {testScript.status}
                </Badge>
              )}
              {testScript.experimental && (
                <Badge variant="secondary">Experimentell</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ansicht-Steuerelemente */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Tabs defaultValue="json" value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </TabsTrigger>
            <TabsTrigger value="xml" className="flex items-center gap-2">
              <FileX className="h-4 w-4" />
              <span className="hidden sm:inline">XML</span>
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Strukturiert</span>
            </TabsTrigger>
            <TabsTrigger value="filtered" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Gefiltert</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Formatierungssteuerung für Code-Ansichten */}
          {(viewMode === "json" || viewMode === "xml") && (
            <div className="flex flex-wrap gap-4 mt-4">
              {viewMode === "json" && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="indent-size">Einrückung:</Label>
                  <Input
                    id="indent-size"
                    type="number"
                    min={0}
                    max={8}
                    value={indentSize}
                    onChange={(e) => setIndentSize(parseInt(e.target.value) || 2)}
                    className="w-16"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Switch
                  id="line-numbers"
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                />
                <Label htmlFor="line-numbers">Zeilennummern</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="focus-area">Fokus:</Label>
                <Select value={focusArea} onValueChange={(v) => setFocusArea(v as any)}>
                  <SelectTrigger id="focus-area" className="w-[180px]">
                    <SelectValue placeholder="Bereich auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Gesamtes TestScript</SelectItem>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="test">Tests</SelectItem>
                    <SelectItem value="teardown">Teardown</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Aktionsbuttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <ClipboardCopy className="h-4 w-4" />
              <span>Kopieren</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadContent}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Herunterladen</span>
            </Button>
          </div>
          
          {/* Ansichtsbereich für das TestScript */}
          <div className="mt-4 border rounded-md overflow-hidden">
            <TabsContent value="json" className="m-0">
              <SyntaxHighlighter
                language="json"
                code={getFormattedContent()}
                showLineNumbers={showLineNumbers}
              />
            </TabsContent>
            
            <TabsContent value="xml" className="m-0">
              <SyntaxHighlighter
                language="xml"
                code={getFormattedContent()}
                showLineNumbers={showLineNumbers}
              />
            </TabsContent>
            
            <TabsContent value="structured" className="m-0 p-0">
              <StructuredView testScript={testScript} focusArea={focusArea} />
            </TabsContent>
            
            <TabsContent value="filtered" className="m-0 p-0">
              <TestScriptFilteredView testScript={testScript} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
