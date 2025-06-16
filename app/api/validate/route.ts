import { NextResponse } from 'next/server'

interface ValidationIssue {
  message: string;
  location: string[];
  line?: number;
  column?: number;
}

function findJsonPosition(json: any, path: string[]): { line: number; column: number } | undefined {
  const jsonString = JSON.stringify(json, null, 2);
  const lines = jsonString.split('\n');
  
  let currentPath: string[] = [];
  let currentLine = 0;
  let currentColumn = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Prüfe auf Objekt- oder Array-Öffnung
    if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[')) {
      const keyMatch = line.match(/"([^"]+)":/);
      if (keyMatch) {
        currentPath.push(keyMatch[1]);
      }
    }
    
    // Prüfe auf Objekt- oder Array-Schließung
    if (trimmedLine === '}' || trimmedLine === ']') {
      currentPath.pop();
    }
    
    // Prüfe ob wir am Zielpfad sind
    if (JSON.stringify(currentPath) === JSON.stringify(path)) {
      return {
        line: i + 1,
        column: line.indexOf(':') + 1
      };
    }
  }
  
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validiere das TestScript gegen die FHIR-Spezifikation
    const validationResult = validateTestScript(body)
    
    if (!validationResult.valid) {
      return NextResponse.json({
        resourceType: 'OperationOutcome',
        issue: validationResult.errors.map(error => ({
          severity: 'error',
          code: 'structure',
          details: {
            text: error.message
          },
          location: error.location,
          line: error.line,
          column: error.column
        })).concat(validationResult.warnings.map(warning => ({
          severity: 'warning',
          code: 'structure',
          details: {
            text: warning.message
          },
          location: warning.location,
          line: warning.line,
          column: warning.column
        })))
      })
    }

    // Wenn die lokale Validierung erfolgreich war, versuche die FHIR-Server-Validierung
    const response = await fetch('https://hapi.fhir.org/baseR5/TestScript/$validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify({
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'resource',
            resource: body
          }
        ]
      })
    })

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Validierungsfehler:', error)
    return NextResponse.json(
      { 
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'processing',
          details: {
            text: 'Fehler bei der Validierung: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler')
          }
        }]
      },
      { status: 500 }
    )
  }
}

