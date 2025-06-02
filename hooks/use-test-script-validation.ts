import { useState, useEffect, useCallback } from "react"
import { TestScript } from "@/types/test-script"
import { validateTestScript, ValidationResult } from "@/lib/validators/test-script-validator"

/**
 * Hook zur Validierung eines TestScripts mit automatischer Aktualisierung
 * und manueller Triggerung bei Bedarf
 */
export function useTestScriptValidation(testScript: TestScript | null) {
  const [result, setResult] = useState<ValidationResult>({ valid: true, errors: [] });

  // Validierungsfunktion
  const validate = useCallback(() => {
    if (!testScript) {
      setResult({ valid: true, errors: [] });
      return;
    }
    
    const validationResult = validateTestScript(testScript);
    setResult(validationResult);
  }, [testScript]);

  // Automatische Validierung bei Änderungen am TestScript
  useEffect(() => {
    validate();
  }, [validate]);

  return {
    isValid: result.valid,
    errors: result.errors,
    validate // Ermöglicht manuelle Validierung bei Bedarf
  };
} 