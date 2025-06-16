import { useState, useCallback } from "react";
import { TestScript } from "@/types/test-script";
import { ValidationResult } from "@/types/validation";

interface ValidationOptions {
  serverUrl: string;
}

interface UseFhirValidationResult {
  isValidating: boolean;
  validationResult: ValidationResult | null;
  validate: (testScript: TestScript, options: ValidationOptions) => Promise<void>;
  reset: () => void;
  setValidationResult: (result: ValidationResult) => void;
}

const DEFAULT_SERVER_URL = "https://hapi.fhir.org/baseR4";

/**
 * Hook für die Validierung eines TestScripts gegen einen FHIR-Server
 */
export function useFhirValidation(): UseFhirValidationResult {
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validate = useCallback(async (
    testScript: TestScript, 
    options: ValidationOptions
  ) => {
    if (!testScript) return;
    
    try {
      setIsValidating(true);
      setValidationResult(null);
      
      const response = await fetch(`${options.serverUrl}/TestScript/$validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        },
        body: JSON.stringify(testScript)
      });

      const data = await response.json();

      if (!response.ok) {
        // Detaillierte Fehlerbehandlung
        let errorMessage = `Validierungsfehler: ${response.status} ${response.statusText}`;
        let issues = [];

        if (data.issue) {
          // FHIR OperationOutcome Format
          issues = data.issue.map((issue: any) => ({
            severity: issue.severity || 'error',
            code: issue.code || 'invalid',
            diagnostics: issue.diagnostics || 'Unbekannter Fehler',
            location: issue.location || [],
            details: issue.details?.text || null,
            expression: issue.expression || null
          }));
        } else if (data.error) {
          // Standard HTTP Error Format
          issues = [{
            severity: 'error',
            code: data.error,
            diagnostics: data.error_description || data.message || 'Unbekannter Fehler',
            location: [],
            details: null,
            expression: null
          }];
        }

        setValidationResult({
          valid: false,
          message: errorMessage,
          issues: issues
        });
        return;
      }

      setValidationResult({
        valid: true,
        message: "Validierung erfolgreich",
        issues: []
      });
    } catch (error) {
      console.error('Validierungsfehler:', error);
      setValidationResult({
        valid: false,
        message: error instanceof Error ? error.message : "Unbekannter Fehler bei der Validierung",
        issues: [{
          severity: 'fatal',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : "Unbekannter Fehler",
          location: [],
          details: "Ein unerwarteter Fehler ist aufgetreten",
          expression: null
        }]
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    isValidating,
    validationResult,
    validate,
    reset,
    setValidationResult
  };
} 