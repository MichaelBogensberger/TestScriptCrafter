"use client";

import { TestScript, ValidationResult, ValidationIssue } from "@/types/fhir-enhanced";
import { FhirVersion } from "@/types/fhir-config";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Info, XCircle, Server, AlertCircle, Code2, Copy, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState, type ReactNode } from "react";
import { useProgressAnimation } from "@/hooks/use-progress-animation";
import { clientOnly } from "@/hooks/use-client-only";

interface ValidationTabProps {
  testScript: TestScript;
  // Geteilte Validation State Props (statt eigenem Hook)
  isValidating: boolean;
  validationResult: ValidationResult | null;
  validate: (testScript: TestScript) => Promise<void>;
  serverError: string | null;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  currentFhirVersion: FhirVersion;
  // New props for Request/Response display
  lastRequestPayload: TestScript | null;
  lastServerResponse: any | null;
}

export function ValidationTab({ 
  testScript, 
  isValidating, 
  validationResult, 
  validate,
  serverError,
  serverUrl,
  setServerUrl,
  currentFhirVersion,
  lastRequestPayload,
  lastServerResponse 
}: ValidationTabProps) {
  // Hook wurde entfernt - verwende Props stattdessen
  
  const [showPayload, setShowPayload] = useState(false);
  const [showServerResponse, setShowServerResponse] = useState(false);
  
  // SSR-sichere Progress-Animation ohne Math.random()
  const progress = useProgressAnimation({
    isActive: isValidating,
    duration: 200,
    maxProgress: 90,
    increment: 8
  });

  const handleValidate = async () => {
    await validate(testScript);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await clientOnly.clipboard.writeText(text);
    } catch (error) {
      console.warn('Clipboard API not available:', error);
    }
  };

  const getLocationDisplayPath = (location: string[] | undefined, expression: string[] | undefined): string => {
    // Prefer expression field as it's often cleaner
    if (expression && expression.length > 0) {
      const cleanExpression = expression
        .map(expr => expr.replace(/Parameters\.parameter\[0\]\.resource\./, "")
                        .replace(/\/\*TestScript\/null\*\/\./, "")
                        .replace(/\[\d+\]/g, (match) => `[${match.slice(1, -1)}]`))
        .join(" → ");
      if (cleanExpression) return cleanExpression;
    }
    
    if (!location || location.length === 0) return "Unknown position";
    
    // Clean FHIR location paths for better readability
    return location
      .map(loc => loc.replace(/Parameters\.parameter\[0\]\.resource\./, "")
                    .replace(/\/\*TestScript\/null\*\/\./, "")
                    .replace(/\[\d+\]/g, (match) => `[${match.slice(1, -1)}]`)
                    .replace(/^Line\[(\d+)\] Col\[(\d+)\]$/, "Line $1, Column $2"))
      .join(" → ");
  };

  const formatValidationMessage = (message: string): string => {
    // Keep original error messages for consistency with FHIR specification
    return message;
  };

  const renderIssueDetails = (issue: ValidationIssue, colorScheme: {
    icon: ReactNode;
    text: string;
    bg: string;
    border: string;
    label: string;
  }) => {
    const issueText = issue.details?.text || issue.diagnostics || "Unknown error";
    const hasLine = issue.line && issue.line > 0;
    const hasColumn = issue.column && issue.column > 0;
    const hasPosition = hasLine || hasColumn;
    const locationPath = getLocationDisplayPath(issue.location, issue.expression);
    const hasLocation = locationPath && locationPath !== "Unknown position";
    
    // Build position string
    const positionParts: string[] = [];
    if (hasLine) positionParts.push(`Line ${issue.line}`);
    if (hasColumn) positionParts.push(`Column ${issue.column}`);
    const positionText = positionParts.length > 0 ? positionParts.join(", ") : undefined;
    
    return (
      <div className="flex items-start gap-3">
        {colorScheme.icon}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${colorScheme.text} mb-2`}>
            {formatValidationMessage(issueText)}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {positionText && (
              <div>
                <Label className={`${colorScheme.label} font-medium`}>Position:</Label>
                <p className={`${colorScheme.text} mt-1`}>
                  {positionText}
                </p>
              </div>
            )}
            <div>
              <Label className={`${colorScheme.label} font-medium`}>Code:</Label>
              <p className={`${colorScheme.text} mt-1 font-mono`}>
                {issue.code || "Unknown"}
              </p>
            </div>
            {issue.constraintName && (
              <div>
                <Label className={`${colorScheme.label} font-medium`}>Constraint:</Label>
                <p className={`${colorScheme.text} mt-1 font-mono font-semibold`}>
                  {issue.constraintName}
                </p>
              </div>
            )}
          </div>
          
          {hasLocation && (
            <div className="mt-3">
              <Label className={`${colorScheme.label} font-medium`}>Path:</Label>
              <p className={`${colorScheme.text} mt-1 font-mono text-xs break-all`}>
                {locationPath}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderValidationStatus = () => {
    if (isValidating) {
      return (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <CardTitle className="text-lg">Validating...</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                In Progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                TestScript is being validated against FHIR server...
              </p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% abgeschlossen
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (serverError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{serverError}</p>
              <p className="text-sm">
                Please check the server URL and your internet connection.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (!validationResult) {
      return (
        <Alert className="border-muted bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertTitle>Ready for Validation</AlertTitle>
          <AlertDescription>
            Click &quot;Validate&quot; to check your TestScript.
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
      <Card className={`${hasErrors ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">Validation Failed</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">Validation Successful</span>
              </>
            )}
          </CardTitle>
          <div className="flex gap-2 text-sm">
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {warningCount} Warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {infoCount} Info{infoCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {!hasErrors && !hasWarnings && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                No Issues Found
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
        <div className="text-center py-4 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">No Validation Issues Found!</p>
          <p className="text-sm text-muted-foreground">Your TestScript complies with the FHIR specification.</p>
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
            <AccordionItem value="fatal" className="border-red-200 dark:border-red-800">
              <AccordionTrigger className="text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Fatale Fehler ({fatalIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {fatalIssues.map((issue, index) => (
                    <Card key={index} className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <CardContent className="p-4">
                        {renderIssueDetails(issue, {
                          icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />,
                          text: "text-red-800 dark:text-red-200",
                          bg: "bg-red-50 dark:bg-red-950",
                          border: "border-red-200 dark:border-red-800",
                          label: "text-red-700 dark:text-red-300"
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {errorIssues.length > 0 && (
            <AccordionItem value="error" className="border-red-200 dark:border-red-800">
              <AccordionTrigger className="text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Fehler ({errorIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {errorIssues.map((issue, index) => (
                    <Card key={index} className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <CardContent className="p-4">
                        {renderIssueDetails(issue, {
                          icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />,
                          text: "text-red-800 dark:text-red-200",
                          bg: "bg-red-50 dark:bg-red-950",
                          border: "border-red-200 dark:border-red-800",
                          label: "text-red-700 dark:text-red-300"
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {warningIssues.length > 0 && (
            <AccordionItem value="warning" className="border-yellow-200 dark:border-yellow-800">
              <AccordionTrigger className="text-yellow-700 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Warnungen ({warningIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {warningIssues.map((issue, index) => (
                    <Card key={index} className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                      <CardContent className="p-4">
                        {renderIssueDetails(issue, {
                          icon: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />,
                          text: "text-yellow-800 dark:text-yellow-200",
                          bg: "bg-yellow-50 dark:bg-yellow-950",
                          border: "border-yellow-200 dark:border-yellow-800",
                          label: "text-yellow-700 dark:text-yellow-300"
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {infoIssues.length > 0 && (
            <AccordionItem value="info" className="border-blue-200 dark:border-blue-800">
              <AccordionTrigger className="text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span className="font-semibold">Informationen ({infoIssues.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {infoIssues.map((issue, index) => (
                    <Card key={index} className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                      <CardContent className="p-4">
                        {renderIssueDetails(issue, {
                          icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />,
                          text: "text-blue-800 dark:text-blue-200",
                          bg: "bg-blue-50 dark:bg-blue-950",
                          border: "border-blue-200 dark:border-blue-800",
                          label: "text-blue-700 dark:text-blue-300"
                        })}
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
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPayload(!showPayload)}
              className="flex items-center gap-2"
              disabled={!lastRequestPayload}
            >
              <Code2 className="h-4 w-4" />
              {showPayload ? "Request ausblenden" : "Request-Payload anzeigen"}
            </Button>
            
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setShowServerResponse(!showServerResponse)}
              className="flex items-center gap-2"
              disabled={!lastServerResponse}
            >
              <Server className="h-4 w-4" />
              {showServerResponse ? "Response ausblenden" : "Server-Response anzeigen"}
            </Button>
          </div>
          
          {showPayload && lastRequestPayload && (
            <Card className="mt-3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Gesendetes TestScript (JSON)</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(lastRequestPayload, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64 border">
                  {JSON.stringify(lastRequestPayload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {showServerResponse && lastServerResponse && (
            <Card className="mt-3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Server-Antwort (OperationOutcome)</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(lastServerResponse, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64 border">
                  {JSON.stringify(lastServerResponse, null, 2)}
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
      <Card className="bg-gradient-to-r from-background to-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">FHIR-Validierung</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Validiere dein TestScript gegen einen FHIR-Server
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
              HL7 FHIR R5
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="server-url" className="text-sm font-medium">
                  FHIR-Server URL
                </Label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                      <Info className="h-3 w-3" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Recommended FHIR servers for {currentFhirVersion}:</h4>
                      <div className="space-y-1 text-xs">
                        <p><code className="bg-muted px-1 rounded">
                          {currentFhirVersion === 'R5' ? 'https://hapi.fhir.org/baseR5' : 'https://hapi.fhir.org/baseR4'}
                        </code> - HAPI FHIR {currentFhirVersion}</p>
                        <p><code className="bg-muted px-1 rounded">https://vonk.fire.ly</code> - Firely Vonk (Multi-Version)</p>
                        <p><code className="bg-muted px-1 rounded">http://localhost:8080/fhir</code> - Lokaler Server</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Make sure the server has CORS enabled and supports TestScript validation.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <Input
                id="server-url"
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder={currentFhirVersion === 'R5' ? 'https://hapi.fhir.org/baseR5' : 'https://hapi.fhir.org/baseR4'}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleValidate}
                disabled={isValidating}
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validiere...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Jetzt validieren
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