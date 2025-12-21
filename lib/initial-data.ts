import type { TestScript } from "@/types/fhir-enhanced"

/**
 * Minimales, aber vollständig valides TestScript basierend auf FHIR R5 JSON Schema
 * Erfüllt alle FHIR-Constraints und verwendet nur erforderliche Felder
 * 
 * Basiert auf: http://hl7.org/fhir/json-schema/TestScript
 */
export const initialTestScript: TestScript = {
  resourceType: "TestScript",
  name: "MinimalTestScript",
  status: "draft",
  url: "http://example.org/fhir/TestScript/MinimalTestScript",
  title: "Minimales TestScript",
  description: "Ein minimales, aber valides FHIR TestScript für Validierungszwecke.",
  date: "2024-01-15T10:00:00.000Z",
  publisher: "Tinker Tool - FHIR TestScript Builder",
  fixture: [
    {
      id: "patient-fixture",
      autocreate: false,
      autodelete: false,
      resource: {
        reference: "Patient/example"
      }
    }
  ],
  destination: [
    {
      index: 1,
      profile: {
        system: "http://hl7.org/fhir/testscript-profile-destination-types",
        code: "FHIR-Server"
      }
    }
  ],
  metadata: {
    capability: [
      {
        capabilities: "http://hl7.org/fhir/CapabilityStatement/base",
        required: true,
        validated: false,
        description: "Basis FHIR Server Capabilities"
      }
    ]
  },
  test: [
    {
      id: "minimal-test-1",
      name: "Patient Ressource laden",
      description: "Validiert, dass der Server die Beispiel-Patientenressource bereitstellt.",
      action: [
        {
          id: "action-read-patient",
          operation: {
            label: "Patient laden",
            description: "Führt eine READ-Operation für den Beispiel-Patienten aus.",
            type: {
              system: "http://hl7.org/fhir/restful-interaction",
              code: "read"
            },
            method: "get",
            resource: "Patient",
            sourceId: "patient-fixture",
            targetId: "1",
            url: "/Patient/example",
            params: "_format=json",
            encodeRequestUrl: true,
            requestHeader: [
              {
                field: "Accept",
                value: "application/fhir+json"
              }
            ]
          }
        }
      ]
    }
  ]
}
