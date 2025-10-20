import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TestScript, TestScriptTest, TestScriptSetup, TestScriptTeardown, EnhancedTestScriptAssert as Assertion, EnhancedTestScriptOperation as Operation } from "@/types/fhir-enhanced"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ValidationTab } from "@/components/validation-tab"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

interface StructuredViewProps {
  testScript: TestScript;
}

/**
 * Zeigt ein TestScript in einer strukturierten, benutzerfreundlichen Ansicht an
 */
export function StructuredView({ testScript }: StructuredViewProps) {
  // Statistiken berechnen
  const testCount = testScript.test?.length || 0;
  const setupActionCount = testScript.setup?.action?.length || 0;
  const teardownActionCount = testScript.teardown?.action?.length || 0;
  const totalActions = testCount + setupActionCount + teardownActionCount;

  return (
    <div className="space-y-6">
      {/* Header mit grundlegenden Informationen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{testScript.name || "Unbenanntes TestScript"}</CardTitle>
              <CardDescription className="mt-2">
                {testScript.description || "Keine Beschreibung verfügbar"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={testScript.status === "active" ? "default" : "secondary"}>
                {testScript.status}
              </Badge>
              {testScript.experimental && (
                <Badge variant="outline">Experimentell</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">URL:</span>
              <p className="font-mono text-xs break-all">{testScript.url || "Nicht gesetzt"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Version:</span>
              <p>{testScript.version || "Nicht gesetzt"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Publisher:</span>
              <p>{testScript.publisher || "Nicht gesetzt"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Tests</span>
            </div>
            <p className="text-2xl font-bold mt-1">{testCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Setup</span>
            </div>
            <p className="text-2xl font-bold mt-1">{setupActionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Teardown</span>
            </div>
            <p className="text-2xl font-bold mt-1">{teardownActionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Gesamt</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalActions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Hauptinhalt mit Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="validation">Validierung</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TestScript Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testScript.metadata && (
                  <div>
                    <h4 className="font-medium mb-2">Metadaten</h4>
                    <div className="space-y-2">
                      {testScript.metadata.capability?.map((capability, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {capability.description || `Capability ${index + 1}`}
                            </span>
                            <div className="flex items-center gap-2">
                              {capability.required && (
                                <Badge variant="destructive" className="text-xs">Erforderlich</Badge>
                              )}
                              {capability.validated && (
                                <Badge variant="default" className="text-xs">Validiert</Badge>
                              )}
                            </div>
                          </div>
                          {capability.capabilities && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Capabilities: {capability.capabilities}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <TestSection tests={testScript.test} />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <SetupSection setup={testScript.setup} />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <ValidationTab testScript={testScript} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SetupSection({ setup }: { setup: TestScriptSetup | undefined }) {
  if (!setup || !setup.action || setup.action.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Keine Setup-Aktionen definiert</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup-Aktionen</CardTitle>
        <CardDescription>
          {setup.action.length} Aktion{setup.action.length !== 1 ? 'en' : ''} definiert
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {setup.action.map((action, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Aktion {index + 1}</span>
                <Badge variant="outline">Setup</Badge>
              </div>
              {action.operation && (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Methode:</span> {action.operation.method || "Nicht gesetzt"}</p>
                  <p><span className="font-medium">URL:</span> {action.operation.url || "Nicht gesetzt"}</p>
                  {action.operation.description && (
                    <p><span className="font-medium">Beschreibung:</span> {action.operation.description}</p>
                  )}
                </div>
              )}
              {action.assert && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <p className="text-sm"><span className="font-medium">Assertion:</span> {action.assert.description || "Keine Beschreibung"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TestSection({ tests }: { tests: TestScriptTest[] | undefined }) {
  if (!tests || tests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Keine Tests definiert</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((test, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {test.name || `Test ${index + 1}`}
              <Badge variant="outline">Test</Badge>
            </CardTitle>
            {test.description && (
              <CardDescription>{test.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {test.action && test.action.length > 0 ? (
              <div className="space-y-3">
                {test.action.map((action, actionIndex) => (
                  <div key={actionIndex} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Aktion {actionIndex + 1}</span>
                      <div className="flex gap-1">
                        {action.operation && <Badge variant="secondary" className="text-xs">Operation</Badge>}
                        {action.assert && <Badge variant="outline" className="text-xs">Assertion</Badge>}
                      </div>
                    </div>
                    {action.operation && (
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Methode:</span> {action.operation.method || "Nicht gesetzt"}</p>
                        <p><span className="font-medium">URL:</span> {action.operation.url || "Nicht gesetzt"}</p>
                      </div>
                    )}
                    {action.assert && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="text-sm"><span className="font-medium">Assertion:</span> {action.assert.description || "Keine Beschreibung"}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Keine Aktionen definiert</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
