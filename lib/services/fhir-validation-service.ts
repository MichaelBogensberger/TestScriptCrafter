/**
 * Service für die Validierung von FHIR-Ressourcen gegen einen FHIR-Server
 */

import { OperationOutcome, OperationOutcomeIssue, TestScript } from "@/types/fhir-enhanced";

export interface ValidationResult {
  valid: boolean;
  issues?: Array<{
    severity: string;
    code: string;
    diagnostics?: string;
    location?: string[];
  }>;
  message?: string;
}

export interface ValidationOptions {
  serverUrl: string;
}

/**
 * Validiert ein TestScript gegen einen FHIR-Server
 * 
 * @param testScript Das zu validierende TestScript
 * @param options Optionen für die Validierung (z.B. Server-URL)
 * @returns Ein ValidationResult mit dem Ergebnis der Validierung
 */
export async function validateTestScriptAgainstFhirServer(
  testScript: TestScript,
  options: ValidationOptions
): Promise<ValidationResult> {
  try {
    // Bereite die Validierungsanfrage vor
    const url = `${options.serverUrl}/$validate`;
    
    // TestScript als JSON senden
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testScript),
    });

    // Fehler bei der Anfrage
    if (!response.ok) {
      return {
        valid: false,
        message: `Validierungsfehler: ${response.status} ${response.statusText}`,
      };
    }

    // Parse die Antwort
    const data = (await response.json()) as OperationOutcome;
    
    // Extrahiere Validierungsprobleme aus der OperationOutcome-Ressource
    if (data.resourceType === 'OperationOutcome' && Array.isArray(data.issue) && data.issue.length > 0) {
      // Filtere nach Fehlern und Warnungen
      const issues: OperationOutcomeIssue[] = data.issue;
      const hasErrors = issues.some((issue) => issue.severity === 'error' || issue.severity === 'fatal');
      
      return {
        valid: !hasErrors,
        issues: issues.map((issue) => ({
          severity: issue.severity,
          code: issue.code,
          diagnostics: issue.diagnostics,
          location: issue.location,
        })),
      };
    }
    
    // Keine Probleme gefunden
    return { valid: true };
  } catch (error: unknown) {
    return {
      valid: false,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
} 