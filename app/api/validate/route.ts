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

function calculateJsonPosition(jsonString: string, path: string[]): { line: number; column: number } {
  const lines = jsonString.split('\n');
  
  // Einfache Heuristik: Suche nach dem Pfad in der JSON-Struktur
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Suche nach dem letzten Element im Pfad
    if (path.length > 0) {
      const lastPathElement = path[path.length - 1];
      
      // Bereinige Array-Indizes und andere FHIR-spezifische Notationen
      const cleanPath = lastPathElement
        .replace(/Parameters\.parameter\[0\]\.resource\./, "")
        .replace(/\/\*TestScript\/null\*\/\./, "")
        .replace(/\[\d+\]/g, "");
      
      if (line.includes(`"${cleanPath}"`)) {
        return {
          line: i + 1,
          column: line.indexOf(`"${cleanPath}"`) + 1
        };
      }
    }
  }
  
  return { line: 1, column: 1 };
}

function extractLineAndColumn(issue: FhirIssue, formattedJson: string): { line: number; column: number } {
  let line = 1;
  let column = 1;

  // Versuche zuerst die Extensions zu lesen
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
    
    // Falls die Extensions valide Werte haben, benutze sie
    if (line > 1 || column > 1) {
      return { line, column };
    }
  }

  // Fallback: Berechne Position basierend auf dem location-Pfad
  if (issue.location && issue.location.length > 0 && formattedJson) {
    const calculatedPosition = calculateJsonPosition(formattedJson, issue.location);
    return calculatedPosition;
  }

  return { line: 1, column: 1 };
}

function enhanceFhirResponse(fhirResponse: FhirOperationOutcome, originalJson: string): FhirOperationOutcome {
  if (!fhirResponse.issue) {
    return fhirResponse;
  }

  // Formatiere das ursprüngliche JSON für bessere Positionsberechnung
  const formattedJson = JSON.stringify(JSON.parse(originalJson), null, 2);

  const enhancedIssues = fhirResponse.issue.map(issue => {
    const { line, column } = extractLineAndColumn(issue, formattedJson);
    
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
    const originalJsonString = JSON.stringify(body);
    
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

    // Sende formatiertes JSON an FHIR-Server für bessere Zeilennummern
    const formattedTestScript = JSON.stringify(body, null, 2);
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
      }, null, 2) // Sende formatiertes JSON für bessere Positionierung
    });

    if (!response.ok) {
      throw new Error(`FHIR-Server-Fehler: ${response.status} ${response.statusText}`);
    }

    const fhirResponse: FhirOperationOutcome = await response.json();
    
    // Erweitere die FHIR-Response mit besseren Fehlermeldungen und korrekten Zeilennummern
    const enhancedResponse = enhanceFhirResponse(fhirResponse, formattedTestScript);
    
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
      line: 2,
      column: 3
    });
  }

  if (!testScript.name || typeof testScript.name !== 'string') {
    errors.push({
      message: 'TestScript muss einen Namen (String) haben',
      location: ['name'],
      line: 3,
      column: 3
    });
  } else if (!testScript.name.match(/^[A-Z]([A-Za-z0-9_]){1,254}$/)) {
    errors.push({
      message: 'Name muss mit einem Großbuchstaben beginnen und darf nur Buchstaben, Zahlen und Unterstriche enthalten',
      location: ['name'],
      line: 3,
      column: 3
    });
  }

  if (!testScript.status) {
    errors.push({
      message: 'TestScript muss einen Status haben',
      location: ['status'],
      line: 4,
      column: 3
    });
  } else if (!['draft', 'active', 'retired', 'unknown'].includes(testScript.status)) {
    errors.push({
      message: 'Status muss einer der folgenden Werte sein: draft, active, retired, unknown',
      location: ['status'],
      line: 4,
      column: 3
    });
  }

  // Prüfe Metadata - muss vorhanden sein und gültige capabilities haben
  if (!testScript.metadata) {
    errors.push({
      message: 'TestScript muss Metadaten enthalten',
      location: ['metadata'],
      line: 5,
      column: 3
    });
  } else {
    if (!testScript.metadata.capability || !Array.isArray(testScript.metadata.capability) || testScript.metadata.capability.length === 0) {
      errors.push({
        message: 'Metadaten müssen mindestens eine Capability enthalten',
        location: ['metadata', 'capability'],
        line: 6,
        column: 5
      });
    } else {
      testScript.metadata.capability.forEach((cap: any, index: number) => {
        if (!cap.capabilities) {
          errors.push({
            message: `Capability ${index + 1}: Das 'capabilities'-Feld ist erforderlich`,
            location: ['metadata', 'capability', index.toString(), 'capabilities'],
            line: 7 + index * 3,
            column: 7
          });
        } else if (!cap.capabilities.startsWith('http://') && !cap.capabilities.startsWith('https://')) {
          errors.push({
            message: `Capability ${index + 1}: capabilities muss eine absolute URL sein`,
            location: ['metadata', 'capability', index.toString(), 'capabilities'],
            line: 7 + index * 3,
            column: 7
          });
        }
        
        if (cap.required === undefined && cap.validated === undefined) {
          errors.push({
            message: `Capability ${index + 1}: Mindestens 'required' oder 'validated' muss gesetzt sein`,
            location: ['metadata', 'capability', index.toString()],
            line: 7 + index * 3,
            column: 7
          });
        }
      });
    }
  }

  // Prüfe, ob leere Arrays vermieden werden
  if (testScript.setup && Array.isArray(testScript.setup.action) && testScript.setup.action.length === 0) {
    errors.push({
      message: 'Setup-Aktionen sind leer - entfernen Sie die setup-Eigenschaft oder fügen Sie Aktionen hinzu',
      location: ['setup', 'action'],
      line: 15,
      column: 5
    });
  }

  if (testScript.teardown && Array.isArray(testScript.teardown.action) && testScript.teardown.action.length === 0) {
    errors.push({
      message: 'Teardown-Aktionen sind leer - entfernen Sie die teardown-Eigenschaft oder fügen Sie Aktionen hinzu',
      location: ['teardown', 'action'],
      line: 25,
      column: 5
    });
  }

  if (testScript.test && Array.isArray(testScript.test)) {
    testScript.test.forEach((test: any, index: number) => {
      if (!test.action || !Array.isArray(test.action) || test.action.length === 0) {
        errors.push({
          message: `Test ${index + 1}: Muss mindestens eine Aktion enthalten`,
          location: ['test', index.toString(), 'action'],
          line: 20 + index * 5,
          column: 7
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 