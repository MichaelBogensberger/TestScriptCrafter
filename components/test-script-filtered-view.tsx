import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { TestScript } from "@/types/fhir-enhanced"
import SyntaxHighlighter from "@/components/syntax-highlighter"
import { formatToJson } from "@/lib/formatters/json-formatter"
import { Check, Filter, Search, X } from "lucide-react"

interface TestScriptFilteredViewProps {
  testScript: TestScript
}

/**
 * Komponente zum gefilterten Anzeigen von TestScript-Inhalten
 * Ermöglicht detaillierte Filterung nach verschiedenen Kriterien
 */
export function TestScriptFilteredView({ testScript }: TestScriptFilteredViewProps) {
  // Filter-States
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "name" | "description" | "action">("all")
  const [filterSection, setFilterSection] = useState<"all" | "setup" | "test" | "teardown" | "common">("all")
  const [showAssertions, setShowAssertions] = useState(true)
  const [showOperations, setShowOperations] = useState(true)
  
  // Gefilterte Daten
  const filteredContent = useMemo(() => {
    let result: any = { resourceType: "TestScript" }

    // Grundlegende Eigenschaften immer beibehalten
    result.name = testScript.name
    result.status = testScript.status
    
    // Filter nach Abschnitten
    if (filterSection === "all" || filterSection === "setup") {
      if (testScript.setup) {
        result.setup = filterActions(testScript.setup, searchTerm, filterType)
      }
    }
    
    if (filterSection === "all" || filterSection === "test") {
      if (testScript.test && testScript.test.length > 0) {
        result.test = testScript.test
          .map(test => filterTestCase(test, searchTerm, filterType))
          .filter(test => test.action && test.action.length > 0)
      }
    }
    
    if (filterSection === "all" || filterSection === "teardown") {
      if (testScript.teardown) {
        result.teardown = filterActions(testScript.teardown, searchTerm, filterType)
      }
    }
    
    if (filterSection === "all" || filterSection === "common") {
      if (testScript.common && testScript.common.length > 0) {
        result.common = testScript.common
          .map(common => filterCommon(common, searchTerm, filterType))
          .filter(common => common.action && common.action.length > 0)
      }
    }

    return result
  }, [testScript, searchTerm, filterType, filterSection, showAssertions, showOperations])
  
  // Filtert eine Setup/Teardown-Sektion
  function filterActions(section: any, term: string, type: string): any {
    if (!section || !section.action) return { action: [] }
    
    const filteredAction = section.action.filter((action: any) => {
      // Filtern nach Action-Typ
      if (!showAssertions && action.assert) return false
      if (!showOperations && action.operation) return false
      
      // Suche nach Text
      if (!term) return true
      
      if (type === "all" || type === "description") {
        // In Beschreibungen suchen
        if (action.operation?.description?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.description?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      if (type === "all" || type === "name") {
        // In Namen/Labels suchen
        if (action.operation?.label?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.label?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      if (type === "all" || type === "action") {
        // In Action-Details suchen
        if (action.operation?.url?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.operation?.resource?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.expression?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.value?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      return false
    })
    
    return { ...section, action: filteredAction }
  }
  
  // Filtert einen Testfall
  function filterTestCase(test: any, term: string, type: string): any {
    if (!test) return { action: [] }
    
    // Prüfen, ob der Test selbst dem Suchbegriff entspricht
    let testMatches = false
    if (term) {
      if ((type === "all" || type === "name") && test.name?.toLowerCase().includes(term.toLowerCase())) {
        testMatches = true
      }
      if ((type === "all" || type === "description") && test.description?.toLowerCase().includes(term.toLowerCase())) {
        testMatches = true
      }
    } else {
      testMatches = true
    }
    
    // Aktionen filtern
    const filteredAction = test.action ? test.action.filter((action: any) => {
      // Wenn der Test selbst dem Suchbegriff entspricht, alle Aktionen einschließen
      if (testMatches) return (showAssertions || !action.assert) && (showOperations || !action.operation)
      
      // Filtern nach Action-Typ
      if (!showAssertions && action.assert) return false
      if (!showOperations && action.operation) return false
      
      // Suche nach Text
      if (!term) return true
      
      if (type === "all" || type === "description") {
        if (action.operation?.description?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.description?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      if (type === "all" || type === "name") {
        if (action.operation?.label?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.label?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      if (type === "all" || type === "action") {
        if (action.operation?.url?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.operation?.resource?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.expression?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.value?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      return false
    }) : []
    
    return { ...test, action: filteredAction }
  }
  
  // Filtert Common-Aktionen
  function filterCommon(common: any, term: string, type: string): any {
    if (!common) return { action: [] }
    
    // Prüfen, ob der Common-Block selbst dem Suchbegriff entspricht
    let commonMatches = false
    if (term) {
      if ((type === "all" || type === "name") && common.name?.toLowerCase().includes(term.toLowerCase())) {
        commonMatches = true
      }
      if ((type === "all" || type === "description") && common.description?.toLowerCase().includes(term.toLowerCase())) {
        commonMatches = true
      }
    } else {
      commonMatches = true
    }
    
    // Aktionen filtern
    const filteredAction = common.action ? common.action.filter((action: any) => {
      // Wenn der Common-Block selbst dem Suchbegriff entspricht, alle Aktionen einschließen
      if (commonMatches) return (showAssertions || !action.assert) && (showOperations || !action.operation)
      
      // Filtern nach Action-Typ
      if (!showAssertions && action.assert) return false
      if (!showOperations && action.operation) return false
      
      // Suche nach Text
      if (!term) return true
      
      if (type === "all" || type === "description") {
        if (action.operation?.description?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.description?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      if (type === "all" || type === "name") {
        if (action.operation?.label?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.label?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      if (type === "all" || type === "action") {
        if (action.operation?.url?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.operation?.resource?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.expression?.toLowerCase().includes(term.toLowerCase())) return true
        if (action.assert?.value?.toLowerCase().includes(term.toLowerCase())) return true
      }
      
      return false
    }) : []
    
    return { ...common, action: filteredAction }
  }
  
  // Zählt gefilterte Elemente
  function countFilteredElements(): { tests: number, actions: number } {
    let tests = 0
    let actions = 0
    
    // Setup-Aktionen zählen
    if (filteredContent.setup?.action) {
      actions += filteredContent.setup.action.length
    }
    
    // Test-Aktionen zählen
    if (filteredContent.test) {
      tests = filteredContent.test.length
      filteredContent.test.forEach((test: any) => {
        if (test.action) {
          actions += test.action.length
        }
      })
    }
    
    // Teardown-Aktionen zählen
    if (filteredContent.teardown?.action) {
      actions += filteredContent.teardown.action.length
    }
    
    // Common-Aktionen zählen
    if (filteredContent.common) {
      filteredContent.common.forEach((common: any) => {
        if (common.action) {
          actions += common.action.length
        }
      })
    }
    
    return { tests, actions }
  }
  
  const counts = useMemo(() => ({
    setup: countFilteredElements().tests,
    test: countFilteredElements().tests,
    teardown: countFilteredElements().tests,
    common: countFilteredElements().tests,
    actions: countFilteredElements().actions
  }), [filteredContent])
  
  return (
    <div className="p-4">
      {/* Filter-Bereich */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Suchfeld */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search-term" className="mb-2 block">Suchbegriff</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-term"
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {searchTerm && (
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
              
              {/* Filter-Typ */}
              <div className="w-full md:w-[200px]">
                <Label htmlFor="filter-type" className="mb-2 block">Filtertyp</Label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="Filtertyp auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Felder</SelectItem>
                    <SelectItem value="name">Namen/Label</SelectItem>
                    <SelectItem value="description">Beschreibungen</SelectItem>
                    <SelectItem value="action">Aktionsdetails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Bereichsfilter */}
              <div className="w-full md:w-[200px]">
                <Label htmlFor="filter-section" className="mb-2 block">Bereich</Label>
                <Select value={filterSection} onValueChange={(v) => setFilterSection(v as any)}>
                  <SelectTrigger id="filter-section">
                    <SelectValue placeholder="Bereich auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Bereiche</SelectItem>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="test">Tests</SelectItem>
                    <SelectItem value="teardown">Teardown</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Aktionstyp-Filter */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-assertions" 
                  checked={showAssertions} 
                  onCheckedChange={(checked) => setShowAssertions(checked as boolean)}
                />
                <Label htmlFor="show-assertions">Assertions anzeigen</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-operations" 
                  checked={showOperations} 
                  onCheckedChange={(checked) => setShowOperations(checked as boolean)}
                />
                <Label htmlFor="show-operations">Operationen anzeigen</Label>
              </div>
            </div>
            
            {/* Filter-Statistik */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Tests: {counts.setup}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Aktionen: {counts.actions}
              </Badge>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" /> Suche: &quot;{searchTerm}&quot;
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ergebnisanzeige */}
      <Tabs defaultValue="json">
        <TabsList>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="json" className="mt-4">
          <SyntaxHighlighter
            language="json"
            code={formatToJson(filteredContent, 2)}
            showLineNumbers={true}
            className="border rounded-md"
          />
        </TabsContent>
        
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Zusammenfassung der Setup-Aktionen */}
                {filteredContent.setup?.action && filteredContent.setup.action.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Setup</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {filteredContent.setup.action.map((action: any, index: number) => (
                        <li key={`setup-${index}`}>
                          {action.operation && (
                            <span className="text-blue-600">
                              Operation: {action.operation.label || action.operation.resource || 'Unbenannt'}
                            </span>
                          )}
                          {action.assert && (
                            <span className="text-green-600">
                              Assertion: {action.assert.label || action.assert.description || 'Unbenannt'}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Zusammenfassung der Test-Aktionen */}
                {filteredContent.test && filteredContent.test.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tests</h3>
                    {filteredContent.test.map((test: any, testIndex: number) => (
                      <div key={`test-${testIndex}`} className="mb-3">
                        <h4 className="font-medium text-md">{test.name || `Test ${testIndex + 1}`}</h4>
                        {test.description && (
                          <p className="text-sm text-muted-foreground mb-1">{test.description}</p>
                        )}
                        {test.action && test.action.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            {test.action.map((action: any, actionIndex: number) => (
                              <li key={`test-${testIndex}-action-${actionIndex}`}>
                                {action.operation && (
                                  <span className="text-blue-600">
                                    Operation: {action.operation.label || action.operation.resource || 'Unbenannt'}
                                  </span>
                                )}
                                {action.assert && (
                                  <span className="text-green-600">
                                    Assertion: {action.assert.label || action.assert.description || 'Unbenannt'}
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
                
                {/* Zusammenfassung der Teardown-Aktionen */}
                {filteredContent.teardown?.action && filteredContent.teardown.action.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Teardown</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {filteredContent.teardown.action.map((action: any, index: number) => (
                        <li key={`teardown-${index}`}>
                          {action.operation && (
                            <span className="text-blue-600">
                              Operation: {action.operation.label || action.operation.resource || 'Unbenannt'}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Zusammenfassung der Common-Aktionen */}
                {filteredContent.common && filteredContent.common.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Common</h3>
                    {filteredContent.common.map((common: any, commonIndex: number) => (
                      <div key={`common-${commonIndex}`} className="mb-3">
                        <h4 className="font-medium text-md">{common.name || `Common ${common.key}`}</h4>
                        {common.description && (
                          <p className="text-sm text-muted-foreground mb-1">{common.description}</p>
                        )}
                        {common.action && common.action.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            {common.action.map((action: any, actionIndex: number) => (
                              <li key={`common-${commonIndex}-action-${actionIndex}`}>
                                {action.operation && (
                                  <span className="text-blue-600">
                                    Operation: {action.operation.label || action.operation.resource || 'Unbenannt'}
                                  </span>
                                )}
                                {action.assert && (
                                  <span className="text-green-600">
                                    Assertion: {action.assert.label || action.assert.description || 'Unbenannt'}
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
                
                {/* Keine Ergebnisse */}
                {counts.actions === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Ergebnisse gefunden für die aktuellen Filterkriterien.
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