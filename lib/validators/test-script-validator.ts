import { TestScript, Operation, Assertion } from "@/types/test-script"

/**
 * Validierungsergebnis für ein TestScript
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validiert ein TestScript auf Korrektheit und Vollständigkeit
 * 
 * @param testScript Das zu validierende TestScript
 * @returns ValidationResult mit Status und Fehlermeldungen
 */
export function validateTestScript(testScript: TestScript): ValidationResult {
  const errors: string[] = [];
  
  // Grundlegende Prüfung
  if (!testScript) {
    return { valid: false, errors: ["Kein TestScript vorhanden"] };
  }
  
  // ResourceType prüfen
  if (testScript.resourceType !== "TestScript") {
    errors.push("ResourceType muss 'TestScript' sein");
  }
  
  // Pflichtfelder prüfen
  if (!testScript.name) {
    errors.push("TestScript muss einen Namen haben");
  } else if (!testScript.name.match(/^[A-Z]([A-Za-z0-9_]){1,254}$/)) {
    errors.push("Der Name muss mit einem Großbuchstaben beginnen und darf nur Buchstaben, Zahlen und Unterstriche enthalten");
  }
  
  if (!testScript.status) {
    errors.push("TestScript muss einen Status haben");
  } else if (!['draft', 'active', 'retired', 'unknown'].includes(testScript.status)) {
    errors.push("Status muss einer der folgenden Werte sein: draft, active, retired, unknown");
  }

  // URL Validierung
  if (testScript.url && (testScript.url.includes('|') || testScript.url.includes('#'))) {
    errors.push("URL darf keine | oder # Zeichen enthalten");
  }

  // Metadata Validierung
  if (testScript.metadata) {
    if (!testScript.metadata.capability || testScript.metadata.capability.length === 0) {
      errors.push("Metadata muss mindestens eine Capability enthalten");
    } else {
      testScript.metadata.capability.forEach((cap, index) => {
        if (cap.required === undefined && cap.validated === undefined) {
          errors.push(`Capability #${index + 1}: Mindestens eines der Felder 'required' oder 'validated' muss gesetzt sein`);
        }
        if (!cap.capabilities) {
          errors.push(`Capability #${index + 1}: Das Feld 'capabilities' ist erforderlich`);
        }
      });
    }
  }

  // Setup validieren
  if (testScript.setup && testScript.setup.action) {
    testScript.setup.action.forEach((action, index) => {
      const prefix = `Setup Aktion #${index + 1}`;
      
      // Prüfen, dass nur eine der Aktionen (common, operation, assert) vorhanden ist
      const actionCount = [action.common, action.operation, action.assert].filter(Boolean).length;
      if (actionCount !== 1) {
        errors.push(`${prefix}: Muss genau eine der Aktionen (common, operation, assert) enthalten`);
      }
      
      if (action.operation) {
        validateOperation(action.operation, errors, prefix, index);
      }
      
      if (action.assert) {
        validateAssertion(action.assert, errors, prefix);
      }
    });
  }
  
  // Tests validieren
  if (testScript.test) {
    testScript.test.forEach((test, testIndex) => {
      const testPrefix = `Test #${testIndex + 1}`;
      
      if (test.action) {
        test.action.forEach((action, actionIndex) => {
          const prefix = `${testPrefix} Aktion #${actionIndex + 1}`;
          
          // Prüfen, dass nur eine der Aktionen (common, operation, assert) vorhanden ist
          const actionCount = [action.common, action.operation, action.assert].filter(Boolean).length;
          if (actionCount !== 1) {
            errors.push(`${prefix}: Muss genau eine der Aktionen (common, operation, assert) enthalten`);
          }
          
          if (action.operation) {
            validateOperation(action.operation, errors, prefix, actionIndex);
          }
          
          if (action.assert) {
            validateAssertion(action.assert, errors, prefix);
          }
        });
      }
    });
  }
  
  // Teardown validieren
  if (testScript.teardown && testScript.teardown.action) {
    testScript.teardown.action.forEach((action, index) => {
      const prefix = `Teardown Aktion #${index + 1}`;
      
      if (action.operation) {
        validateOperation(action.operation, errors, prefix, index);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validiert eine Operation und fügt eventuelle Fehler zum errors-Array hinzu
 */
function validateOperation(operation: Operation, errors: string[], prefix: string, index: number): void {
  // URL oder Resource muss vorhanden sein
  if (!operation.url && !operation.resource) {
    errors.push(`${prefix}: Weder URL noch Resource angegeben`);
  }
  
  // Methode validieren
  if (operation.method && !['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(operation.method.toLowerCase())) {
    errors.push(`${prefix}: Ungültige HTTP-Methode: ${operation.method}`);
  }
  
  // Validierung für fehlende IDs in Operations
  if (!operation.requestId && operation.method === "post") {
    errors.push(`${prefix}: POST-Operation ohne requestId`);
  }

  // Prüfen, dass entweder sourceId oder (targetId oder params oder url) vorhanden ist
  if (!operation.sourceId && !operation.targetId && !operation.params && !operation.url) {
    errors.push(`${prefix}: Operation muss entweder sourceId oder (targetId oder params oder url) enthalten`);
  }
}

/**
 * Validiert eine Assertion und fügt eventuelle Fehler zum errors-Array hinzu
 */
function validateAssertion(assertion: Assertion, errors: string[], prefix: string): void {
  // Operator validieren
  if (assertion.operator && !['equals', 'notEquals', 'in', 'notIn', 'greaterThan', 'lessThan', 'empty', 'notEmpty', 'contains', 'notContains', 'eval', 'manualEval'].includes(assertion.operator)) {
    errors.push(`${prefix}: Ungültiger Operator: ${assertion.operator}`);
  }
  
  // CompareToSource validieren
  if (assertion.compareToSourceId && !assertion.compareToSourceExpression && !assertion.compareToSourcePath) {
    errors.push(`${prefix}: Bei compareToSourceId muss entweder compareToSourceExpression oder compareToSourcePath angegeben werden`);
  }

  // Prüfen, dass response und responseCode leer sind, wenn direction = 'request'
  if (assertion.direction === 'request' && (assertion.response || assertion.responseCode)) {
    errors.push(`${prefix}: Bei direction = 'request' müssen response und responseCode leer sein`);
  }
} 