function validateTestScript(testScript: any) {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  // Grundlegende Prüfungen
  if (!testScript.resourceType || testScript.resourceType !== 'TestScript') {
    const position = findJsonPosition(testScript, ['resourceType']);
    errors.push({
      message: 'ResourceType muss "TestScript" sein',
      location: ['resourceType'],
      line: position?.line,
      column: position?.column
    })
  }

  if (!testScript.name) {
    const position = findJsonPosition(testScript, ['name']);
    errors.push({
      message: 'TestScript muss einen Namen haben',
      location: ['name'],
      line: position?.line,
      column: position?.column
    })
  }

  if (!testScript.status) {
    const position = findJsonPosition(testScript, ['status']);
    errors.push({
      message: 'TestScript muss einen Status haben',
      location: ['status'],
      line: position?.line,
      column: position?.column
    })
  } else if (!['draft', 'active', 'retired', 'unknown'].includes(testScript.status)) {
    const position = findJsonPosition(testScript, ['status']);
    errors.push({
      message: 'Status muss einer der folgenden Werte sein: draft, active, retired, unknown',
      location: ['status'],
      line: position?.line,
      column: position?.column
    })
  }

  // Metadata Validierung
  if (testScript.metadata) {
    if (!testScript.metadata.capability || testScript.metadata.capability.length === 0) {
      const position = findJsonPosition(testScript, ['metadata', 'capability']);
      warnings.push({
        message: 'Metadata sollte mindestens eine Capability enthalten',
        location: ['metadata', 'capability'],
        line: position?.line,
        column: position?.column
      })
    } else {
      testScript.metadata.capability.forEach((cap: any, index: number) => {
        if (!cap.capabilities) {
          const position = findJsonPosition(testScript, ['metadata', 'capability', index.toString(), 'capabilities']);
          errors.push({
            message: `Capability #${index + 1}: Das Feld 'capabilities' ist erforderlich`,
            location: ['metadata', 'capability', index.toString(), 'capabilities'],
            line: position?.line,
            column: position?.column
          })
        }
        if (cap.required === undefined && cap.validated === undefined) {
          const position = findJsonPosition(testScript, ['metadata', 'capability', index.toString()]);
          warnings.push({
            message: `Capability #${index + 1}: Mindestens eines der Felder 'required' oder 'validated' sollte gesetzt sein`,
            location: ['metadata', 'capability', index.toString()],
            line: position?.line,
            column: position?.column
          })
        }
      })
    }
  }

  // Test Validierung
  if (!testScript.test || !Array.isArray(testScript.test)) {
    const position = findJsonPosition(testScript, ['test']);
    errors.push({
      message: 'TestScript muss mindestens einen Test enthalten',
      location: ['test'],
      line: position?.line,
      column: position?.column
    })
  } else {
    testScript.test.forEach((test: any, index: number) => {
      if (!test.name) {
        const position = findJsonPosition(testScript, ['test', index.toString(), 'name']);
        errors.push({
          message: `Test #${index + 1}: Name ist erforderlich`,
          location: ['test', index.toString(), 'name'],
          line: position?.line,
          column: position?.column
        })
      }
      if (!test.action || !Array.isArray(test.action)) {
        const position = findJsonPosition(testScript, ['test', index.toString(), 'action']);
        warnings.push({
          message: `Test #${index + 1}: Keine Aktionen definiert`,
          location: ['test', index.toString(), 'action'],
          line: position?.line,
          column: position?.column
        })
      } else {
        test.action.forEach((action: any, actionIndex: number) => {
          if (action.operation) {
            validateOperation(action.operation, errors, warnings, ['test', index.toString(), 'action', actionIndex.toString(), 'operation'], testScript)
          }
          if (action.assert) {
            validateAssertion(action.assert, errors, warnings, ['test', index.toString(), 'action', actionIndex.toString(), 'assert'], testScript)
          }
        })
      }
    })
  }

  // Setup und Teardown Validierung
  if (!testScript.setup || !testScript.setup.action || !Array.isArray(testScript.setup.action)) {
    const position = findJsonPosition(testScript, ['setup', 'action']);
    warnings.push({
      message: 'Keine Setup-Aktionen definiert',
      location: ['setup', 'action'],
      line: position?.line,
      column: position?.column
    })
  } else {
    testScript.setup.action.forEach((action: any, index: number) => {
      if (action.operation) {
        validateOperation(action.operation, errors, warnings, ['setup', 'action', index.toString(), 'operation'], testScript)
      }
    })
  }

  if (!testScript.teardown || !testScript.teardown.action || !Array.isArray(testScript.teardown.action)) {
    const position = findJsonPosition(testScript, ['teardown', 'action']);
    warnings.push({
      message: 'Keine Teardown-Aktionen definiert',
      location: ['teardown', 'action'],
      line: position?.line,
      column: position?.column
    })
  } else {
    testScript.teardown.action.forEach((action: any, index: number) => {
      if (action.operation) {
        validateOperation(action.operation, errors, warnings, ['teardown', 'action', index.toString(), 'operation'], testScript)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

function validateOperation(operation: any, errors: ValidationIssue[], warnings: ValidationIssue[], location: string[], testScript: any) {
  if (!operation.type) {
    const position = findJsonPosition(testScript, location.concat(['type']));
    errors.push({
      message: 'Operation muss einen Typ haben',
      location: [...location, 'type'],
      line: position?.line,
      column: position?.column
    })
  }
  
  if (!operation.resource) {
    const position = findJsonPosition(testScript, location.concat(['resource']));
    errors.push({
      message: 'Operation muss eine Resource haben',
      location: [...location, 'resource'],
      line: position?.line,
      column: position?.column
    })
  }

  if (operation.description) {
    const position = findJsonPosition(testScript, location.concat(['description']));
    warnings.push({
      message: 'Beschreibung vorhanden',
      location: [...location, 'description'],
      line: position?.line,
      column: position?.column
    })
  }
}

function validateAssertion(assertion: any, errors: ValidationIssue[], warnings: ValidationIssue[], location: string[], testScript: any) {
  if (!assertion.direction) {
    const position = findJsonPosition(testScript, location.concat(['direction']));
    errors.push({
      message: 'Assertion muss eine Richtung haben',
      location: [...location, 'direction'],
      line: position?.line,
      column: position?.column
    })
  }

  if (!assertion.operator) {
    const position = findJsonPosition(testScript, location.concat(['operator']));
    errors.push({
      message: 'Assertion muss einen Operator haben',
      location: [...location, 'operator'],
      line: position?.line,
      column: position?.column
    })
  }

  if (assertion.description) {
    const position = findJsonPosition(testScript, location.concat(['description']));
    warnings.push({
      message: 'Beschreibung vorhanden',
      location: [...location, 'description'],
      line: position?.line,
      column: position?.column
    })
  }
} 