import { useState } from "react";
import type { TestScript, ValidationResult, ValidationIssue } from "@/types/fhir-enhanced";

export function useFhirValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState("https://hapi.fhir.org/baseR5");

  const parseValidationResult = (data: any): ValidationResult => {
    if (!data.issue) {
      return data;
    }

    const parsedIssues: ValidationIssue[] = data.issue.map((issue: any) => {
      let line = 1;
      let column = 1;

      // Parse Extensions für Zeilen- und Spaltennummern
      if (issue.extension) {
        const lineExtension = issue.extension.find((ext: any) => 
          ext.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line"
        );
        const colExtension = issue.extension.find((ext: any) => 
          ext.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col"
        );

        if (lineExtension?.valueInteger) {
          line = lineExtension.valueInteger;
        }
        if (colExtension?.valueInteger) {
          column = colExtension.valueInteger;
        }
      }

      const parsedIssue: ValidationIssue = {
        severity: issue.severity,
        code: issue.code,
        details: {
          text: issue.diagnostics || issue.details?.text || "Unbekannter Fehler"
        },
        location: issue.location || [],
        line,
        column
      };

      return parsedIssue;
    });

    return {
      resourceType: "OperationOutcome",
      issue: parsedIssues
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

      const data = await response.json();
      const parsedResult = parseValidationResult(data);
      setValidationResult(parsedResult);
    } catch (error) {
      console.error("Validierungsfehler:", error);
      setServerError(error instanceof Error ? error.message : "Unbekannter Fehler");
      setValidationResult({
        resourceType: "OperationOutcome",
        issue: [{
          severity: "error",
          code: "processing",
          details: {
            text: "Fehler bei der Validierung: " + (error instanceof Error ? error.message : "Unbekannter Fehler")
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