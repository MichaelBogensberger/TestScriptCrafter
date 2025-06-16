import { TestScript } from "@/types/test-script";
import { useFhirValidation } from "@/hooks/use-fhir-validation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Info, XCircle, Server, AlertCircle, Code2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ValidationTabProps {
  testScript: TestScript;
}

export function ValidationTab({ testScript }: ValidationTabProps) {
  const { 
    isValidating, 
    validationResult, 
    validate,
    serverError,
    serverUrl,
    setServerUrl
  } = useFhirValidation();
  
  const [showPayload, setShowPayload] = useState(false);

  const handleValidate = async () => {
    await validate(testScript);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getLocationDisplayPath = (location: string[]): string => {
    if (!location || location.length === 0) return "Unbekannte Position";
    
    // Bereinige die FHIR-Location-Pfade für bessere Lesbarkeit
    return location
      .map(loc => loc.replace(/Parameters\.parameter\[0\]\.resource\./, "")
                    .replace(/\/\*TestScript\/null\*\/\./, "")
                    .replace(/\[\d+\]/g, (match) => `[${match.slice(1, -1)}]`))
      .join(" → ");
  };

  const formatValidationMessage = (message: string): string => {
    // Verbessere die Fehlermeldungen für bessere Lesbarkeit
    return message
      .replace(/Array cannot be empty - the property should not be present if it has no values/, 
               "Leeres Array - Entfernen Sie die Eigenschaft, wenn keine Werte vorhanden sind")
      .replace(/Canonical URLs must be absolute URLs if they are not fragment references/, 
               "Canonical URLs müssen absolute URLs sein, falls es sich nicht um Fragment-Referenzen handelt")
      .replace(/minimum required = (\d+), but only found (\d+)/, 
               "Mindestens $1 erforderlich, aber nur $2 gefunden");
  };

  const renderValidationStatus = () => {
    if (isValidating) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Server className="h-4 w-4 animate-pulse" />
          <AlertTitle>Validierung läuft...</AlertTitle>
          <AlertDescription>
            Bitte warten Sie, während das TestScript gegen den FHIR-Server validiert wird.
          </AlertDescription>
        </Alert>
      );
    }

    if (serverError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verbindungsfehler</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{serverError}</p>
              <p className="text-sm">
                Prüfen Sie die Server-URL und Ihre Internetverbindung.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (!validationResult) {
      return (
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4" />
          <AlertTitle>Bereit für Validierung</AlertTitle>
          <AlertDescription>
            Klicken Sie auf "Validieren", um Ihr TestScript zu überprüfen.
          </AlertDescription>
        </Alert>
      );
    }

    const hasErrors = validationResult.issue?.some(
      issue => issue.severity === "error" || issue.severity === "fatal"
    );
    const hasWarnings = validationResult.issue?.some(
      issue => issue.severity === "warning"
    );

    const errorCount = validationResult.issue?.filter(issue => issue.severity === "error" || issue.severity === "fatal").length || 0;
    const warningCount = validationResult.issue?.filter(issue => issue.severity === "warning").length || 0;
    const infoCount = validationResult.issue?.filter(issue => issue.severity === "information").length || 0;

    return (
      <Card className={`${hasErrors ? 'border-red-200' : 'border-green-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-600">Validierung fehlgeschlagen</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-600">Validierung erfolgreich</span>
              </>
            )}
          </CardTitle>
          <div className="flex gap-2 text-sm">
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Fehler
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {warningCount} Warnungen
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {infoCount} Hinweise
              </Badge>
            )}
            {!hasErrors && !hasWarnings && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Keine Probleme gefunden
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderIssues()}
        </CardContent>
      </Card>
    );
  };

  const renderIssues = () => {
    if (!validationResult?.issue || validationResult.issue.length === 0) {
      return (
        <div className="text-center py-4 text-green-600">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Keine Validierungsprobleme gefunden!</p>
          <p className="text-sm text-gray-600">Ihr TestScript entspricht der FHIR-Spezifikation.</p>
        </div>
      );
    }

    const issues = validationResult.issue;
    const fatalIssues = issues.filter(issue => issue.severity === "fatal");
    const errorIssues = issues.filter(issue => issue.severity === "error");
    const warningIssues = issues.filter(issue => issue.severity === "warning");
    const infoIssues = issues.filter(issue => issue.severity === "information");

    return (
      <div className="space-y-4">
        <Accordion type="multiple" className="w-full">
          {fatalIssues.length > 0 && (
            <AccordionItem value="fatal" className="border-red-200">
              <AccordionTrigger className="text-red-700 hover:text-red-800">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Fatale Fehler ({fatalIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {fatalIssues.map((issue, index) => (
                    <Card key={index} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-red-800 mb-2">
                              {formatValidationMessage(issue.details?.text || "Unbekannter Fehler")}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-red-700 font-medium">Position:</Label>
                                <p className="text-red-600 mt-1">
                                  Zeile {issue.line}, Spalte {issue.column}
                                </p>
                              </div>
                              <div>
                                <Label className="text-red-700 font-medium">Code:</Label>
                                <p className="text-red-600 mt-1 font-mono">
                                  {issue.code || "Unbekannt"}
                                </p>
                              </div>
                            </div>
                            
                            {issue.location && issue.location.length > 0 && (
                              <div className="mt-3">
                                <Label className="text-red-700 font-medium">Pfad:</Label>
                                <p className="text-red-600 mt-1 font-mono text-xs break-all">
                                  {getLocationDisplayPath(issue.location)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {errorIssues.length > 0 && (
            <AccordionItem value="error" className="border-red-200">
              <AccordionTrigger className="text-red-600 hover:text-red-700">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Fehler ({errorIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {errorIssues.map((issue, index) => (
                    <Card key={index} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-red-800 mb-2">
                              {formatValidationMessage(issue.details?.text || "Unbekannter Fehler")}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-red-700 font-medium">Position:</Label>
                                <p className="text-red-600 mt-1">
                                  Zeile {issue.line}, Spalte {issue.column}
                                </p>
                              </div>
                              <div>
                                <Label className="text-red-700 font-medium">Code:</Label>
                                <p className="text-red-600 mt-1 font-mono">
                                  {issue.code || "Unbekannt"}
                                </p>
                              </div>
                            </div>
                            
                            {issue.location && issue.location.length > 0 && (
                              <div className="mt-3">
                                <Label className="text-red-700 font-medium">Pfad:</Label>
                                <p className="text-red-600 mt-1 font-mono text-xs break-all">
                                  {getLocationDisplayPath(issue.location)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {warningIssues.length > 0 && (
            <AccordionItem value="warning" className="border-yellow-200">
              <AccordionTrigger className="text-yellow-700 hover:text-yellow-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Warnungen ({warningIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {warningIssues.map((issue, index) => (
                    <Card key={index} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-yellow-800 mb-2">
                              {formatValidationMessage(issue.details?.text || "Unbekannte Warnung")}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-yellow-700 font-medium">Position:</Label>
                                <p className="text-yellow-600 mt-1">
                                  Zeile {issue.line}, Spalte {issue.column}
                                </p>
                              </div>
                              <div>
                                <Label className="text-yellow-700 font-medium">Code:</Label>
                                <p className="text-yellow-600 mt-1 font-mono">
                                  {issue.code || "Unbekannt"}
                                </p>
                              </div>
                            </div>
                            
                            {issue.location && issue.location.length > 0 && (
                              <div className="mt-3">
                                <Label className="text-yellow-700 font-medium">Pfad:</Label>
                                <p className="text-yellow-600 mt-1 font-mono text-xs break-all">
                                  {getLocationDisplayPath(issue.location)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {infoIssues.length > 0 && (
            <AccordionItem value="info" className="border-blue-200">
              <AccordionTrigger className="text-blue-700 hover:text-blue-800">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span className="font-semibold">Informationen ({infoIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {infoIssues.map((issue, index) => (
                    <Card key={index} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-blue-800 mb-2">
                              {issue.details?.text || "Unbekannte Information"}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-blue-700 font-medium">Position:</Label>
                                <p className="text-blue-600 mt-1">
                                  Zeile {issue.line}, Spalte {issue.column}
                                </p>
                              </div>
                              <div>
                                <Label className="text-blue-700 font-medium">Code:</Label>
                                <p className="text-blue-600 mt-1 font-mono">
                                  {issue.code || "Unbekannt"}
                                </p>
                              </div>
                            </div>
                            
                            {issue.location && issue.location.length > 0 && (
                              <div className="mt-3">
                                <Label className="text-blue-700 font-medium">Pfad:</Label>
                                <p className="text-blue-600 mt-1 font-mono text-xs break-all">
                                  {getLocationDisplayPath(issue.location)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Debug-Information */}
        <Separator />
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPayload(!showPayload)}
            className="flex items-center gap-2"
          >
            <Code2 className="h-4 w-4" />
            {showPayload ? "JSON ausblenden" : "JSON-Payload anzeigen"}
          </Button>
          
          {showPayload && (
            <Card className="mt-3 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Gesendetes TestScript (JSON)</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(testScript, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-64 border">
                  {JSON.stringify(testScript, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            FHIR-Validierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="server-url" className="text-sm font-medium">
                FHIR-Server URL
              </Label>
              <Input
                id="server-url"
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://hapi.fhir.org/baseR5"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleValidate}
                disabled={isValidating}
                className="min-w-[120px]"
              >
                {isValidating ? (
                  <>
                    <Server className="h-4 w-4 mr-2 animate-pulse" />
                    Validiere...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Validieren
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderValidationStatus()}
    </div>
  );
} 