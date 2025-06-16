"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { JsonView } from "@/components/json-view"
import { XmlView } from "@/components/xml-view"
import { FilteredView } from "./filtered-view"
import { ValidationTab } from "@/components/validation-tab"

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
export function OutputViewer({ testScript }: OutputViewerProps) {
  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList>
        <TabsTrigger value="json">JSON</TabsTrigger>
        <TabsTrigger value="xml">XML</TabsTrigger>
        <TabsTrigger value="structured">Strukturiert</TabsTrigger>
        <TabsTrigger value="validation">Validierung</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonView testScript={testScript} />
      </TabsContent>
      <TabsContent value="xml">
        <XmlView testScript={testScript} />
      </TabsContent>
      <TabsContent value="structured">
        <StructuredView testScript={testScript} />
      </TabsContent>
      <TabsContent value="validation">
        <ValidationTab testScript={testScript} />
      </TabsContent>
    </Tabs>
  )
}
