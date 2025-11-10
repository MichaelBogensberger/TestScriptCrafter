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
  publisher: "FHIR TestScript Crafter",
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
      name: "Minimal Test",
      description: "Ein minimaler Testfall",
      action: [
        {
          operation: {
            type: {
              system: "http://hl7.org/fhir/restful-interaction",
              code: "read"
            },
            resource: "Patient",
            url: "/Patient/example",
            encodeRequestUrl: true
          },
          assert: {
            description: "Prüfe, dass die Antwort erfolgreich ist",
            response: "okay",
            warningOnly: false,
            stopTestOnFail: true
          }
        }
      ]
    }
  ]
}
