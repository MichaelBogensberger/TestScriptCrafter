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
  }
  
  if (!testScript.status) {
    errors.push("TestScript muss einen Status haben");
  }
  
  // Setup validieren
  if (testScript.setup && testScript.setup.action) {
    testScript.setup.action.forEach((action, index) => {
      const prefix = `Setup Aktion #${index + 1}`;
      
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
  
  // Weitere Validierungsregeln...
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
  
  // Weitere Validierungsregeln...
} 