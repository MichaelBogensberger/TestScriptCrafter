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
  const [lastRequestPayload, setLastRequestPayload] = useState<TestScript | null>(null);
  const [lastServerResponse, setLastServerResponse] = useState<any | null>(null);
  const { currentVersion, currentConfig } = useFhirVersion();
  
  // Version-abhängige Server URL basierend auf der aktuellen FHIR Version
  const getDefaultServerUrl = (version: FhirVersion) => {
    const config = getFhirVersionConfig(version);
    return config.validationEndpoint.replace('/TestScript/$validate', '');
  };
  
  const [serverUrl, setServerUrl] = useState(() => getDefaultServerUrl(currentVersion));

  // Automatische Aktualisierung der Server URL bei Version-Wechsel
  useEffect(() => {
    console.log('Debug: FHIR Version geändert zu:', currentVersion);
    setServerUrl(getDefaultServerUrl(currentVersion));
    // Validierungsergebnis zurücksetzen da es für andere Version nicht mehr relevant ist
    console.log('Debug: Validierungsergebnisse für neue Version zurückgesetzt');
    setValidationResult(null);
    setServerError(null);
    setLastRequestPayload(null); // Lösche auch Payload und Response
    setLastServerResponse(null);
  }, [currentVersion]);

  const extractPosition = (issue: OperationOutcomeIssue): { line: number; column: number } => {
    let line = 1;
    let column = 1;

    // Suche nach Extensions (können mehrfach vorkommen - nehme die erste)
    if (issue.extension && issue.extension.length > 0) {
      const lineExtension = issue.extension.find(
        (extension: Extension) =>
          extension.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line" &&
          typeof extension.valueInteger === "number"
      );
      const columnExtension = issue.extension.find(
        (extension: Extension) =>
          extension.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col" &&
          typeof extension.valueInteger === "number"
      );

      if (lineExtension?.valueInteger !== undefined) {
        line = lineExtension.valueInteger;
      }

      if (columnExtension?.valueInteger !== undefined) {
        column = columnExtension.valueInteger;
      }
    }

    // Fallback: Versuche auch aus location-Strings zu extrahieren (z.B. "Line[28] Col[14]")
    if (line === 1 && column === 1 && issue.location && issue.location.length > 0) {
      const locationStr = issue.location.find(loc => loc.includes("Line["));
      if (locationStr) {
        const lineMatch = locationStr.match(/Line\[(\d+)\]/);
        const colMatch = locationStr.match(/Col\[(\d+)\]/);
        if (lineMatch) line = parseInt(lineMatch[1], 10);
        if (colMatch) column = parseInt(colMatch[1], 10);
      }
    }

    return { line, column };
  };

  const extractConstraintName = (issue: OperationOutcomeIssue): string | undefined => {
    // Versuche Constraint-Namen aus details.coding.code zu extrahieren (z.B. "TestScript#tst-7")
    if (issue.details?.coding && issue.details.coding.length > 0) {
      const coding = issue.details.coding[0];
      if (coding.code && coding.code.includes("#")) {
        const parts = coding.code.split("#");
        if (parts.length > 1) {
          return parts[parts.length - 1]; // z.B. "tst-7" oder "tst-8"
        }
      }
    }
    return undefined;
  };

  const parseValidationResult = (outcome: OperationOutcome): ValidationResult => {
    const issues: ValidationIssue[] = (outcome.issue ?? []).map((issue: OperationOutcomeIssue) => {
      const { line, column } = extractPosition(issue);
      const constraintName = extractConstraintName(issue);
      
      // Extrahiere die beste verfügbare Fehlermeldung
      // Priorität: diagnostics > details.text > details.coding.display > "Unbekannter Fehler"
      let diagnostics = issue.diagnostics;
      if (!diagnostics && issue.details) {
        diagnostics = issue.details.text || issue.details.coding?.[0]?.display;
      }
      if (!diagnostics) {
        diagnostics = "Unbekannter Fehler";
      }

      // Bereite das details-Objekt vor (behalte alle Felder)
      const details = issue.details ? {
        ...issue.details,
        text: diagnostics,
        // Füge Constraint-Name hinzu falls vorhanden
        ...(constraintName && { constraint: constraintName })
      } : {
        text: diagnostics,
        ...(constraintName && { constraint: constraintName })
      };

      return {
        ...issue,
        details,
        location: issue.location ?? [],
        expression: issue.expression ?? [],
        line,
        column,
        // Füge Constraint-Name als zusätzliche Eigenschaft hinzu (nicht Teil von FHIR, aber nützlich)
        constraintName,
      } as ValidationIssue;
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
      // Speichere die Payload für die Anzeige
      setLastRequestPayload(testScript);
      
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
      
      // Speichere die komplette Server-Response für die Anzeige
      setLastServerResponse(data);
      
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
    currentFhirVersion: currentVersion,
    lastRequestPayload,
    lastServerResponse
  };
} 