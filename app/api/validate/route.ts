import { NextResponse } from 'next/server'
import type {
  Extension,
  OperationOutcome,
  OperationOutcomeIssue,
  Parameters,
  TestScript,
  TestScriptMetadataCapability,
  TestScriptTest,
} from "@/types/fhir-enhanced"
import { getFhirVersionConfig, parseFhirVersion } from "@/types/fhir-config"

interface StructureIssue {
  message: string;
  location: string[];
  line?: number;
  column?: number;
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

function extractLineAndColumn(issue: OperationOutcomeIssue, formattedJson: string): { line: number; column: number } {
  let line = 1;
  let column = 1;

  // Versuche zuerst die Extensions zu lesen
  if (issue.extension) {
    const lineExtension = issue.extension.find((ext: Extension) => 
      ext.url === "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line"
    );
    const colExtension = issue.extension.find((ext: Extension) => 
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

function enhanceFhirResponse(fhirResponse: OperationOutcome, originalJson: string): OperationOutcome {
  if (!fhirResponse.issue) {
    return fhirResponse;
  }

  // Formatiere das ursprüngliche JSON für bessere Positionsberechnung
  const formattedJson = JSON.stringify(JSON.parse(originalJson), null, 2);

  const enhancedIssues = fhirResponse.issue.map(issue => {
    const { line, column } = extractLineAndColumn(issue, formattedJson);
    
    // Verbessere die Fehlermeldung
    let message = issue.diagnostics || issue.details?.text || "Unbekannter Validierungsfehler";
    
    // Note: Keeping error messages from FHIR server in original language
    // for consistency with FHIR specification

    const updatedExtensions: Extension[] = [
      ...(issue.extension ?? []),
      {
        url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line",
        valueInteger: line,
      },
      {
        url: "http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-col",
        valueInteger: column,
      },
    ];

    return {
      ...issue,
      diagnostics: message,
      extension: updatedExtensions,
    };
  });

  return {
    ...fhirResponse,
    issue: enhancedIssues
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestScript;
    
    // Bestimme FHIR Version aus Header
    const versionHeader = request.headers.get('X-FHIR-Version');
    const fhirVersion = parseFhirVersion(versionHeader || undefined);
    const fhirConfig = getFhirVersionConfig(fhirVersion);
    
    // Prüfe, ob es sich um einen Import handelt (lockere Validierung)
    const isImportMode = request.headers.get('X-Validation-Mode') === 'import';
    
    // Validiere grundlegende TestScript-Struktur
    const basicValidation = validateBasicStructure(body, isImportMode);
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

    // Führe erweiterte lokale Validierung durch
    const extendedValidation = validateExtendedStructure(body);
    
    // In import mode: Skip external validation and return success
    if (isImportMode) {
      return NextResponse.json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'information',
          code: 'informational',
          diagnostics: 'TestScript imported successfully. External FHIR validation was skipped.',
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
      });
    }
    
    // In normal mode: If local validation is successful, try external validation
    if (extendedValidation.valid) {
      try {
        const formattedTestScript = JSON.stringify(body, null, 2);
        const fhirServerUrl = fhirConfig.validationEndpoint;
        
        console.log(`Using ${fhirVersion} FHIR Server for validation: ${fhirServerUrl}`);
        
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
          } as Parameters, null, 2),
          signal: AbortSignal.timeout(10000) // 10 Sekunden Timeout
        });

        if (response.ok) {
          const fhirResponse = (await response.json()) as OperationOutcome;
          const enhancedResponse = enhanceFhirResponse(fhirResponse, formattedTestScript);
          return NextResponse.json(enhancedResponse);
        }
      } catch (fetchError) {
        console.warn('External FHIR validation failed, using local validation:', fetchError);
      }
    }
    
    // Fallback: Use local validation
    return NextResponse.json({
      resourceType: 'OperationOutcome',
      issue: extendedValidation.valid ? [{
        severity: 'information',
        code: 'informational',
        diagnostics: 'TestScript is structurally correct. External FHIR validation not available.',
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
      }] : extendedValidation.errors.map(error => ({
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
    
  } catch (error: unknown) {
    console.error('Validation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        diagnostics: `Local validation failed: ${errorMessage}`,
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
    });
  }
}

function validateBasicStructure(testScript: Partial<TestScript>, isImportMode = false) {
  const errors: StructureIssue[] = [];

  // Basic structure validation - only absolutely necessary fields
  if (!testScript.resourceType || testScript.resourceType !== 'TestScript') {
    errors.push({
      message: 'ResourceType must be "TestScript"',
      location: ['resourceType'],
      line: 2,
      column: 3
    });
  }

  if (!testScript.status) {
    errors.push({
      message: 'TestScript must have a status',
      location: ['status'],
      line: 4,
      column: 3
    });
  } else if (!['draft', 'active', 'retired', 'unknown'].includes(testScript.status)) {
    errors.push({
      message: 'Status must be one of: draft, active, retired, unknown',
      location: ['status'],
      line: 4,
      column: 3
    });
  }

  // In normal mode (not import): Extended validation
  if (!isImportMode) {
    // Name validation (only in edit mode)
    if (!testScript.name || typeof testScript.name !== 'string' || testScript.name.trim() === '') {
      errors.push({
        message: 'TestScript must have a name (string)',
        location: ['name'],
        line: 3,
        column: 3
      });
    }

    // Metadata validation (only if present)
    if (testScript.metadata && testScript.metadata.capability && Array.isArray(testScript.metadata.capability)) {
      testScript.metadata.capability.forEach((rawCapability, index: number) => {
        const capability = rawCapability as Partial<TestScriptMetadataCapability>;
        if (!capability.capabilities) {
          errors.push({
            message: `Capability ${index + 1}: The 'capabilities' field is required`,
            location: ['metadata', 'capability', index.toString(), 'capabilities'],
            line: 7 + index * 3,
            column: 7
          });
        } else if (
          typeof capability.capabilities === "string" &&
          !capability.capabilities.startsWith('http://') &&
          !capability.capabilities.startsWith('https://')
        ) {
          errors.push({
            message: `Capability ${index + 1}: capabilities must be an absolute URL`,
            location: ['metadata', 'capability', index.toString(), 'capabilities'],
            line: 7 + index * 3,
            column: 7
          });
        }
        
        const hasRequiredFlag = typeof capability.required === 'boolean';
        const hasValidatedFlag = typeof capability.validated === 'boolean';

        if (!hasRequiredFlag && !hasValidatedFlag) {
          errors.push({
            message: `Capability ${index + 1}: At least 'required' or 'validated' must be set`,
            location: ['metadata', 'capability', index.toString()],
            line: 7 + index * 3,
            column: 7
          });
        }
      });
    }

    // Check empty arrays
    if (testScript.setup && Array.isArray(testScript.setup.action) && testScript.setup.action.length === 0) {
      errors.push({
        message: 'Setup actions are empty - remove the setup property or add actions',
        location: ['setup', 'action'],
        line: 15,
        column: 5
      });
    }

    if (testScript.teardown && Array.isArray(testScript.teardown.action) && testScript.teardown.action.length === 0) {
      errors.push({
        message: 'Teardown actions are empty - remove the teardown property or add actions',
        location: ['teardown', 'action'],
        line: 25,
        column: 5
      });
    }

    if (Array.isArray(testScript.test)) {
      testScript.test.forEach((rawTestCase, index: number) => {
        const testCase = rawTestCase as Partial<TestScriptTest>;
        if (!Array.isArray(testCase.action) || testCase.action.length === 0) {
          errors.push({
            message: `Test ${index + 1}: Must contain at least one action`,
            location: ['test', index.toString(), 'action'],
            line: 20 + index * 5,
            column: 7
          });
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateExtendedStructure(testScript: TestScript) {
  const errors: StructureIssue[] = [];

  // Extended validation for test actions
  if (testScript.test && Array.isArray(testScript.test)) {
    testScript.test.forEach((test, testIndex) => {
      if (test.action && Array.isArray(test.action)) {
        test.action.forEach((action, actionIndex) => {
          // Check FHIR constraint tst-2: Action may only have Operation OR Assert, not both
          if (action.operation && action.assert) {
            errors.push({
              message: `Test ${testIndex + 1}, Action ${actionIndex + 1}: An action may only contain an operation or an assertion, not both (FHIR constraint tst-2)`,
              location: ['test', testIndex.toString(), 'action', actionIndex.toString()],
              line: 30 + testIndex * 10 + actionIndex * 2,
              column: 9
            });
          }

          // Check that at least Operation or Assert is present
          if (!action.operation && !action.assert) {
            errors.push({
              message: `Test ${testIndex + 1}, Action ${actionIndex + 1}: An action must contain either an operation or an assertion`,
              location: ['test', testIndex.toString(), 'action', actionIndex.toString()],
              line: 30 + testIndex * 10 + actionIndex * 2,
              column: 9
            });
          }

          // Validate Operation if present
          if (action.operation) {
            if (!action.operation.type?.code) {
              errors.push({
                message: `Test ${testIndex + 1}, Action ${actionIndex + 1}: Operation requires a type code`,
                location: ['test', testIndex.toString(), 'action', actionIndex.toString(), 'operation', 'type', 'code'],
                line: 32 + testIndex * 10 + actionIndex * 2,
                column: 13
              });
            }

            if (!action.operation.resource) {
              errors.push({
                message: `Test ${testIndex + 1}, Action ${actionIndex + 1}: Operation requires a resource specification`,
                location: ['test', testIndex.toString(), 'action', actionIndex.toString(), 'operation', 'resource'],
                line: 34 + testIndex * 10 + actionIndex * 2,
                column: 13
              });
            }
          }

          // Validate Assertion if present
          if (action.assert) {
            if (!action.assert.description) {
              errors.push({
                message: `Test ${testIndex + 1}, Action ${actionIndex + 1}: Assertion requires a description`,
                location: ['test', testIndex.toString(), 'action', actionIndex.toString(), 'assert', 'description'],
                line: 36 + testIndex * 10 + actionIndex * 2,
                column: 13
              });
            }
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 