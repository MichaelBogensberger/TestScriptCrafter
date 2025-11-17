"use client"

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Plus, TestTube, Trash2 } from "lucide-react"
import type { TestScript, TestScriptTest } from "@/types/fhir-enhanced"
import { ProgressIndicator } from "./progress-indicator"
import BasicInfoSection from "./sections/basic-info-section"
import MetadataSection from "./sections/metadata-section"
import SetupSection from "./sections/setup-section"
import { TestCaseSection } from "./sections/test-case-section"
import TeardownSection from "./sections/teardown-section"
import { TestSystemSection } from "./sections/test-system-section"
import { EndpointsSection } from "./sections/endpoints-section"
import { FixturesSection } from "./sections/fixtures-section"
import { ProfilesSection } from "./sections/profiles-section"
import { VariablesSection } from "./sections/variables-section"
import { ScopeSection } from "./sections/scope-section"
import { CommonSection } from "./sections/common-section"

type SectionKey =
  | "basic-info"
  | "metadata"
  | "systems"
  | "fixtures"
  | "variables"
  | "scope"
  | "setup"
  | "tests"
  | "teardown"
  | "common"

const SECTION_DETAILS: Record<SectionKey, { title: string; description: string }> = {
  "basic-info": {
    title: "Grundlegende Informationen",
    description: "Name, Status und allgemeine Metadaten deines TestScripts.",
  },
  metadata: {
    title: "Metadaten",
    description: "Capabilities und Links, die dein TestScript voraussetzt.",
  },
  systems: {
    title: "Systeme & Endpunkte",
    description: "Definiere verfügbare Systeme sowie Origin- und Destination-Zuordnungen.",
  },
  fixtures: {
    title: "Fixtures & Profile",
    description: "Referenzen auf vorbereitete Ressourcen und verwendete Profile.",
  },
  variables: {
    title: "Variablen",
    description: "Parameter, die während der Ausführung ersetzt werden.",
  },
  scope: {
    title: "Scope",
    description: "Grenzt die Anwendungsfälle deines TestScripts ein.",
  },
  setup: {
    title: "Setup",
    description: "Vorbereitende Operationen vor den eigentlichen Tests.",
  },
  tests: {
    title: "Testszenarien",
    description: "Definiere Testfälle mit Operationen und Assertions.",
  },
  teardown: {
    title: "Teardown",
    description: "Aufräumarbeiten nach Abschluss der Tests.",
  },
  common: {
    title: "Common Aktionen",
    description: "Wiederverwendbare Aktionen, die über Schlüssel referenziert werden.",
  },
}

const SECTION_GROUPS: Array<{
  id: string
  title: string
  sections: SectionKey[]
}> = [
  {
    id: "overview",
    title: "Übersicht",
    sections: ["basic-info", "metadata"],
  },
  {
    id: "infrastructure",
    title: "Infrastruktur",
    sections: ["systems", "fixtures", "variables", "scope"],
  },
  {
    id: "execution",
    title: "Ausführung",
    sections: ["setup", "tests", "teardown", "common"],
  },
]

interface FormBuilderProps {
  testScript: TestScript
  updateTestScript: (newData: Partial<TestScript>) => void
  updateSection: <K extends keyof TestScript>(section: K, data: TestScript[K]) => void
}

