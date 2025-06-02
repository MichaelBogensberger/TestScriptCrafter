import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TestScript, TestScriptTest, TestScriptSetup, TestScriptTeardown, Assertion, Operation } from "@/types/test-script"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StructuredViewProps {
  testScript: TestScript;
  focusArea?: "all" | "setup" | "test" | "teardown" | "common";
}

/**
 * Zeigt ein TestScript in einer strukturierten, benutzerfreundlichen Ansicht an
 */
export function StructuredView({ testScript, focusArea = "all" }: StructuredViewProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue={focusArea === "all" ? "overview" : focusArea} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="test">Tests</TabsTrigger>
          <TabsTrigger value="teardown">Teardown</TabsTrigger>
          <TabsTrigger value="common">Common</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewSection testScript={testScript} />
        </TabsContent>
        
        <TabsContent value="setup">
          <SetupSection setup={testScript.setup} />
        </TabsContent>
        
        <TabsContent value="test">
          <TestSection tests={testScript.test} />
        </TabsContent>
        
        <TabsContent value="teardown">
          <TeardownSection teardown={testScript.teardown} />
        </TabsContent>
        
        <TabsContent value="common">
          <CommonSection common={testScript.common} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Übersichtskomponente für TestScript
 */
function OverviewSection({ testScript }: { testScript: TestScript }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{testScript.name}</span>
          <Badge variant={getStatusVariant(testScript.status)}>{testScript.status}</Badge>
        </CardTitle>
        {testScript.description && <CardDescription>{testScript.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="URL" value={testScript.url} />
          <InfoField label="Version" value={testScript.version} />
          <InfoField label="Publisher" value={testScript.publisher} />
          <InfoField label="Datum" value={formatDate(testScript.date)} />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-medium">Statistik</h3>
          <div className="grid grid-cols-4 gap-4">
            <StatCard 
              title="Setup-Aktionen" 
              value={testScript.setup?.action?.length || 0} 
            />
            <StatCard 
              title="Tests" 
              value={testScript.test?.length || 0} 
            />
            <StatCard 
              title="Test-Aktionen" 
              value={countTestActions(testScript.test)} 
            />
            <StatCard 
              title="Teardown-Aktionen" 
              value={testScript.teardown?.action?.length || 0} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Setup-Abschnitt des TestScripts
 */
function SetupSection({ setup }: { setup: TestScriptSetup | undefined }) {
  if (!setup || !setup.action || setup.action.length === 0) {
    return <EmptyStateCard message="Keine Setup-Aktionen definiert" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup</CardTitle>
        <CardDescription>Vorbereitende Aktionen für die Tests</CardDescription>
      </CardHeader>
      <CardContent>
        <ActionList actions={setup.action} prefix="Setup" />
      </CardContent>
    </Card>
  )
}

/**
 * Test-Abschnitt des TestScripts
 */
function TestSection({ tests }: { tests: TestScriptTest[] | undefined }) {
  if (!tests || tests.length === 0) {
    return <EmptyStateCard message="Keine Tests definiert" />
  }

  return (
    <div className="space-y-4">
      {tests.map((test, index) => (
        <Card key={`test-${index}`}>
          <CardHeader>
            <CardTitle className="text-lg">Test #{index + 1}: {test.name}</CardTitle>
            {test.description && <CardDescription>{test.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {test.action && test.action.length > 0 ? (
              <ActionList actions={test.action} prefix={`Test ${index + 1}`} />
            ) : (
              <p className="text-muted-foreground">Keine Aktionen definiert</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Teardown-Abschnitt des TestScripts
 */
function TeardownSection({ teardown }: { teardown: TestScriptTeardown | undefined }) {
  if (!teardown || !teardown.action || teardown.action.length === 0) {
    return <EmptyStateCard message="Keine Teardown-Aktionen definiert" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teardown</CardTitle>
        <CardDescription>Aufräumaktionen nach Testausführung</CardDescription>
      </CardHeader>
      <CardContent>
        <ActionList actions={teardown.action} prefix="Teardown" />
      </CardContent>
    </Card>
  )
}

/**
 * Common-Abschnitt des TestScripts
 */
function CommonSection({ common }: { common: any[] | undefined }) {
  if (!common || common.length === 0) {
    return <EmptyStateCard message="Keine gemeinsamen Aktionen definiert" />
  }

  return (
    <div className="space-y-4">
      {common.map((item, index) => (
        <Card key={`common-${index}`}>
          <CardHeader>
            <CardTitle className="text-lg">
              {item.name || `Common #${index + 1}`} {item.key && <span className="text-sm text-muted-foreground">({item.key})</span>}
            </CardTitle>
            {item.description && <CardDescription>{item.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {item.action && item.action.length > 0 ? (
              <ActionList actions={item.action} prefix={`Common ${index + 1}`} />
            ) : (
              <p className="text-muted-foreground">Keine Aktionen definiert</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Generische Komponente zur Anzeige von Aktionen
 */
function ActionList({ actions, prefix }: { actions: any[]; prefix: string }) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {actions.map((action, index) => (
        <AccordionItem key={`${prefix}-action-${index}`} value={`${prefix}-action-${index}`}>
          <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
            <div className="flex items-center justify-between w-full">
              <span>{prefix} Aktion #{index + 1}</span>
              <ActionTypeBadge action={action} />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2">
            {action.operation && <OperationDetails operation={action.operation} />}
            {action.assert && <AssertionDetails assertion={action.assert} />}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/**
 * Badge für den Aktionstyp (Operation/Assert)
 */
function ActionTypeBadge({ action }: { action: any }) {
  if (action.operation) {
    return <Badge variant="outline" className="bg-blue-100">Operation</Badge>
  }
  
  if (action.assert) {
    return <Badge variant="outline" className="bg-green-100">Assertion</Badge>
  }
  
  return <Badge variant="outline" className="bg-gray-100">Unbekannt</Badge>
}

/**
 * Komponentendetails einer Operation
 */
function OperationDetails({ operation }: { operation: Operation }) {
  return (
    <div className="space-y-2 text-sm">
      {operation.label && <p className="font-medium">{operation.label}</p>}
      
      <div className="grid grid-cols-2 gap-2">
        {operation.method && (
          <div>
            <span className="font-medium">Methode: </span>
            <Badge variant="outline" className="bg-blue-50">{operation.method.toUpperCase()}</Badge>
          </div>
        )}
        
        {operation.resource && (
          <div>
            <span className="font-medium">Resource: </span>
            <span>{operation.resource}</span>
          </div>
        )}
        
        {operation.url && (
          <div className="col-span-2">
            <span className="font-medium">URL: </span>
            <code className="bg-muted px-1 py-0.5 rounded">{operation.url}</code>
          </div>
        )}
      </div>
      
      {operation.description && (
        <p className="text-muted-foreground">{operation.description}</p>
      )}
    </div>
  )
}

/**
 * Komponentendetails einer Assertion
 */
function AssertionDetails({ assertion }: { assertion: Assertion }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <div>
          {assertion.label && (
            <p className="font-medium">{assertion.label}</p>
          )}
        </div>
        {assertion.warningOnly ? (
          <Badge variant="outline" className="bg-yellow-100">Nur Warnung</Badge>
        ) : (
          <Badge variant="outline" className="bg-red-100">Stoppt bei Fehler</Badge>
        )}
      </div>
      
      {assertion.description && (
        <p className="text-muted-foreground">{assertion.description}</p>
      )}
      
      {assertion.operator && assertion.value && (
        <div className="mt-2">
          <span className="font-medium">Prüfung: </span>
          <code className="bg-muted px-1 py-0.5 rounded">
            {assertion.operator} {assertion.value}
          </code>
        </div>
      )}
      
      {assertion.expression && (
        <div className="mt-2">
          <span className="font-medium">Expression: </span>
          <code className="bg-muted px-1 py-0.5 rounded">{assertion.expression}</code>
        </div>
      )}
    </div>
  )
}

/**
 * Leerer Zustand Card
 */
function EmptyStateCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  )
}

/**
 * Statistikkarte
 */
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

/**
 * Informationsfeld für Metadaten
 */
function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  )
}

/**
 * Berechnet die Anzahl der Aktionen in allen Tests
 */
function countTestActions(tests: TestScriptTest[] | undefined): number {
  if (!tests) return 0;
  
  return tests.reduce((total, test) => {
    return total + (test.action?.length || 0);
  }, 0);
}

/**
 * Formatiert ein Datum für die Anzeige
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

/**
 * Gibt die passende Variante für den Status zurück
 */
function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "outline";
  
  switch (status.toLowerCase()) {
    case "active":
    case "completed":
      return "default";
    case "draft":
      return "secondary";
    case "retired":
    case "error":
      return "destructive";
    default:
      return "outline";
  }
} 