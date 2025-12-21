import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TestScript,
  TestScriptSetup,
  TestScriptTeardown,
  TestScriptTest,
  TestScriptCommon,
} from "@/types/fhir-enhanced"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValidationTab } from "@/components/validation-tab"
import { AlertCircle, CheckCircle2, Info, Layers, XCircle } from "lucide-react"

interface StructuredViewProps {
  testScript: TestScript;
}

/**
 * Zeigt ein TestScript in einer strukturierten, benutzerfreundlichen Ansicht an
 */
export function StructuredView({ testScript }: StructuredViewProps) {
  const testCount = testScript.test?.length ?? 0
  const testActionCount =
    testScript.test?.reduce((sum, test) => sum + (test.action?.length ?? 0), 0) ?? 0
  const setupActionCount = testScript.setup?.action?.length ?? 0
  const teardownActionCount = testScript.teardown?.action?.length ?? 0
  const totalActions = testActionCount + setupActionCount + teardownActionCount

  return (
    <div className="space-y-6">
      {/* Header mit grundlegenden Informationen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{testScript.name || "Unbenanntes TestScript"}</CardTitle>
              <CardDescription className="mt-2">
                {testScript.description || "No description available"}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Tests</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{testCount}</p>
            <p className="text-xs text-muted-foreground">Number of defined test cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Test Actions</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{testActionCount}</p>
            <p className="text-xs text-muted-foreground">Total actions in tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Setup Actions</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{setupActionCount}</p>
            <p className="text-xs text-muted-foreground">Vorbereitungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Teardown Actions</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{teardownActionCount}</p>
            <p className="text-xs text-muted-foreground">Cleanup steps</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Gesamtanzahl Aktionen</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{totalActions}</p>
        </CardContent>
      </Card>

      {/* Main content with tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="common">Common</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TestScript Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testScript.metadata && (
                  <div>
                    <h4 className="font-medium mb-2">Metadata</h4>
                    <div className="space-y-2">
                      {testScript.metadata.capability?.map((capability, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {capability.description || `Capability ${index + 1}`}
                            </span>
                            <div className="flex items-center gap-2">
                              {capability.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {capability.validated && (
                                <Badge variant="default" className="text-xs">Validated</Badge>
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

        <TabsContent value="config" className="space-y-4">
          <ConfigurationSection testScript={testScript} />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <SetupSection setup={testScript.setup} />
          <TeardownSection teardown={testScript.teardown} />
        </TabsContent>

        <TabsContent value="common" className="space-y-4">
          <CommonActionsSection common={testScript.common} />
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
          <p className="text-muted-foreground">No setup actions defined</p>
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
                  <p className="text-sm"><span className="font-medium">Assertion:</span> {action.assert.description || "No description"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TeardownSection({ teardown }: { teardown: TestScriptTeardown | undefined }) {
  if (!teardown || !teardown.action || teardown.action.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No teardown actions defined</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teardown-Aktionen</CardTitle>
        <CardDescription>{teardown.action.length} Aktion(en) definiert</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teardown.action.map((action, idx) => (
            <div key={idx} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Aktion {idx + 1}</span>
                <Badge variant="outline">Teardown</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Methode:</span> {action.operation.method || "Nicht gesetzt"}
                </p>
                <p>
                  <span className="font-medium">URL:</span> {action.operation.url || "Nicht gesetzt"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TestSection({ tests }: { tests: TestScriptTest[] | undefined }) {
  if (!tests || tests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No tests defined</p>
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
              <p className="text-muted-foreground text-sm">No actions defined</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CommonActionsSection({ common }: { common: TestScriptCommon[] | undefined }) {
  if (!common || common.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Keine Common-Aktionen definiert</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {common.map((entry, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {entry.name || entry.key || `Common ${idx + 1}`}
              <Badge variant="outline">{entry.key}</Badge>
            </CardTitle>
            {entry.description && <CardDescription>{entry.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {entry.parameter && entry.parameter.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Parameter</h5>
                <div className="grid gap-2 md:grid-cols-2">
                  {entry.parameter.map((param, paramIdx) => (
                    <div key={paramIdx} className="rounded-md border p-2 text-sm">
                      <p className="font-medium">{param.name}</p>
                      {param.value && (
                        <p className="text-muted-foreground">Wert: {param.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entry.action && entry.action.length > 0 ? (
              <div className="space-y-3">
                {entry.action.map((action, actionIdx) => (
                  <div key={actionIdx} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">Aktion {actionIdx + 1}</span>
                      <Badge variant="outline">Common</Badge>
                    </div>
                    {action.operation && (
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Methode:</span>{" "}
                          {action.operation.method || "Nicht gesetzt"}
                        </p>
                        <p>
                          <span className="font-medium">URL:</span>{" "}
                          {action.operation.url || "Nicht gesetzt"}
                        </p>
                      </div>
                    )}
                    {action.assert && (
                      <div className="mt-2 rounded bg-muted p-2 text-sm">
                        <p>
                          <span className="font-medium">Assertion:</span>{" "}
                          {action.assert.description || "Keine Beschreibung"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Aktionen in diesem Common-Block.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ConfigurationSection({ testScript }: { testScript: TestScript }) {
  const hasSystems = Boolean(testScript.testSystem?.length)
  const hasEndpoints = Boolean(
    (testScript.origin && testScript.origin.length > 0) ||
      (testScript.destination && testScript.destination.length > 0),
  )
  const hasFixtures = Boolean(testScript.fixture?.length)
  const hasProfiles = Boolean(testScript.profile?.length)
  const hasVariables = Boolean(testScript.variable?.length)
  const hasScope = Boolean(testScript.scope?.length)

  if (
    !hasSystems &&
    !hasEndpoints &&
    !hasFixtures &&
    !hasProfiles &&
    !hasVariables &&
    !hasScope
  ) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No additional configurations (systems, fixtures, variables or scope) defined.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hasSystems && (
        <Card>
          <CardHeader>
            <CardTitle>Testsysteme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testScript.testSystem?.map((system) => (
              <div key={system.index} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{system.title || `System ${system.index}`}</span>
                  <Badge variant="outline">Index {system.index}</Badge>
                </div>
                {system.description && (
                  <p className="mt-1 text-muted-foreground">{system.description}</p>
                )}
                {system.url && (
                  <p className="mt-1 text-muted-foreground text-xs font-mono break-all">
                    {system.url}
                  </p>
                )}
                {system.actor && system.actor.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Actor: {system.actor.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasEndpoints && (
        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {testScript.origin && testScript.origin.length > 0 && (
              <div>
                <h5 className="font-medium">Origin</h5>
                <div className="space-y-2">
                  {testScript.origin.map((origin) => (
                    <div key={origin.index} className="rounded border p-2">
                      <div className="flex items-center justify-between">
                        <span>Index {origin.index}</span>
                        <Badge variant="outline">Sender</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Profil: {origin.profile?.code ?? "unbekannt"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {testScript.destination && testScript.destination.length > 0 && (
              <div>
                <h5 className="font-medium">Destination</h5>
                <div className="space-y-2">
                  {testScript.destination.map((destination) => (
                    <div key={destination.index} className="rounded border p-2">
                      <div className="flex items-center justify-between">
                        <span>Index {destination.index}</span>
                        <Badge variant="outline">Receiver</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Profil: {destination.profile?.code ?? "unbekannt"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasFixtures && (
        <Card>
          <CardHeader>
            <CardTitle>Fixtures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {testScript.fixture?.map((fixture, idx) => (
              <div key={idx} className="rounded border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Auto create: {fixture.autocreate ? "Ja" : "Nein"}</Badge>
                  <Badge variant="outline">Auto delete: {fixture.autodelete ? "Ja" : "Nein"}</Badge>
                </div>
                {fixture.resource?.reference && (
                  <p className="mt-2 font-mono text-xs break-all">{fixture.resource.reference}</p>
                )}
                {fixture.resource?.display && (
                  <p className="text-xs text-muted-foreground">{fixture.resource.display}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasProfiles && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {testScript.profile?.map((profile, idx) => (
              <div key={idx} className="rounded border p-2 font-mono text-xs break-all">
                {profile}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasVariables && (
        <Card>
          <CardHeader>
            <CardTitle>Variablen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {testScript.variable?.map((variable, idx) => (
              <div key={idx} className="space-y-1 rounded border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{variable.name}</span>
                  {variable.sourceId && (
                    <Badge variant="outline" className="text-xs">
                      Source: {variable.sourceId}
                    </Badge>
                  )}
                </div>
                {variable.description && (
                  <p className="text-xs text-muted-foreground">{variable.description}</p>
                )}
                {variable.expression && (
                  <p className="text-xs font-mono break-all">
                    Ausdruck: {variable.expression}
                  </p>
                )}
                {variable.path && (
                  <p className="text-xs text-muted-foreground">Pfad: {variable.path}</p>
                )}
                {variable.defaultValue && (
                  <p className="text-xs text-muted-foreground">
                    Default: {variable.defaultValue}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasScope && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {testScript.scope?.map((scope, idx) => (
              <div key={idx} className="rounded border p-3">
                <p>
                  <span className="font-medium">Artifact:</span> {scope.artifact}
                </p>
                {scope.conformance?.coding?.[0]?.code && (
                  <p className="text-xs text-muted-foreground">
                    Conformance: {scope.conformance.coding[0].code} (
                    {scope.conformance.coding[0].display})
                  </p>
                )}
                {scope.phase?.coding?.[0]?.code && (
                  <p className="text-xs text-muted-foreground">
                    Phase: {scope.phase.coding[0].code} ({scope.phase.coding[0].display})
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
