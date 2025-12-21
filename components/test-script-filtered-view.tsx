import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TestScript,
  TestScriptCommon,
  TestScriptSetup,
  TestScriptSetupAction,
  TestScriptTeardown,
  TestScriptTeardownAction,
  TestScriptTest,
  TestScriptTestAction,
} from "@/types/fhir-enhanced"
import SyntaxHighlighter from "@/components/syntax-highlighter"
import { formatToJson } from "@/lib/formatters/json-formatter"
import { Check, Filter, Search, X } from "lucide-react"

type FilterTypeOption = "all" | "name" | "description" | "action"
type SectionFilterOption = "all" | "setup" | "test" | "teardown" | "common"

type ScriptAction = TestScriptSetupAction | TestScriptTestAction | TestScriptTeardownAction

interface FilterOptions {
  term: string
  type: FilterTypeOption
  showAssertions: boolean
  showOperations: boolean
}

interface TestScriptFilteredViewProps {
  testScript: TestScript
}

const hasAssertion = (action: ScriptAction): action is TestScriptSetupAction | TestScriptTestAction =>
  "assert" in action && action.assert !== undefined

const includesTerm = (value: string | undefined, term: string) => value?.toLowerCase().includes(term) ?? false

const matchesAction = (action: ScriptAction, options: FilterOptions): boolean => {
  const { showAssertions, showOperations, term, type } = options

  if (!showAssertions && hasAssertion(action)) {
    return false
  }

  if (!showOperations && action.operation) {
    return false
  }

  if (term === "") {
    return true
  }

  if (type === "all" || type === "description") {
    if (includesTerm(action.operation?.description, term)) return true
    if (hasAssertion(action) && includesTerm(action.assert?.description, term)) return true
  }

  if (type === "all" || type === "name") {
    if (includesTerm(action.operation?.label, term)) return true
    if (hasAssertion(action) && includesTerm(action.assert?.label, term)) return true
  }

  if (type === "all" || type === "action") {
    if (includesTerm(action.operation?.url, term)) return true
    if (includesTerm(action.operation?.resource, term)) return true
    if (hasAssertion(action) && includesTerm(action.assert?.expression, term)) return true
    if (hasAssertion(action) && includesTerm(action.assert?.value, term)) return true
  }

  return false
}

const filterActionList = <TAction extends ScriptAction>(
  actions: TAction[] | undefined,
  options: FilterOptions,
  includeWithoutSearch = false,
): TAction[] => {
  if (!actions) {
    return []
  }

  return actions.filter((action) => {
    if (!options.showAssertions && hasAssertion(action)) {
      return false
    }

    if (!options.showOperations && action.operation) {
      return false
    }

    return includeWithoutSearch || matchesAction(action, options)
  })
}

const filterSetupSection = (section: TestScriptSetup | undefined, options: FilterOptions): TestScriptSetup | undefined => {
  if (!section) {
    return undefined
  }

  const action = filterActionList(section.action, options)
  return { ...section, action }
}

const filterTeardownSection = (
  section: TestScriptTeardown | undefined,
  options: FilterOptions,
): TestScriptTeardown | undefined => {
  if (!section) {
    return undefined
  }

  const action = filterActionList(section.action, options)
  return { ...section, action }
}

const filterTestCase = (testCase: TestScriptTest, options: FilterOptions): TestScriptTest => {
  const { term, type } = options
  let matchesParent = term === ""

  if (!matchesParent) {
    if ((type === "all" || type === "name") && includesTerm(testCase.name, term)) {
      matchesParent = true
    }

    if ((type === "all" || type === "description") && includesTerm(testCase.description, term)) {
      matchesParent = true
    }
  }

  const action = filterActionList(testCase.action, options, matchesParent)
  return { ...testCase, action }
}

