import { useState } from "react";
import type {
  Extension,
  OperationOutcome,
  OperationOutcomeIssue,
  TestScript,
  ValidationIssue,
  ValidationResult,
} from "@/types/fhir-enhanced";

export function useFhirValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState("https://hapi.fhir.org/baseR5");

  const extractPosition = (issue: OperationOutcomeIssue): { line: number; column: number } => {
    let line = 1;
    let column = 1;

    const lineExtension = issue.extension?.find(
      (extension: Extension) =>
        extension.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line",
    );
    const columnExtension = issue.extension?.find(
      (extension: Extension) =>
        extension.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col",
    );

    if (typeof lineExtension?.valueInteger === "number") {
      line = lineExtension.valueInteger;
    }

    if (typeof columnExtension?.valueInteger === "number") {
      column = columnExtension.valueInteger;
    }

    return { line, column };
  };

  const parseValidationResult = (outcome: OperationOutcome): ValidationResult => {
    const issues: ValidationIssue[] = (outcome.issue ?? []).map((issue: OperationOutcomeIssue) => {
      const { line, column } = extractPosition(issue);
      const diagnostics = issue.diagnostics ?? issue.details?.text ?? "Unbekannter Fehler";

      return {
        ...issue,
        details: {
          text: diagnostics,
        },
        location: issue.location ?? [],
        line,
        column,
      };
    });

    return {
      ...outcome,
      issue: issues,
    };
  };

  const validate = async (testScript: TestScript) => {
    setIsValidating(true);
    setServerError(null);
    
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          "Accept": "application/fhir+json"
        },
        body: JSON.stringify(testScript)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as OperationOutcome;
      const parsedResult = parseValidationResult(data);
      setValidationResult(parsedResult);
    } catch (error: unknown) {
      console.error("Validierungsfehler:", error);
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      setServerError(message);
      setValidationResult({
        resourceType: "OperationOutcome",
        issue: [{
          severity: "error",
          code: "processing",
          details: {
            text: `Fehler bei der Validierung: ${message}`
          },
          location: [],
          line: 1,
          column: 1
        }]
      });
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    validationResult,
    validate,
    serverError,
    serverUrl,
    setServerUrl
  };
} 