import { useState, useEffect } from "react";
import type {
  Extension,
  OperationOutcome,
  OperationOutcomeIssue,
  TestScript,
  ValidationIssue,
  ValidationResult,
} from "@/types/fhir-enhanced";
import { useFhirVersion } from "@/lib/fhir-version-context";
import { FhirVersion, getFhirVersionConfig } from "@/types/fhir-config";

export function useFhirValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { currentVersion, currentConfig } = useFhirVersion();
  
  // Version-abhängige Server URL basierend auf der aktuellen FHIR Version
  const getDefaultServerUrl = (version: FhirVersion) => {
    const config = getFhirVersionConfig(version);
    return config.validationEndpoint.replace('/TestScript/$validate', '');
  };
  
  const [serverUrl, setServerUrl] = useState(() => getDefaultServerUrl(currentVersion));

  // Automatische Aktualisierung der Server URL bei Version-Wechsel
  useEffect(() => {
    setServerUrl(getDefaultServerUrl(currentVersion));
    // Validierungsergebnis zurücksetzen da es für andere Version nicht mehr relevant ist
    setValidationResult(null);
    setServerError(null);
  }, [currentVersion]);

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
          "Accept": "application/fhir+json",
          "X-FHIR-Version": currentVersion // Übermittle Version über Header
        },
        body: JSON.stringify(testScript) // Sende nur FHIR-konforme TestScript-Daten
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
    setServerUrl,
    currentFhirVersion: currentVersion
  };
} 