const filterCommonSection = (common: TestScriptCommon, options: FilterOptions): TestScriptCommon => {
  const { term, type } = options
  let matchesParent = term === ""

  if (!matchesParent) {
    if ((type === "all" || type === "name") && includesTerm(common.name, term)) {
      matchesParent = true
    }

    if ((type === "all" || type === "description") && includesTerm(common.description, term)) {
      matchesParent = true
    }
  }

  const action = filterActionList(common.action, options, matchesParent)
  return { ...common, action }
}

/**
 * Component for filtered display of TestScript contents
 */
export function TestScriptFilteredView({ testScript }: TestScriptFilteredViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterTypeOption>("all")
  const [filterSection, setFilterSection] = useState<SectionFilterOption>("all")
  const [showAssertions, setShowAssertions] = useState(true)
  const [showOperations, setShowOperations] = useState(true)

  const normalizedTerm = searchTerm.trim().toLowerCase()
  const filterOptions = useMemo<FilterOptions>(
    () => ({
      term: normalizedTerm,
      type: filterType,
      showAssertions,
      showOperations,
    }),
    [normalizedTerm, filterType, showAssertions, showOperations],
  )

  const filteredContent = useMemo(() => {
    const result: Partial<TestScript> = {
      resourceType: "TestScript",
      name: testScript.name,
      status: testScript.status,
    }

    if (testScript.experimental !== undefined) {
      result.experimental = testScript.experimental
    }

    if (filterSection === "all" || filterSection === "setup") {
      result.setup = filterSetupSection(testScript.setup, filterOptions)
    }

    if (filterSection === "all" || filterSection === "test") {
      result.test = testScript.test
        ?.map((testCase) => filterTestCase(testCase, filterOptions))
        .filter((testCase) => (testCase.action?.length ?? 0) > 0)
    }

    if (filterSection === "all" || filterSection === "teardown") {
      result.teardown = filterTeardownSection(testScript.teardown, filterOptions)
    }

    if (filterSection === "all" || filterSection === "common") {
      result.common = testScript.common
        ?.map((common) => filterCommonSection(common, filterOptions))
        .filter((common) => (common.action?.length ?? 0) > 0)
    }

    if (filterSection === "all") {
      if (testScript.testSystem) {
        result.testSystem = testScript.testSystem
      }
      if (testScript.origin) {
        result.origin = testScript.origin
      }
      if (testScript.destination) {
        result.destination = testScript.destination
      }
      if (testScript.fixture) {
        result.fixture = testScript.fixture
      }
      if (testScript.profile) {
        result.profile = testScript.profile
      }
      if (testScript.variable) {
        result.variable = testScript.variable
      }
      if (testScript.scope) {
        result.scope = testScript.scope
      }
    }

    return result
  }, [testScript, filterSection, filterOptions])

  const counts = useMemo(() => {
    let testCount = 0
    let actionCount = 0

    actionCount += filteredContent.setup?.action?.length ?? 0
    actionCount += filteredContent.teardown?.action?.length ?? 0

    if (filteredContent.test) {
      testCount += filteredContent.test.length
      filteredContent.test.forEach((testCase) => {
        actionCount += testCase.action?.length ?? 0
      })
    }

    if (filteredContent.common) {
      filteredContent.common.forEach((common) => {
        actionCount += common.action?.length ?? 0
      })
    }

    return { tests: testCount, actions: actionCount }
  }, [filteredContent])

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Label htmlFor="search-term" className="mb-2 block">
                  Suchbegriff
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-term"
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-8"
                  />
                  {searchTerm !== "" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-[200px]">
                <Label htmlFor="filter-type" className="mb-2 block">
                  Filtertyp
                </Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterTypeOption)}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    <SelectItem value="name">Names/Labels</SelectItem>
                    <SelectItem value="description">Descriptions</SelectItem>
                    <SelectItem value="action">Action Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-[200px]">
                <Label htmlFor="filter-section" className="mb-2 block">
                  Bereich
                </Label>
                <Select value={filterSection} onValueChange={(value) => setFilterSection(value as SectionFilterOption)}>
                  <SelectTrigger id="filter-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="test">Tests</SelectItem>
                    <SelectItem value="teardown">Teardown</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-assertions"
                  checked={showAssertions}
                  onCheckedChange={(checked) => setShowAssertions(Boolean(checked))}
                />
                <Label htmlFor="show-assertions">Assertions anzeigen</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-operations"
                  checked={showOperations}
                  onCheckedChange={(checked) => setShowOperations(Boolean(checked))}
                />
                <Label htmlFor="show-operations">Operationen anzeigen</Label>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Tests: {counts.tests}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Actions: {counts.actions}
              </Badge>
              {searchTerm !== "" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" /> Suche: &quot;{searchTerm}&quot;
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="json">
        <TabsList>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="mt-4">
          <SyntaxHighlighter
            language="json"
            code={formatToJson(filteredContent, 2)}
            showLineNumbers
            className="border rounded-md"
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredContent.setup?.action && filteredContent.setup.action.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Setup</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {filteredContent.setup.action.map((action, index) => (
                        <li key={`setup-${index}`}>
                          {action.operation && (
                            <span className="text-blue-600">
                              Operation: {action.operation.label || action.operation.resource || "Unbenannt"}
                            </span>
                          )}
                          {hasAssertion(action) && action.assert && (
                            <span className="text-green-600">
                              {" "}
                              | Assertion: {action.assert.label || action.assert.description || "Unbenannt"}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {filteredContent.test && filteredContent.test.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tests</h3>
                    {filteredContent.test.map((testCase, testIndex) => (
                      <div key={`test-${testIndex}`} className="mb-3">
                        <h4 className="font-medium text-md">{testCase.name || `Test ${testIndex + 1}`}</h4>
                        {testCase.description && (
                          <p className="text-sm text-muted-foreground mb-1">{testCase.description}</p>
                        )}
                        {testCase.action && testCase.action.length > 0 && (
                          <ul className="ml-4 list-disc list-inside space-y-1 text-sm">
                            {testCase.action.map((action, actionIndex) => (
                              <li key={`test-${testIndex}-action-${actionIndex}`}>
                                {action.operation && (
                                  <span className="text-blue-600">
                                    Operation: {action.operation.label || action.operation.resource || "Unbenannt"}
                                  </span>
                                )}
                                {hasAssertion(action) && action.assert && (
                                  <span className="text-green-600">
                                    {" "}
                                    | Assertion: {action.assert.label || action.assert.description || "Unbenannt"}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {filteredContent.teardown?.action && filteredContent.teardown.action.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Teardown</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {filteredContent.teardown.action.map((action, index) => (
                        <li key={`teardown-${index}`}>
                          {action.operation && (
                            <span className="text-blue-600">
                              Operation: {action.operation.label || action.operation.resource || "Unbenannt"}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {filteredContent.common && filteredContent.common.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Common</h3>
                    {filteredContent.common.map((common, commonIndex) => (
                      <div key={`common-${commonIndex}`} className="mb-3">
                        <h4 className="font-medium text-md">{common.name || `Common ${common.key}`}</h4>
                        {common.description && (
                          <p className="text-sm text-muted-foreground mb-1">{common.description}</p>
                        )}
                        {common.action && common.action.length > 0 && (
                          <ul className="ml-4 list-disc list-inside space-y-1 text-sm">
                            {common.action.map((action, actionIndex) => (
                              <li key={`common-${commonIndex}-action-${actionIndex}`}>
                                {action.operation && (
                                  <span className="text-blue-600">
                                    Operation: {action.operation.label || action.operation.resource || "Unbenannt"}
                                  </span>
                                )}
                                {hasAssertion(action) && action.assert && (
                                  <span className="text-green-600">
                                    {" "}
                                    | Assertion: {action.assert.label || action.assert.description || "Unbenannt"}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {counts.actions === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No results found for the current filter criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
