"use client"

import { useState, useCallback, useMemo } from "react"
import { Accordion } from "@/components/ui/accordion"
import type { TestScript, TestScriptTest } from "@/types/fhir-enhanced"
import { SectionAccordionItem } from "./sections/section-accordion-item"
import { ProgressIndicator } from "./progress-indicator"
import { TestCaseManager } from "./test-case-manager"
import BasicInfoSection from "./sections/basic-info-section"
import MetadataSection from "./sections/metadata-section"
import SetupSection from "./sections/setup-section"
import TestCaseSection from "./sections/test-case-section"
import TeardownSection from "./sections/teardown-section"

interface FormBuilderProps {
  testScript: TestScript
  updateTestScript: (newData: Partial<TestScript>) => void
  updateSection: <K extends keyof TestScript>(section: K, data: TestScript[K]) => void
}

/**
 * FormBuilder-Komponente, die alle Formularabschnitte rendert
 * Refaktorisiert mit sauberer Trennung der Verantwortlichkeiten
 */
function FormBuilder({ testScript, updateTestScript, updateSection }: FormBuilderProps) {
  // State für erweiterte Accordion-Abschnitte
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic-info", "metadata"])

  // Sichere Zugriffe auf möglicherweise undefined Eigenschaften
  const tests = useMemo(() => testScript.test ?? [], [testScript.test])
  const metadata = useMemo(
    () => testScript.metadata ?? { capability: [] },
    [testScript.metadata],
  )

  /**
   * Fügt einen neuen Testfall zum TestScript hinzu
   */
  const addTestCase = useCallback(() => {
    const newTest: TestScriptTest = {
      name: `Test Case ${tests.length + 1}`,
      description: "New test case",
      action: [],
    }

    const updatedTests = [...tests, newTest]
    updateSection("test", updatedTests)
  }, [tests, updateSection])

  /**
   * Entfernt einen Testfall
   */
  const removeTestCase = useCallback((index: number) => {
    const updatedTests = tests.filter((_, i) => i !== index)
    updateSection("test", updatedTests)
  }, [tests, updateSection])

  /**
   * Aktualisiert einen spezifischen Testfall
   */
  const updateTestCase = useCallback((index: number, updatedTest: TestScriptTest) => {
    const updatedTests = [...tests]
    updatedTests[index] = updatedTest
    updateSection("test", updatedTests)
  }, [tests, updateSection])

  /**
   * Erweitert einen Accordion-Abschnitt
   */
  const expandSection = useCallback((section: string) => {
    setExpandedSections(prev => [...prev, section])
  }, [])

  /**
   * Berechnet die Vollständigkeit der Sektionen
   */
  const sectionCompleteness = useMemo(() => {
    return {
      basicInfo: !!(testScript.name && testScript.status && testScript.url),
      metadata: !!(metadata.capability && metadata.capability.length > 0),
      setup: !!(testScript.setup && testScript.setup.action && testScript.setup.action.length > 0),
      tests: tests.length > 0,
      teardown: !!(testScript.teardown && testScript.teardown.action && testScript.teardown.action.length > 0)
    }
  }, [testScript, metadata, tests])

  /**
   * Berechnet den Gesamtfortschritt
   */
  const overallProgress = useMemo(() => {
    const sections = Object.values(sectionCompleteness)
    const completed = sections.filter(Boolean).length
    return Math.round((completed / sections.length) * 100)
  }, [sectionCompleteness])

  return (
    <div className="space-y-6">
      {/* Fortschrittsanzeige */}
      <ProgressIndicator 
        overallProgress={overallProgress}
        sectionCompleteness={sectionCompleteness}
      />

      {/* Testfall-Verwaltung */}
      <TestCaseManager
        tests={tests}
        onAddTest={addTestCase}
        onRemoveTest={removeTestCase}
        onUpdateTest={updateTestCase}
        onExpandSection={expandSection}
      />

      {/* Hauptformular-Akkordeon */}
      <Accordion 
        type="multiple" 
        value={expandedSections} 
        onValueChange={setExpandedSections} 
        className="w-full"
      >
        {/* Grundlegende Informationen */}
        <SectionAccordionItem
          value="basic-info"
          title="Grundlegende Informationen"
          isComplete={sectionCompleteness.basicInfo}
        >
          <BasicInfoSection 
            testScript={testScript} 
            updateTestScript={updateTestScript} 
          />
        </SectionAccordionItem>

        {/* Metadaten */}
        <SectionAccordionItem
          value="metadata"
          title="Metadaten"
          isComplete={sectionCompleteness.metadata}
        >
          <MetadataSection
            metadata={metadata}
            updateMetadata={(metadata) => updateSection("metadata", metadata)}
          />
        </SectionAccordionItem>

        {/* Setup */}
        <SectionAccordionItem
          value="setup"
          title="Setup"
          isComplete={sectionCompleteness.setup}
        >
          <SetupSection 
            setup={testScript.setup || { action: [] }} 
            updateSetup={(setup) => updateSection("setup", setup)} 
          />
        </SectionAccordionItem>

        {/* Testfälle */}
        {tests.map((test, testIndex) => (
          <SectionAccordionItem
            key={`test-${testIndex}`}
            value={`test-${testIndex}`}
            title={test.name || `Testfall ${testIndex + 1}`}
            isComplete={!!(test.action && test.action.length > 0)}
          >
            <TestCaseSection
              test={test}
              testIndex={testIndex}
              updateTest={(updatedTest) => updateTestCase(testIndex, updatedTest)}
              removeTest={() => removeTestCase(testIndex)}
            />
          </SectionAccordionItem>
        ))}

        {/* Teardown */}
        <SectionAccordionItem
          value="teardown"
          title="Teardown"
          isComplete={sectionCompleteness.teardown}
        >
          <TeardownSection
            teardown={testScript.teardown || { action: [] }}
            updateTeardown={(teardown) => updateSection("teardown", teardown)}
          />
        </SectionAccordionItem>
      </Accordion>
    </div>
  )
}

export default FormBuilder
