import { TestScript } from "@/types/test-script";
import { useFhirValidation } from "@/hooks/use-fhir-validation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Info, XCircle, Server, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const handleValidate = async () => {
    await validate(testScript);
  };

  const renderValidationStatus = () => {
    if (isValidating) {
      return (
        <Alert>
          <AlertTitle>Validierung läuft...</AlertTitle>
          <AlertDescription>
            Bitte warten Sie, während das TestScript validiert wird.
          </AlertDescription>
        </Alert>
      );
    }

    if (serverError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Serverfehler</AlertTitle>
          <AlertDescription>
            {serverError}
          </AlertDescription>
        </Alert>
      );
    }

    if (!validationResult) {
      return null;
    }

    const hasErrors = validationResult.issue?.some(
      issue => issue.severity === "error" || issue.severity === "fatal"
    );
    const hasWarnings = validationResult.issue?.some(
      issue => issue.severity === "warning"
    );
    const hasInfo = validationResult.issue?.some(
      issue => issue.severity === "information"
    );

    return (
      <div className="space-y-4">
        <Alert variant={hasErrors ? "destructive" : "default"}>
          <AlertTitle className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <XCircle className="h-5 w-5" />
                Validierung fehlgeschlagen
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Validierung erfolgreich
              </>
            )}
          </AlertTitle>
          <AlertDescription>
            {hasErrors 
              ? "Es wurden Fehler in der Validierung gefunden."
              : "Das TestScript wurde erfolgreich validiert."}
          </AlertDescription>
        </Alert>

        {renderIssues()}
      </div>
    );
  };

  const renderIssues = () => {
    if (!validationResult?.issue) return null;

    const issues = validationResult.issue;
    const fatalIssues = issues.filter(issue => issue.severity === "fatal");
    const errorIssues = issues.filter(issue => issue.severity === "error");
    const warningIssues = issues.filter(issue => issue.severity === "warning");
    const infoIssues = issues.filter(issue => issue.severity === "information");

    return (
      <Accordion type="multiple" className="w-full">
        {fatalIssues.length > 0 && (
          <AccordionItem value="fatal">
            <AccordionTrigger className="text-red-600">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span>Fatale Fehler ({fatalIssues.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {fatalIssues.map((issue, index) => (
                  <div key={index} className="p-2 bg-red-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-600">{issue.details?.text}</p>
                        {issue.location && issue.location.length > 0 && (
                          <p className="text-sm text-red-500">
                            Position: Zeile {issue.line}, Spalte {issue.column}
                            <br />
                            Pfad: {issue.location.join(" > ")}
                          </p>
                        )}
                        {issue.code && (
                          <p className="text-sm text-red-500">Code: {issue.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {errorIssues.length > 0 && (
          <AccordionItem value="error">
            <AccordionTrigger className="text-red-600">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span>Fehler ({errorIssues.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {errorIssues.map((issue, index) => (
                  <div key={index} className="p-2 bg-red-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-600">{issue.details?.text}</p>
                        {issue.location && issue.location.length > 0 && (
                          <p className="text-sm text-red-500">
                            Position: Zeile {issue.line}, Spalte {issue.column}
                            <br />
                            Pfad: {issue.location.join(" > ")}
                          </p>
                        )}
                        {issue.code && (
                          <p className="text-sm text-red-500">Code: {issue.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {warningIssues.length > 0 && (
          <AccordionItem value="warning">
            <AccordionTrigger className="text-yellow-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Warnungen ({warningIssues.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {warningIssues.map((issue, index) => (
                  <div key={index} className="p-2 bg-yellow-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-600">{issue.details?.text}</p>
                        {issue.location && issue.location.length > 0 && (
                          <p className="text-sm text-yellow-600">
                            Position: Zeile {issue.line}, Spalte {issue.column}
                            <br />
                            Pfad: {issue.location.join(" > ")}
                          </p>
                        )}
                        {issue.code && (
                          <p className="text-sm text-yellow-600">Code: {issue.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {infoIssues.length > 0 && (
          <AccordionItem value="info">
            <AccordionTrigger className="text-blue-600">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <span>Informationen ({infoIssues.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {infoIssues.map((issue, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-600">{issue.details?.text}</p>
                        {issue.location && issue.location.length > 0 && (
                          <p className="text-sm text-blue-600">
                            Position: Zeile {issue.line}, Spalte {issue.column}
                            <br />
                            Pfad: {issue.location.join(" > ")}
                          </p>
                        )}
                        {issue.code && (
                          <p className="text-sm text-blue-600">Code: {issue.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="FHIR Server URL"
          className="flex-1"
        />
        <Button 
          onClick={handleValidate}
          disabled={isValidating}
        >
          {isValidating ? "Validiere..." : "Validieren"}
        </Button>
      </div>

      {renderValidationStatus()}
    </div>
  );
} 