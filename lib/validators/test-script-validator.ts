import { TestScript, Operation, Assertion } from "@/types/test-script"

/**
 * Validierungsergebnis für ein TestScript
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

interface Position {
  line: number;
  column: number;
}

interface ValidationError {
  message: string;
  path: string;
  position: Position;
  details?: string;
}

/**
 * Berechnet die Position eines JSON-Pfads im formatierten JSON
 */
function calculatePositionInFormattedJson(formattedJson: string, jsonPath: string): Position {
  const lines = formattedJson.split('\n');
  
  // Konvertiere den Pfad in ein Suchmuster
  const pathParts = jsonPath.split('.');
  let searchPattern = '';
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    
    // Behandle Array-Indizes wie [0], [1], etc.
    if (part.includes('[') && part.includes(']')) {
      const [fieldName, indexPart] = part.split('[');
      const index = parseInt(indexPart.replace(']', ''));
      
      if (fieldName) {
        searchPattern = `"${fieldName}"`;
      }
      
      // Suche nach dem Array-Element
      let arrayElementCount = 0;
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        if (line.includes(searchPattern) || (fieldName === '' && line.trim().startsWith('{'))) {
          // Zähle die Array-Elemente ab dieser Zeile
          for (let j = lineNum; j < lines.length; j++) {
            const currentLine = lines[j];
            if (currentLine.trim().startsWith('{') && arrayElementCount === index) {
              return { line: j + 1, column: currentLine.indexOf('{') + 1 };
            }
            if (currentLine.trim().startsWith('{')) {
              arrayElementCount++;
            }
          }
        }
      }
    } else {
      // Normales Feld
      searchPattern = `"${part}"`;
      
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const columnIndex = line.indexOf(searchPattern);
        if (columnIndex !== -1) {
          return { line: lineNum + 1, column: columnIndex + 1 };
        }
      }
    }
  }
  
  // Fallback: Suche nach dem letzten Teil des Pfads
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart.includes('[')) {
    const fieldName = lastPart.split('[')[0];
    searchPattern = `"${fieldName}"`;
  } else {
    searchPattern = `"${lastPart}"`;
  }
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const columnIndex = line.indexOf(searchPattern);
    if (columnIndex !== -1) {
      return { line: lineNum + 1, column: columnIndex + 1 };
    }
  }
  
  return { line: 1, column: 1 };
}

/**
 * Erstellt eine Validierungsfehlermeldung
 */
function createValidationError(
  message: string,
  path: string,
  position: Position,
  details?: string
): ValidationError {
  return {
    message,
    path,
    position,
    details
  };
}

/**
 * Validiert ein TestScript auf Korrektheit und Vollständigkeit
 * 
 * @param testScript Das zu validierende TestScript
 * @returns ValidationResult mit Status und Fehlermeldungen
 */
