import { useState } from "react";
import type { TestScript } from "@/types/test-script";

interface ValidationIssue {
  severity: "fatal" | "error" | "warning" | "information";
  code: string;
  details: {
    text: string;
  };
  location?: string[];
}

interface ValidationResult {
  resourceType: "OperationOutcome";
  issue: ValidationIssue[];
}

export function useFhirValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState("https://hapi.fhir.org/baseR5");

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
      setValidationResult(data);
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
          }
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