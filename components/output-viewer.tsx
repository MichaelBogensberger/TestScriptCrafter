"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StructuredView } from "@/components/structured-view"
import { TestScript } from "@/types/fhir-enhanced"
import { JsonView } from "@/components/json-view"
import { XmlView } from "@/components/xml-view"
import { ValidationTab } from "@/components/validation-tab"
import { useFhirValidation } from "@/hooks/use-fhir-validation"

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
  // Zentrale Validierungsergebnisse für ALLE Tabs (inkl. ValidationTab)
  const validationState = useFhirValidation();
  const { 
    isValidating, 
    validationResult, 
    validate,
    serverError,
    serverUrl,
    setServerUrl,
    currentFhirVersion,
    lastRequestPayload,
    lastServerResponse 
  } = validationState;
  
  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList>
        <TabsTrigger value="json">JSON</TabsTrigger>
        <TabsTrigger value="xml">XML</TabsTrigger>
        <TabsTrigger value="structured">Strukturiert</TabsTrigger>
        <TabsTrigger value="validation">Validierung</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonView testScript={testScript} validationState={validationState} />
      </TabsContent>
      <TabsContent value="xml">
        <XmlView testScript={testScript} validationState={validationState} />
      </TabsContent>
      <TabsContent value="structured">
        <StructuredView testScript={testScript} />
      </TabsContent>
      <TabsContent value="validation">
        <ValidationTab 
          testScript={testScript} 
          isValidating={isValidating}
          validationResult={validationResult}
          validate={validate}
          serverError={serverError}
          serverUrl={serverUrl}
          setServerUrl={setServerUrl}
          currentFhirVersion={currentFhirVersion}
          lastRequestPayload={lastRequestPayload}
          lastServerResponse={lastServerResponse}
        />
      </TabsContent>
    </Tabs>
  )
}
