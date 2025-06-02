"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from "lucide-react"
import type { TestScript } from "@/types/test-script"
import BasicInfoSection from "./sections/basic-info-section"
import MetadataSection from "./sections/metadata-section"
import SetupSection from "./sections/setup-section"
import TestCaseSection from "./sections/test-case-section"
import TeardownSection from "./sections/teardown-section"

interface FormBuilderProps {
  testScript: TestScript
  updateTestScript: (newData: Partial<TestScript>) => void
  updateSection: (section: keyof TestScript, data: any) => void
}

/**
 * FormBuilder-Komponente, die alle Formularabschnitte rendert
 * Diese Komponente verwaltet, welche Abschnitte erweitert sind, und ermöglicht das Hinzufügen neuer Testfälle
 */
function FormBuilder({ testScript, updateTestScript, updateSection }: FormBuilderProps) {
  // Speichern, welche Akkordeon-Abschnitte geöffnet sind
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic-info", "metadata"])

  /**
   * Fügt einen neuen Testfall zum TestScript hinzu
   */
  function addTestCase() {
    // Neuen Test erstellen
    const newTest = {
      name: `Test Case ${testScript.test.length + 1}`,
      description: "New test case",
      action: [],
    }

    // Tests aktualisieren
    const updatedTests = [...testScript.test, newTest]
    updateSection("test", updatedTests)

    // Neu hinzugefügten Testfall aufklappen
    setExpandedSections([...expandedSections, `test-${testScript.test.length}`])
  }

  return (
    <div className="space-y-6">
      {/* Akkordeon für alle Formularabschnitte */}
      <Accordion 
        type="multiple" 
        value={expandedSections} 
        onValueChange={setExpandedSections} 
        className="w-full"
      >
        {/* Grundlegende Informationen */}
        <AccordionItem value="basic-info">
          <AccordionTrigger className="text-lg font-medium">
            Grundlegende Informationen
          </AccordionTrigger>
          <AccordionContent>
            <BasicInfoSection 
              testScript={testScript} 
              updateTestScript={updateTestScript} 
            />
          </AccordionContent>
        </AccordionItem>

        {/* Metadaten */}
        <AccordionItem value="metadata">
          <AccordionTrigger className="text-lg font-medium">
            Metadaten
          </AccordionTrigger>
          <AccordionContent>
            <MetadataSection
              metadata={testScript.metadata}
              updateMetadata={(metadata) => updateSection("metadata", metadata)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Setup */}
        <AccordionItem value="setup">
          <AccordionTrigger className="text-lg font-medium">
            Setup
          </AccordionTrigger>
          <AccordionContent>
            <SetupSection 
              setup={testScript.setup} 
              updateSetup={(setup) => updateSection("setup", setup)} 
            />
          </AccordionContent>
        </AccordionItem>

        {/* Testfälle */}
        {testScript.test.map((test, testIndex) => (
          <AccordionItem key={`test-${testIndex}`} value={`test-${testIndex}`}>
            <AccordionTrigger className="text-lg font-medium">
              {test.name || `Testfall ${testIndex + 1}`}
            </AccordionTrigger>
            <AccordionContent>
              <TestCaseSection
                test={test}
                testIndex={testIndex}
                updateTest={(updatedTest) => {
                  // Aktualisiere den Testfall im Array
                  const updatedTests = [...testScript.test]
                  updatedTests[testIndex] = updatedTest
                  updateSection("test", updatedTests)
                }}
                removeTest={() => {
                  // Entferne den Testfall aus dem Array
                  const updatedTests = testScript.test.filter((_, i) => i !== testIndex)
                  updateSection("test", updatedTests)
                }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}

        {/* Teardown */}
        <AccordionItem value="teardown">
          <AccordionTrigger className="text-lg font-medium">
            Teardown
          </AccordionTrigger>
          <AccordionContent>
            <TeardownSection
              teardown={testScript.teardown}
              updateTeardown={(teardown) => updateSection("teardown", teardown)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Button zum Hinzufügen eines neuen Testfalls */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-1" 
          onClick={addTestCase}
        >
          <Plus className="h-4 w-4" /> Testfall hinzufügen
        </Button>
      </div>
    </div>
  )
}

export default FormBuilder