function FormBuilder({ testScript, updateTestScript, updateSection }: FormBuilderProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("basic-info")
  const [activeTestIndex, setActiveTestIndex] = useState(0)

  const metadata = useMemo(() => testScript.metadata ?? { capability: [] }, [testScript.metadata])
  const tests = useMemo(() => testScript.test ?? [], [testScript.test])

  useEffect(() => {
    if (tests.length === 0) {
      setActiveTestIndex(0)
      return
    }
    setActiveTestIndex((prev) => Math.min(prev, tests.length - 1))
  }, [tests.length])

  const addTestCase = useCallback(() => {
    const nextIndex = tests.length
    const newTest: TestScriptTest = {
      name: `Testfall ${nextIndex + 1}`,
      description: "",
      action: [],
    }
    const next = [...tests, newTest]
    updateSection("test", next)
    setActiveSection("tests")
    setActiveTestIndex(nextIndex)
  }, [tests, updateSection])

  const removeTestCase = useCallback(
    (index: number) => {
      const next = tests.filter((_, idx) => idx !== index)
      updateSection("test", next.length > 0 ? next : undefined)
      setActiveTestIndex((prev) => {
        if (next.length === 0) return 0
        if (prev === index) return Math.max(0, index - 1)
        if (prev > index) return prev - 1
        return prev
      })
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

  const sectionCompleteness = useMemo(() => {
    const hasBasicInfo = Boolean(testScript.name && testScript.status && testScript.url)
    const hasMetadata = Boolean(metadata.capability?.length)
    const hasSystems = Boolean(
      (testScript.testSystem?.length ?? 0) > 0 ||
        (testScript.origin?.length ?? 0) > 0 ||
        (testScript.destination?.length ?? 0) > 0,
    )
    const hasFixtures = Boolean(
      (testScript.fixture?.length ?? 0) > 0 || (testScript.profile?.length ?? 0) > 0,
    )
    const hasVariables = Boolean(testScript.variable?.length)
    const hasScope = Boolean(testScript.scope?.length)
    const hasSetup = Boolean(testScript.setup?.action?.length)
    const hasTests =
      tests.length > 0 && tests.every((test) => (test.action?.length ?? 0) > 0)
    const hasTeardown = Boolean(testScript.teardown?.action?.length)
    const hasCommon = Boolean(testScript.common?.length)

    return {
      "basic-info": hasBasicInfo,
      metadata: hasMetadata,
      systems: hasSystems,
      fixtures: hasFixtures,
      variables: hasVariables,
      scope: hasScope,
      setup: hasSetup,
      tests: hasTests,
      teardown: hasTeardown,
      common: hasCommon,
    }
  }, [metadata, testScript, tests])

  const progressCompleteness = useMemo(
    () => ({
      basicInfo: sectionCompleteness["basic-info"],
      metadata: sectionCompleteness.metadata,
      setup: sectionCompleteness.setup,
      tests: sectionCompleteness.tests,
      teardown: sectionCompleteness.teardown,
    }),
    [sectionCompleteness],
  )

  const overallProgress = useMemo(() => {
    const relevantKeys: Array<keyof typeof progressCompleteness> = [
      "basicInfo",
      "metadata",
      "setup",
      "tests",
      "teardown",
    ]
    const completed = relevantKeys.filter((key) => progressCompleteness[key]).length
    return Math.round((completed / relevantKeys.length) * 100)
  }, [progressCompleteness])

  const activeMeta = SECTION_DETAILS[activeSection]
  const testsActionTotal = useMemo(
    () => tests.reduce((sum, test) => sum + (test.action?.length ?? 0), 0),
    [tests],
  )

  const renderSectionContent = (): ReactNode => {
    switch (activeSection) {
      case "basic-info":
        return <BasicInfoSection testScript={testScript} updateTestScript={updateTestScript} />
      case "metadata":
        return (
          <MetadataSection
            metadata={metadata}
            updateMetadata={(value) => updateSection("metadata", value)}
          />
        )
      case "systems":
        return (
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
        )
      case "fixtures":
        return (
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
        )
      case "variables":
        return (
          <VariablesSection
            variables={testScript.variable}
            updateVariables={(value) => updateSection("variable", value)}
          />
        )
      case "scope":
        return (
          <ScopeSection
            scopes={testScript.scope}
            updateScopes={(value) => updateSection("scope", value)}
          />
        )
      case "setup":
        return (
          <SetupSection
            setup={testScript.setup ?? { action: [] }}
            updateSetup={(value) => updateSection("setup", value)}
          />
        )
      case "tests":
        return (
          <TestsPanel
            tests={tests}
            activeIndex={activeTestIndex}
            onSelect={setActiveTestIndex}
            onAddTest={addTestCase}
            onRemoveTest={removeTestCase}
            onUpdateTest={updateTestCase}
          />
        )
      case "teardown":
        return (
          <TeardownSection
            teardown={testScript.teardown ?? { action: [] }}
            updateTeardown={(value) => updateSection("teardown", value)}
          />
        )
      case "common":
        return (
          <CommonSection
            common={testScript.common}
            updateCommon={(value) => updateSection("common", value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <ProgressIndicator
        overallProgress={overallProgress}
        sectionCompleteness={progressCompleteness}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="relative flex flex-col overflow-hidden p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Arbeitsbereiche</h3>
              <p className="text-xs text-muted-foreground">
                Navigiere durch alle Bereiche des TestScripts. Nur der aktive Bereich wird gerendert, das sorgt für bessere Performance.
              </p>
            </div>

            <div className="relative">
              <ScrollArea className="pr-2 min-h-[420px] max-h-[70vh] md:max-h-none">
                <div className="space-y-4">
                  {SECTION_GROUPS.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {group.title}
                      </p>
                      <div className="space-y-1">
                        {group.sections.map((sectionKey) => {
                          const isActive = activeSection === sectionKey
                          const isComplete = sectionCompleteness[sectionKey]
                          const meta = SECTION_DETAILS[sectionKey]
                          return (
                            <button
                              key={sectionKey}
                              type="button"
                              onClick={() => setActiveSection(sectionKey)}
                              className={cn(
                                "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                                isActive
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-transparent hover:bg-muted",
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="font-medium">{meta.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {meta.description}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {sectionKey === "tests" ? (
                                    <div className="flex gap-1">
                                      <Badge variant="outline" className="text-[10px]">
                                        {tests.length} Tests
                                      </Badge>
                                      <Badge variant="secondary" className="text-[10px]">
                                        {testsActionTotal} Aktionen
                                      </Badge>
                                    </div>
                                  ) : null}
                                  {isComplete ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </Card>

        <Card className="flex min-h-[500px] flex-col space-y-6 p-6 lg:min-h-[70vh]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{activeMeta.title}</h2>
            <p className="text-sm text-muted-foreground">{activeMeta.description}</p>
          </div>
          <div className="space-y-6">{renderSectionContent()}</div>
        </Card>
      </div>
    </div>
  )
}

interface TestsPanelProps {
  tests: TestScriptTest[]
  activeIndex: number
  onSelect: (index: number) => void
  onAddTest: () => void
  onRemoveTest: (index: number) => void
  onUpdateTest: (index: number, test: TestScriptTest) => void
}

const TestsPanel = memo(function TestsPanel({
  tests,
  activeIndex,
  onSelect,
  onAddTest,
  onRemoveTest,
  onUpdateTest,
}: TestsPanelProps) {
  const activeTest = tests[activeIndex]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Testfälle verwalten</h3>
          <p className="text-xs text-muted-foreground">
            Erstelle neue Testfälle oder wähle einen Eintrag aus der Liste, um ihn zu bearbeiten.
          </p>
        </div>
        <Button onClick={onAddTest} size="sm" className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Testfall hinzufügen
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Noch keine Testfälle definiert. Lege den ersten Testfall an, um Aktionen hinzufügen zu können.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <Card className="p-3">
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-2">
                {tests.map((test, idx) => {
                  const actionCount = test.action?.length ?? 0
                  const isActive = activeIndex === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelect(idx)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-transparent hover:bg-muted",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{test.name || `Testfall ${idx + 1}`}</span>
                        <Badge variant={actionCount > 0 ? "default" : "secondary"} className="text-[10px]">
                          {actionCount} Aktionen
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {test.description || "Keine Beschreibung"}
                      </p>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </Card>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TestTube className="h-4 w-4 text-primary" />
                <span>{activeTest?.name || `Testfall ${activeIndex + 1}`}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-2 text-destructive"
                onClick={() => onRemoveTest(activeIndex)}
              >
                <Trash2 className="h-4 w-4" />
                Entfernen
              </Button>
            </div>

            <Card className="p-4">
              {activeTest ? (
                <TestCaseSection
                  test={activeTest}
                  testIndex={activeIndex}
                  updateTest={(value) => onUpdateTest(activeIndex, value)}
                  removeTest={() => onRemoveTest(activeIndex)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Wähle links einen Testfall aus, um seine Aktionen zu bearbeiten.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
})

export { FormBuilder }
export default FormBuilder
