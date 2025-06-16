import { NextResponse } from 'next/server'

interface ValidationIssue {
  message: string;
  location: string[];
  line?: number;
  column?: number;
}

interface FhirExtension {
  url: string;
  valueInteger?: number;
  valueString?: string;
}

interface FhirIssue {
  extension?: FhirExtension[];
  severity: string;
  code: string;
  details?: {
    text?: string;
    coding?: any[];
  };
  diagnostics?: string;
  location?: string[];
}

interface FhirOperationOutcome {
  resourceType: string;
  issue: FhirIssue[];
}

function extractLineAndColumn(issue: FhirIssue): { line: number; column: number } {
  let line = 1;
  let column = 1;

  if (issue.extension) {
    const lineExtension = issue.extension.find(ext => 
      ext.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line"
    );
    const colExtension = issue.extension.find(ext => 
      ext.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col"
    );

    if (lineExtension?.valueInteger) {
      line = lineExtension.valueInteger;
    }
    if (colExtension?.valueInteger) {
      column = colExtension.valueInteger;
    }
  }

  return { line, column };
}

function enhanceFhirResponse(fhirResponse: FhirOperationOutcome): FhirOperationOutcome {
  if (!fhirResponse.issue) {
    return fhirResponse;
  }

  const enhancedIssues = fhirResponse.issue.map(issue => {
    const { line, column } = extractLineAndColumn(issue);
    
    // Verbessere die Fehlermeldung
    let message = issue.diagnostics || issue.details?.text || "Unbekannter Validierungsfehler";
    
    // Deutsche Übersetzungen für häufige FHIR-Validierungsfehler
    const translations: { [key: string]: string } = {
      "Array cannot be empty - the property should not be present if it has no values": 
        "Leeres Array - Entfernen Sie die Eigenschaft, wenn keine Werte vorhanden sind",
      "Canonical URLs must be absolute URLs if they are not fragment references": 
        "Canonical URLs müssen absolute URLs sein, falls es sich nicht um Fragment-Referenzen handelt"
    };

    // Übersetze häufige Muster
    Object.entries(translations).forEach(([english, german]) => {
      if (message.includes(english)) {
        message = message.replace(english, german);
      }
    });

    // Übersetze "minimum required" Muster
    message = message.replace(
      /minimum required = (\d+), but only found (\d+)/g,
      "Mindestens $1 erforderlich, aber nur $2 gefunden"
    );

    return {
      ...issue,
      // Erweitere das Issue mit den deutschen Übersetzungen
      diagnostics: message,
      // Stelle sicher, dass Extensions beibehalten werden
      extension: [
        ...(issue.extension || []),
        {
          url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line",
          valueInteger: line
        },
        {
          url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col", 
          valueInteger: column
        }
      ]
    };
  });

  return {
    ...fhirResponse,
    issue: enhancedIssues
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validiere grundlegende TestScript-Struktur
    const basicValidation = validateBasicStructure(body);
    if (!basicValidation.valid) {
      return NextResponse.json({
        resourceType: 'OperationOutcome',
        issue: basicValidation.errors.map(error => ({
          severity: 'error',
          code: 'structure',
          diagnostics: error.message,
          location: error.location,
          extension: [
            {
              url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line",
              valueInteger: error.line || 1
            },
            {
              url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col",
              valueInteger: error.column || 1
            }
          ]
        }))
      });
    }

    // Sende an FHIR-Server für vollständige Validierung
    const fhirServerUrl = 'https://hapi.fhir.org/baseR5/TestScript/$validate';
    
    const response = await fetch(fhirServerUrl, {
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
    });

    if (!response.ok) {
      throw new Error(`FHIR-Server-Fehler: ${response.status} ${response.statusText}`);
    }

    const fhirResponse: FhirOperationOutcome = await response.json();
    
    // Erweitere die FHIR-Response mit besseren Fehlermeldungen
    const enhancedResponse = enhanceFhirResponse(fhirResponse);
    
    return NextResponse.json(enhancedResponse);
    
  } catch (error) {
    console.error('Validierungsfehler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    
    return NextResponse.json(
      { 
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: `Fehler bei der Validierung: ${errorMessage}`,
          extension: [
            {
              url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line",
              valueInteger: 1
            },
            {
              url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col",
              valueInteger: 1
            }
          ]
        }]
      },
      { status: 500 }
    );
  }
}

function validateBasicStructure(testScript: any) {
  const errors: ValidationIssue[] = [];

  // Grundlegende Strukturvalidierung
  if (!testScript.resourceType || testScript.resourceType !== 'TestScript') {
    errors.push({
      message: 'ResourceType muss "TestScript" sein',
      location: ['resourceType'],
      line: 1,
      column: 1
    });
  }

  if (!testScript.name || typeof testScript.name !== 'string') {
    errors.push({
      message: 'TestScript muss einen Namen (String) haben',
      location: ['name'],
      line: 1,
      column: 1
    });
  }

  if (!testScript.status) {
    errors.push({
      message: 'TestScript muss einen Status haben',
      location: ['status'],
      line: 1,
      column: 1
    });
  } else if (!['draft', 'active', 'retired', 'unknown'].includes(testScript.status)) {
    errors.push({
      message: 'Status muss einer der folgenden Werte sein: draft, active, retired, unknown',
      location: ['status'],
      line: 1,
      column: 1
    });
  }

  // Prüfe, ob leere Arrays vermieden werden
  if (testScript.setup && Array.isArray(testScript.setup.action) && testScript.setup.action.length === 0) {
    errors.push({
      message: 'Setup-Aktionen sind leer - entfernen Sie die setup-Eigenschaft oder fügen Sie Aktionen hinzu',
      location: ['setup', 'action'],
      line: 1,
      column: 1
    });
  }

  if (testScript.teardown && Array.isArray(testScript.teardown.action) && testScript.teardown.action.length === 0) {
    errors.push({
      message: 'Teardown-Aktionen sind leer - entfernen Sie die teardown-Eigenschaft oder fügen Sie Aktionen hinzu',
      location: ['teardown', 'action'],
      line: 1,
      column: 1
    });
  }

  if (testScript.test && Array.isArray(testScript.test)) {
    testScript.test.forEach((test: any, index: number) => {
      if (Array.isArray(test.action) && test.action.length === 0) {
        errors.push({
          message: `Test ${index + 1}: Test-Aktionen sind leer - fügen Sie Aktionen hinzu oder entfernen Sie den Test`,
          location: ['test', index.toString(), 'action'],
          line: 1,
          column: 1
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 