"use client"

import { useCallback, useMemo, useState } from "react"
import { Accordion } from "@/components/ui/accordion"
import type { TestScript, TestScriptTest } from "@/types/fhir-enhanced"
import { ProgressIndicator } from "./progress-indicator"
import { TestCaseManager } from "./test-case-manager"
import { SectionAccordionItem } from "./sections/section-accordion-item"
import BasicInfoSection from "./sections/basic-info-section"
import MetadataSection from "./sections/metadata-section"
import SetupSection from "./sections/setup-section"
import TestCaseSection from "./sections/test-case-section"
import TeardownSection from "./sections/teardown-section"
import { TestSystemSection } from "./sections/test-system-section"
import { EndpointsSection } from "./sections/endpoints-section"
import { FixturesSection } from "./sections/fixtures-section"
import { ProfilesSection } from "./sections/profiles-section"
import { VariablesSection } from "./sections/variables-section"
import { ScopeSection } from "./sections/scope-section"
import { CommonSection } from "./sections/common-section"

interface FormBuilderProps {
  testScript: TestScript
  updateTestScript: (newData: Partial<TestScript>) => void
  updateSection: <K extends keyof TestScript>(section: K, data: TestScript[K]) => void
}

const DEFAULT_METADATA = { capability: [] }

function FormBuilder({ testScript, updateTestScript, updateSection }: FormBuilderProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-info",
    "metadata",
    "setup",
  ])

  const metadata = useMemo(
    () => testScript.metadata ?? DEFAULT_METADATA,
    [testScript.metadata],
  )
  const tests = useMemo(() => testScript.test ?? [], [testScript.test])

  const addTestCase = useCallback(() => {
    const newTest: TestScriptTest = {
      name: `Testfall ${tests.length + 1}`,
      description: "",
      action: [],
    }
    updateSection("test", [...tests, newTest])
  }, [tests, updateSection])

  const removeTestCase = useCallback(
    (index: number) => {
      const next = tests.filter((_, idx) => idx !== index)
      updateSection("test", next.length > 0 ? next : undefined)
    },
    [tests, updateSection],
  )

  const updateTestCase = useCallback(
    (index: number, updated: TestScriptTest) => {
      const next = [...tests]
      next[index] = updated
      updateSection("test", next)
    },
    [tests, updateSection],
  )

  const expandSection = useCallback((section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev : [...prev, section],
    )
  }, [])

  const sectionCompleteness = useMemo(() => {
    const hasBasicInfo = Boolean(testScript.name && testScript.status)
    const hasMetadata = Boolean(metadata.capability?.length)
    const hasSetup = Boolean(testScript.setup?.action?.length)
    const hasTests = tests.length > 0
    const hasTeardown = Boolean(testScript.teardown?.action?.length)

    return {
      basicInfo: hasBasicInfo,
      metadata: hasMetadata,
      systems: true,
      fixtures: true,
      variables: true,
      scope: true,
      setup: hasSetup,
      tests: hasTests,
      teardown: hasTeardown,
      common: true,
    }
  }, [metadata.capability?.length, testScript, tests.length])

  const overallProgress = useMemo(() => {
    const relevantKeys: Array<keyof typeof sectionCompleteness> = [
      "basicInfo",
      "metadata",
      "setup",
      "tests",
      "teardown",
    ]
    const completed = relevantKeys.filter((key) => sectionCompleteness[key]).length
    return Math.round((completed / relevantKeys.length) * 100)
  }, [sectionCompleteness])

  return (
    <div className="space-y-6">
      <ProgressIndicator overallProgress={overallProgress} sectionCompleteness={sectionCompleteness} />

      <TestCaseManager
        tests={tests}
        onAddTest={addTestCase}
        onRemoveTest={removeTestCase}
        onExpandSection={expandSection}
      />

      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="w-full"
      >
        <SectionAccordionItem
          value="basic-info"
          title="Grundlegende Informationen"
          isComplete={sectionCompleteness.basicInfo}
        >
          <BasicInfoSection testScript={testScript} updateTestScript={updateTestScript} />
        </SectionAccordionItem>

        <SectionAccordionItem
          value="metadata"
          title="Metadaten"
          isComplete={sectionCompleteness.metadata}
        >
          <MetadataSection metadata={metadata} updateMetadata={(value) => updateSection("metadata", value)} />
        </SectionAccordionItem>

        <SectionAccordionItem
          value="systems"
          title="Systeme & Endpoints"
          isComplete={sectionCompleteness.systems}
        >
          <div className="space-y-6">
            <TestSystemSection
              testSystems={testScript.testSystem}
              updateTestSystems={(value) => updateSection("testSystem", value)}
            />
            <EndpointsSection
              origin={testScript.origin}
              destination={testScript.destination}
              updateOrigin={(value) => updateSection("origin", value)}
              updateDestination={(value) => updateSection("destination", value)}
            />
          </div>
        </SectionAccordionItem>

        <SectionAccordionItem
          value="fixtures"
          title="Fixtures & Profile"
          isComplete={sectionCompleteness.fixtures}
        >
          <div className="space-y-6">
            <FixturesSection
              fixtures={testScript.fixture}
              updateFixtures={(value) => updateSection("fixture", value)}
            />
            <ProfilesSection
              profiles={testScript.profile}
              updateProfiles={(value) => updateSection("profile", value)}
            />
          </div>
        </SectionAccordionItem>

        <SectionAccordionItem
          value="variables"
          title="Variablen"
          isComplete={sectionCompleteness.variables}
        >
          <VariablesSection
            variables={testScript.variable}
            updateVariables={(value) => updateSection("variable", value)}
          />
        </SectionAccordionItem>

        <SectionAccordionItem
          value="scope"
          title="Scope"
          isComplete={sectionCompleteness.scope}
        >
          <ScopeSection scopes={testScript.scope} updateScopes={(value) => updateSection("scope", value)} />
        </SectionAccordionItem>

        <SectionAccordionItem
          value="setup"
          title="Setup"
          isComplete={sectionCompleteness.setup}
        >
          <SetupSection
            setup={testScript.setup ?? { action: [] }}
            updateSetup={(value) => updateSection("setup", value)}
          />
        </SectionAccordionItem>

        {tests.map((test, idx) => (
          <SectionAccordionItem
            key={`test-${idx}`}
            value={`test-${idx}`}
            title={test.name || `Testfall ${idx + 1}`}
            isComplete={Boolean(test.action?.length)}
          >
            <TestCaseSection
              test={test}
              testIndex={idx}
              updateTest={(value) => updateTestCase(idx, value)}
              removeTest={() => removeTestCase(idx)}
            />
          </SectionAccordionItem>
        ))}

        <SectionAccordionItem
          value="teardown"
          title="Teardown"
          isComplete={sectionCompleteness.teardown}
        >
          <TeardownSection
            teardown={testScript.teardown ?? { action: [] }}
            updateTeardown={(value) => updateSection("teardown", value)}
          />
        </SectionAccordionItem>

        <SectionAccordionItem
          value="common"
          title="Common Aktionen"
          isComplete={sectionCompleteness.common}
        >
          <CommonSection
            common={testScript.common}
            updateCommon={(value) => updateSection("common", value)}
          />
        </SectionAccordionItem>
      </Accordion>
    </div>
  )
}

export default FormBuilder