export function validateTestScript(testScript: TestScript): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const info: ValidationError[] = [];
  
  // Konvertiere das TestScript in ein formatiertes JSON für die Positionsberechnung
  const formattedJson = JSON.stringify(testScript, null, 2);
  
  // Grundlegende Prüfung
  if (!testScript) {
    return { 
      valid: false, 
      errors: [createValidationError(
        "Kein TestScript vorhanden",
        "root",
        { line: 1, column: 1 }
      )],
      warnings: [],
      info: []
    };
  }
  
  // ResourceType prüfen
  if (testScript.resourceType !== "TestScript") {
    const pos = calculatePositionInFormattedJson(formattedJson, 'resourceType');
    errors.push(createValidationError(
      "ResourceType muss 'TestScript' sein",
      "resourceType",
      pos,
      `Aktueller Wert: "${testScript.resourceType}"`
    ));
  }
  
  // Pflichtfelder prüfen
  if (!testScript.name) {
    const pos = calculatePositionInFormattedJson(formattedJson, 'name');
    errors.push(createValidationError(
      "TestScript muss einen Namen haben",
      "name",
      pos,
      "Das 'name'-Feld ist erforderlich"
    ));
  } else if (!testScript.name.match(/^[A-Z]([A-Za-z0-9_]){1,254}$/)) {
    const pos = calculatePositionInFormattedJson(formattedJson, 'name');
    errors.push(createValidationError(
      "Der Name muss mit einem Großbuchstaben beginnen und darf nur Buchstaben, Zahlen und Unterstriche enthalten",
      "name",
      pos,
      `Aktueller Name: "${testScript.name}"`
    ));
  }
  
  if (!testScript.status) {
    const pos = calculatePositionInFormattedJson(formattedJson, 'status');
    errors.push(createValidationError(
      "TestScript muss einen Status haben",
      "status",
      pos,
      "Das 'status'-Feld ist erforderlich"
    ));
  } else if (!['draft', 'active', 'retired', 'unknown'].includes(testScript.status)) {
    const pos = calculatePositionInFormattedJson(formattedJson, 'status');
    errors.push(createValidationError(
      "Status muss einer der folgenden Werte sein: draft, active, retired, unknown",
      "status",
      pos,
      `Aktueller Wert: "${testScript.status}"`
    ));
  }

  // URL Validierung
  if (testScript.url && (testScript.url.includes('|') || testScript.url.includes('#'))) {
    const pos = calculatePositionInFormattedJson(formattedJson, 'url');
    errors.push(createValidationError(
      "URL darf keine | oder # Zeichen enthalten",
      "url",
      pos,
      `Aktuelle URL: "${testScript.url}"`
    ));
  }

  // Metadata Validierung
  if (testScript.metadata) {
    if (!testScript.metadata.capability || testScript.metadata.capability.length === 0) {
      const pos = calculatePositionInFormattedJson(formattedJson, 'metadata.capability');
      warnings.push(createValidationError(
        "Metadata sollte mindestens eine Capability enthalten",
        "metadata.capability",
        pos,
        "Capabilities definieren die erforderlichen FHIR-Funktionen"
      ));
    } else {
      testScript.metadata.capability.forEach((cap, index) => {
        const capabilityPath = `metadata.capability[${index}]`;
        
        if (cap.required === undefined && cap.validated === undefined) {
          const pos = calculatePositionInFormattedJson(formattedJson, capabilityPath);
          warnings.push(createValidationError(
            `Capability #${index + 1}: Mindestens eines der Felder 'required' oder 'validated' sollte gesetzt sein`,
            capabilityPath,
            pos,
            "Diese Felder definieren, ob die Capability erforderlich oder validiert ist"
          ));
        }
        
        if (!cap.capabilities) {
          const pos = calculatePositionInFormattedJson(formattedJson, `${capabilityPath}.capabilities`);
          errors.push(createValidationError(
            `Capability #${index + 1}: Das Feld 'capabilities' ist erforderlich`,
            `${capabilityPath}.capabilities`,
            pos,
            "Dieses Feld muss eine URL zu einem CapabilityStatement enthalten"
          ));
        } else if (!cap.capabilities.startsWith('http://') && !cap.capabilities.startsWith('https://')) {
          const pos = calculatePositionInFormattedJson(formattedJson, `${capabilityPath}.capabilities`);
          errors.push(createValidationError(
            `Capability #${index + 1}: Die URL muss eine absolute URL sein`,
            `${capabilityPath}.capabilities`,
            pos,
            `Aktuelle URL: "${cap.capabilities}"\nBeispiel: "http://hl7.org/fhir/CapabilityStatement/example"`
          ));
        }
      });
    }
  }

  // Setup validieren
  if (testScript.setup) {
    if (!testScript.setup.action || testScript.setup.action.length === 0) {
      const pos = calculatePositionInFormattedJson(formattedJson, 'setup.action');
      errors.push(createValidationError(
        "Setup muss mindestens eine Aktion enthalten",
        "setup.action",
        pos,
        "Wenn keine Setup-Aktionen benötigt werden, lassen Sie das gesamte 'setup'-Objekt weg"
      ));
    } else {
      testScript.setup.action.forEach((action, index) => {
        const actionPath = `setup.action[${index}]`;
        const prefix = `Setup Aktion #${index + 1}`;
        const pos = calculatePositionInFormattedJson(formattedJson, actionPath);
        
        // Prüfen, dass nur eine der Aktionen (common, operation, assert) vorhanden ist
        const actionCount = [action.common, action.operation, action.assert].filter(Boolean).length;
        if (actionCount !== 1) {
          errors.push(createValidationError(
            `${prefix}: Muss genau eine der Aktionen (common, operation, assert) enthalten`,
            actionPath,
            pos,
            "Jede Aktion muss genau einen Aktionstyp haben"
          ));
        }
        
        if (action.operation) {
          validateOperation(action.operation, errors, warnings, info, prefix, formattedJson, `${actionPath}.operation`);
        }
        
        if (action.assert) {
          validateAssertion(action.assert, errors, warnings, info, prefix, formattedJson, `${actionPath}.assert`);
        }
      });
    }
  }
  
  // Tests validieren
  if (testScript.test) {
    testScript.test.forEach((test, testIndex) => {
      const testPath = `test[${testIndex}]`;
      const testPrefix = `Test #${testIndex + 1}`;
      
      if (!test.action || test.action.length === 0) {
        const pos = calculatePositionInFormattedJson(formattedJson, `${testPath}.action`);
        errors.push(createValidationError(
          `${testPrefix}: Muss mindestens eine Aktion enthalten`,
          `${testPath}.action`,
          pos,
          "Jeder Test muss mindestens eine Aktion haben, um etwas zu testen"
        ));
      } else {
        test.action.forEach((action, actionIndex) => {
          const actionPath = `${testPath}.action[${actionIndex}]`;
          const prefix = `${testPrefix} Aktion #${actionIndex + 1}`;
          const pos = calculatePositionInFormattedJson(formattedJson, actionPath);
          
          // Prüfen, dass nur eine der Aktionen (common, operation, assert) vorhanden ist
          const actionCount = [action.common, action.operation, action.assert].filter(Boolean).length;
          if (actionCount !== 1) {
            errors.push(createValidationError(
              `${prefix}: Muss genau eine der Aktionen (common, operation, assert) enthalten`,
              actionPath,
              pos,
              "Jede Aktion muss genau einen Aktionstyp haben"
            ));
          }
          
          if (action.operation) {
            validateOperation(action.operation, errors, warnings, info, prefix, formattedJson, `${actionPath}.operation`);
          }
          
          if (action.assert) {
            validateAssertion(action.assert, errors, warnings, info, prefix, formattedJson, `${actionPath}.assert`);
          }
        });
      }
    });
  }
  
  // Teardown validieren
  if (testScript.teardown) {
    if (!testScript.teardown.action || testScript.teardown.action.length === 0) {
      const pos = calculatePositionInFormattedJson(formattedJson, 'teardown.action');
      errors.push(createValidationError(
        "Teardown muss mindestens eine Aktion enthalten",
        "teardown.action",
        pos,
        "Wenn keine Teardown-Aktionen benötigt werden, lassen Sie das gesamte 'teardown'-Objekt weg"
      ));
    } else {
      testScript.teardown.action.forEach((action, index) => {
        const actionPath = `teardown.action[${index}]`;
        const prefix = `Teardown Aktion #${index + 1}`;
        const pos = calculatePositionInFormattedJson(formattedJson, actionPath);
        
        if (action.operation) {
          validateOperation(action.operation, errors, warnings, info, prefix, formattedJson, `${actionPath}.operation`);
        }
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * Validiert eine Operation und fügt eventuelle Fehler zum errors-Array hinzu
 */
function validateOperation(
  operation: Operation, 
  errors: ValidationError[], 
  warnings: ValidationError[],
  info: ValidationError[],
  prefix: string, 
  formattedJson: string,
  operationPath: string
): void {
  const position = calculatePositionInFormattedJson(formattedJson, operationPath);
  
  // URL oder Resource muss vorhanden sein
  if (!operation.url && !operation.resource) {
    errors.push(createValidationError(
      `${prefix}: Weder URL noch Resource angegeben`,
      operationPath,
      position,
      "Eine Operation muss entweder eine URL oder eine Resource haben"
    ));
  }
  
  // Methode validieren
  if (operation.method && !['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(operation.method.toLowerCase())) {
    errors.push(createValidationError(
      `${prefix}: Ungültige HTTP-Methode: ${operation.method}`,
      `${operationPath}.method`,
      position,
      "Erlaubte Methoden sind: get, post, put, delete, patch, head, options"
    ));
  }
  
  // Validierung für fehlende IDs in Operations
  if (!operation.requestId && operation.method === "post") {
    warnings.push(createValidationError(
      `${prefix}: POST-Operation ohne requestId`,
      `${operationPath}.requestId`,
      position,
      "Es wird empfohlen, eine requestId für POST-Operationen anzugeben"
    ));
  }

  // Prüfen, dass entweder sourceId oder (targetId oder params oder url) vorhanden ist
  if (!operation.sourceId && !operation.targetId && !operation.params && !operation.url) {
    errors.push(createValidationError(
      `${prefix}: Operation muss entweder sourceId oder (targetId oder params oder url) enthalten`,
      operationPath,
      position,
      "Eine Operation braucht eine Quelle oder ein Ziel"
    ));
  }

  // Zusätzliche Informationen
  if (operation.description) {
    info.push(createValidationError(
      `${prefix}: Beschreibung vorhanden`,
      `${operationPath}.description`,
      position,
      operation.description
    ));
  }
}

/**
 * Validiert eine Assertion und fügt eventuelle Fehler zum errors-Array hinzu
 */
function validateAssertion(
  assertion: Assertion, 
  errors: ValidationError[], 
  warnings: ValidationError[],
  info: ValidationError[],
  prefix: string,
  formattedJson: string,
  assertPath: string
): void {
  const position = calculatePositionInFormattedJson(formattedJson, assertPath);
  
  // Operator validieren
  if (assertion.operator && !['equals', 'notEquals', 'in', 'notIn', 'greaterThan', 'lessThan', 'empty', 'notEmpty', 'contains', 'notContains', 'eval', 'manualEval'].includes(assertion.operator)) {
    errors.push(createValidationError(
      `${prefix}: Ungültiger Operator: ${assertion.operator}`,
      `${assertPath}.operator`,
      position,
      "Erlaubte Operatoren sind: equals, notEquals, in, notIn, greaterThan, lessThan, empty, notEmpty, contains, notContains, eval, manualEval"
    ));
  }
  
  // CompareToSource validieren
  if (assertion.compareToSourceId && !assertion.compareToSourceExpression && !assertion.compareToSourcePath) {
    errors.push(createValidationError(
      `${prefix}: Bei compareToSourceId muss entweder compareToSourceExpression oder compareToSourcePath angegeben werden`,
      `${assertPath}.compareToSourceId`,
      position,
      "Wenn Sie eine Quelle zum Vergleich angeben, müssen Sie auch den Pfad oder Ausdruck angeben"
    ));
  }

  // Prüfen, dass response und responseCode leer sind, wenn direction = 'request'
  if (assertion.direction === 'request' && (assertion.response || assertion.responseCode)) {
    errors.push(createValidationError(
      `${prefix}: Bei direction = 'request' müssen response und responseCode leer sein`,
      `${assertPath}.direction`,
      position,
      "Request-Assertions können keine Response-Felder haben"
    ));
  }

  // Zusätzliche Informationen
  if (assertion.description) {
    info.push(createValidationError(
      `${prefix}: Beschreibung vorhanden`,
      `${assertPath}.description`,
      position,
      assertion.description
    ));
  }

  // Warnungen für fehlende Validierungen
  if (!assertion.operator && !assertion.description) {
    warnings.push(createValidationError(
      `${prefix}: Keine Validierung oder Beschreibung angegeben`,
      assertPath,
      position,
      "Es wird empfohlen, entweder einen Operator oder eine Beschreibung anzugeben"
    ));
  }
} 