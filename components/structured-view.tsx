import { Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TestScript, TestScriptTest, Assertion, Operation } from "@/types/test-script"
import { Separator } from "@/components/ui/separator"

interface StructuredViewProps {
  testScript: TestScript
  focusArea?: "all" | "setup" | "test" | "teardown" | "common"
}

/**
 * Zeigt ein TestScript in einer strukturierten, benutzerfreundlichen Ansicht an
 */
export function StructuredView({ testScript, focusArea = "all" }: StructuredViewProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Grundlegende Informationen */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{testScript.name}</h2>
          {testScript.description && (
            <p className="text-muted-foreground">{testScript.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {testScript.status && (
            <Badge variant={testScript.status === "active" ? "default" : "outline"}>
              {testScript.status}
            </Badge>
          )}
          {testScript.version && (
            <Badge variant="outline">Version: {testScript.version}</Badge>
          )}
          {testScript.experimental && (
            <Badge variant="secondary">Experimentell</Badge>
          )}
        </div>
      </div>

      <Separator />
      
      {/* Metadata-Bereich */}
      {(focusArea === "all" || focusArea === "metadata") && testScript.metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Benötigte Capabilities und Links</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {/* Links */}
              {testScript.metadata.link && testScript.metadata.link.length > 0 && (
                <AccordionItem value="links">
                  <AccordionTrigger>Links ({testScript.metadata.link.length})</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {testScript.metadata.link.map((link, index) => (
                        <li key={index}>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {link.description || link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {/* Capabilities */}
              {testScript.metadata.capability && testScript.metadata.capability.length > 0 && (
                <AccordionItem value="capabilities">
                  <AccordionTrigger>Capabilities ({testScript.metadata.capability.length})</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {testScript.metadata.capability.map((cap, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant={cap.required ? "default" : "outline"}>
                              {cap.required ? "Erforderlich" : "Optional"}
                            </Badge>
                            <Badge variant={cap.validated ? "secondary" : "outline"}>
                              {cap.validated ? "Validiert" : "Nicht validiert"}
                            </Badge>
                          </div>
                          
                          {cap.description && (
                            <p className="text-sm">{cap.description}</p>
                          )}
                          
                          {cap.capabilities && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Capabilities: {cap.capabilities}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}
      
      {/* Setup-Bereich */}
      {(focusArea === "all" || focusArea === "setup") && testScript.setup && (
        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
            <CardDescription>Vorbereitende Aktionen vor dem Test</CardDescription>
          </CardHeader>
          <CardContent>
            {testScript.setup.action && testScript.setup.action.length > 0 ? (
              <SetupActionsView actions={testScript.setup.action} />
            ) : (
              <p className="text-muted-foreground">Keine Setup-Aktionen definiert</p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Test-Bereich */}
      {(focusArea === "all" || focusArea === "test") && testScript.test && testScript.test.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tests ({testScript.test.length})</CardTitle>
            <CardDescription>Testfälle zur Überprüfung der Konformität</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {testScript.test.map((test, index) => (
                <AccordionItem key={index} value={`test-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <span>{test.name || `Test ${index + 1}`}</span>
                      <Badge className="ml-2" variant="outline">{test.action?.length || 0} Aktionen</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <TestView test={test} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      
      {/* Teardown-Bereich */}
      {(focusArea === "all" || focusArea === "teardown") && testScript.teardown && (
        <Card>
          <CardHeader>
            <CardTitle>Teardown</CardTitle>
            <CardDescription>Aufräumaktionen nach dem Test</CardDescription>
          </CardHeader>
          <CardContent>
            {testScript.teardown.action && testScript.teardown.action.length > 0 ? (
              <TeardownActionsView actions={testScript.teardown.action} />
            ) : (
              <p className="text-muted-foreground">Keine Teardown-Aktionen definiert</p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Common-Bereich */}
      {(focusArea === "all" || focusArea === "common") && testScript.common && testScript.common.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Actions ({testScript.common.length})</CardTitle>
            <CardDescription>Wiederverwendbare Aktionen</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {testScript.common.map((common, index) => (
                <AccordionItem key={index} value={`common-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <span>{common.name || `Common ${common.key}`}</span>
                      <Badge className="ml-2" variant="outline">{common.action?.length || 0} Aktionen</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CommonActionsView common={common} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hilfsfunktionen für die Darstellung verschiedener Komponenten

function SetupActionsView({ actions }) {
  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <div key={index} className="p-3 border rounded-md">
          <h4 className="font-medium mb-2">Aktion {index + 1}</h4>
          
          {action.operation && <OperationView operation={action.operation} />}
          {action.assert && <AssertionView assertion={action.assert} />}
          {action.common && (
            <div className="mt-2">
              <Badge>Common</Badge>
              <span className="ml-2">{action.common.keyRef}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TestView({ test }: { test: TestScriptTest }) {
  return (
    <div className="space-y-4">
      {test.description && (
        <p className="text-sm text-muted-foreground">{test.description}</p>
      )}
      
      {test.action && test.action.length > 0 && (
        <div className="space-y-3">
          {test.action.map((action, index) => (
            <div key={index} className="p-3 border rounded-md">
              <h4 className="font-medium mb-2">Aktion {index + 1}</h4>
              
              {action.operation && <OperationView operation={action.operation} />}
              {action.assert && <AssertionView assertion={action.assert} />}
              {action.common && (
                <div className="mt-2">
                  <Badge>Common</Badge>
                  <span className="ml-2">{action.common.keyRef}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TeardownActionsView({ actions }) {
  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <div key={index} className="p-3 border rounded-md">
          <h4 className="font-medium mb-2">Aktion {index + 1}</h4>
          
          {action.operation && <OperationView operation={action.operation} />}
          {action.common && (
            <div className="mt-2">
              <Badge>Common</Badge>
              <span className="ml-2">{action.common.keyRef}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function CommonActionsView({ common }) {
  return (
    <div className="space-y-4">
      {common.description && (
        <p className="text-sm text-muted-foreground">{common.description}</p>
      )}
      
      {common.action && common.action.length > 0 && (
        <div className="space-y-3">
          {common.action.map((action, index) => (
            <div key={index} className="p-3 border rounded-md">
              <h4 className="font-medium mb-2">Aktion {index + 1}</h4>
              
              {action.operation && <OperationView operation={action.operation} />}
              {action.assert && <AssertionView assertion={action.assert} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OperationView({ operation }: { operation: Operation }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">Operation</Badge>
        {operation.method && (
          <Badge variant="outline">{operation.method}</Badge>
        )}
      </div>
      
      {operation.label && (
        <p className="font-medium">{operation.label}</p>
      )}
      
      {operation.description && (
        <p className="text-sm text-muted-foreground">{operation.description}</p>
      )}
      
      {operation.url && (
        <div className="mt-2 text-sm">
          <span className="font-medium">URL: </span>
          <code className="bg-muted px-1 py-0.5 rounded">{operation.url}</code>
        </div>
      )}
      
      {operation.contentType && (
        <div className="mt-1 text-sm">
          <span className="font-medium">Content-Type: </span>
          <code className="bg-muted px-1 py-0.5 rounded">{operation.contentType}</code>
        </div>
      )}
    </div>
  )
}

function AssertionView({ assertion }: { assertion: Assertion }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">Assertion</Badge>
        {assertion.warningOnly ? (
          <Badge variant="outline" className="bg-yellow-100">Nur Warnung</Badge>
        ) : (
          <Badge variant="outline" className="bg-red-100">Stoppt bei Fehler</Badge>
        )}
      </div>
      
      {assertion.label && (
        <p className="font-medium">{assertion.label}</p>
      )}
      
      {assertion.description && (
        <p className="text-sm text-muted-foreground">{assertion.description}</p>
      )}
      
      {assertion.operator && assertion.value && (
        <div className="mt-2 text-sm">
          <span className="font-medium">Prüfung: </span>
          <code className="bg-muted px-1 py-0.5 rounded">
            {assertion.operator} {assertion.value}
          </code>
        </div>
      )}
      
      {assertion.expression && (
        <div className="mt-2 text-sm">
          <span className="font-medium">Expression: </span>
          <code className="bg-muted px-1 py-0.5 rounded">{assertion.expression}</code>
        </div>
      )}
    </div>
  )
} 