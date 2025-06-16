"use client";

import { useState } from "react";
import { useFhirValidation } from "@/hooks/use-fhir-validation";
import { TestScript } from "@/types/test-script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { validateTestScript } from "@/lib/validators/test-script-validator";
import { Label } from "@/components/ui/label";

interface TestScriptValidatorProps {
  testScript: TestScript;
}

export function TestScriptValidator({ testScript }: TestScriptValidatorProps) {
  const { isValidating, validationResult, validate } = useFhirValidation();

  const handleValidate = async () => {
    if (!testScript) return;

    // Lokale Validierung
    const localValidation = validateTestScript(testScript);
    if (!localValidation.valid) {
      validate(testScript, {
        issues: localValidation.errors.map(error => ({
          severity: "error",
          code: "invalid",
          diagnostics: error,
          location: ["TestScript"]
        }))
      });
      return;
    }

    // FHIR Server Validierung
    await validate(testScript, {});
  };

  const renderValidationStatus = () => {
    if (!validationResult) return null;

    // Zähle die verschiedenen Arten von Problemen
    const issueCounts = validationResult.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (validationResult.valid) {
      return (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Validierung erfolgreich</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>{validationResult.message}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">Zusammenfassung:</p>
                <ul className="text-sm list-disc ml-4">
                  <li>Alle erforderlichen Felder sind vorhanden</li>
                  <li>Die Struktur entspricht den FHIR R5 Anforderungen</li>
                  <li>Keine Validierungsfehler gefunden</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validierungsfehler</AlertTitle>
        <AlertDescription>
          <div className="mt-2">
            <p>{validationResult.message}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">Zusammenfassung der Probleme:</p>
              <ul className="text-sm list-disc ml-4">
                {issueCounts['fatal'] > 0 && (
                  <li className="text-red-600">
                    {issueCounts['fatal']} kritische Fehler
                  </li>
                )}
                {issueCounts['error'] > 0 && (
                  <li className="text-red-500">
                    {issueCounts['error']} Fehler
                  </li>
                )}
                {issueCounts['warning'] > 0 && (
                  <li className="text-yellow-500">
                    {issueCounts['warning']} Warnungen
                  </li>
                )}
                {issueCounts['information'] > 0 && (
                  <li className="text-blue-500">
                    {issueCounts['information']} Hinweise
                  </li>
                )}
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderIssues = () => {
    if (!validationResult?.issues || validationResult.issues.length === 0) return null;

    // Gruppiere die Probleme nach Schweregrad
    const groupedIssues = validationResult.issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) {
        acc[issue.severity] = [];
      }
      acc[issue.severity].push(issue);
      return acc;
    }, {} as Record<string, typeof validationResult.issues>);

    return (
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="issues">
          <AccordionTrigger>
            Validierungsprobleme ({validationResult.issues.length})
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {Object.entries(groupedIssues).map(([severity, issues]) => (
                <div key={severity} className="mb-6">
                  <h4 className="font-medium mb-2">
                    {severity === 'fatal' ? 'Kritische Fehler' :
                     severity === 'error' ? 'Validierungsfehler' :
                     severity === 'warning' ? 'Validierungswarnungen' :
                     'Validierungshinweise'}
                  </h4>
                  {issues.map((issue, index) => (
                    <div key={index} className="mb-4 pb-4 border-b last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        {severity === 'error' || severity === 'fatal' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : severity === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant={
                          severity === 'error' || severity === 'fatal' ? 'destructive' : 
                          severity === 'warning' ? 'default' : 'outline'
                        }>
                          {severity}
                        </Badge>
                        <Badge variant="outline">{issue.code}</Badge>
                      </div>
                      
                      {issue.diagnostics && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Fehlerbeschreibung:</p>
                          <p className="text-sm text-muted-foreground mt-1">{issue.diagnostics}</p>
                        </div>
                      )}
                      
                      {issue.details && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Details:</p>
                          <p className="text-sm text-muted-foreground mt-1">{issue.details}</p>
                        </div>
                      )}
                      
                      {issue.expression && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Betroffener Ausdruck:</p>
                          <p className="text-sm text-muted-foreground mt-1">{issue.expression}</p>
                        </div>
                      )}
                      
                      {issue.location && issue.location.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Betroffene Stelle:</p>
                          <ul className="text-sm ml-4 list-disc">
                            {issue.location.map((loc, i) => (
                              <li key={i} className="text-muted-foreground">{loc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FHIR TestScript Validierung</CardTitle>
        <CardDescription>
          Validieren Sie Ihr TestScript gegen einen FHIR-Server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validiere...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Validieren
                </>
              )}
            </Button>
          </div>

          {validationResult && (
            <div className="mt-4">
              {renderValidationStatus()}
              {renderIssues()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 