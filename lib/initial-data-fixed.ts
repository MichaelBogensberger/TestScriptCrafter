import type { TestScript } from "@/types/fhir-enhanced"

/**
 * Minimales, aber vollständig valides TestScript basierend auf FHIR R5 JSON Schema
 * Erfüllt alle FHIR-Constraints und verwendet nur erforderliche Felder
 * 
 * Basiert auf: http://hl7.org/fhir/json-schema/TestScript
 */
export const initialTestScript: TestScript = {
  // Erforderlich: resourceType muss "TestScript" sein
  resourceType: "TestScript",
  
  // Erforderlich: name (String, muss mit Großbuchstaben beginnen)
  name: "MinimalTestScript",
  
  // Erforderlich: status (draft | active | retired | unknown)
  status: "draft",
  
  // Erforderlich: url (canonical identifier)
  url: "http://example.org/fhir/TestScript/MinimalTestScript",
  
  // Optional aber empfohlen: title
  title: "Minimales TestScript",
  
  // Optional aber empfohlen: description
  description: "Ein minimales, aber valides FHIR TestScript für Validierungszwecke.",
  
  // Optional: date (statisch um Hydration-Probleme zu vermeiden)
  date: "2024-01-15T10:00:00.000Z",
  
  // Optional: publisher
  publisher: "FHIR TestScript Crafter",
  
  // Erforderlich: metadata mit mindestens einer capability
  metadata: {
    capability: [
      {
        // Erforderlich: capabilities (canonical reference)
        capabilities: "http://hl7.org/fhir/CapabilityStatement/base",
        
        // Optional: required
        required: true,
        
        // Optional: validated
        validated: false,
        
        // Optional: description
        description: "Basis FHIR Server Capabilities"
      }
    ]
  },
  
  // Erforderlich: test array mit mindestens einem Test
  test: [
    {
      // Optional: name
      name: "Minimal Test",
      
      // Optional: description
      description: "Ein minimaler Testfall",
      
      // Erforderlich: action array
      action: [
        {
          // Optional: operation
          operation: {
            type: {
              system: "http://hl7.org/fhir/restful-interaction",
              code: "read"
            },
            resource: "Patient",
            url: "/Patient/example",
            encodeRequestUrl: true
          },
          
          // Optional: assert
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
