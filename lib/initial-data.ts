import type { TestScript } from "@/types/test-script"

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
      name: "BasicReadTest",
      
      // Optional: description  
      description: "Ein einfacher Read-Test",
      
      // Erforderlich: action array mit mindestens einer Aktion
      action: [
        {
          // Nur operation (nicht operation UND assert - das verletzt tst-2)
          operation: {
            // Optional: type mit korrektem System für RESTful interactions
            type: {
              system: "http://hl7.org/fhir/restful-interaction",
              code: "read"
            },
            
            // Optional: resource
            resource: "Patient",
            
            // Optional: description
            description: "Lese einen Patient",
            
            // Erforderlich: encodeRequestUrl
            encodeRequestUrl: true,
            
            // Erforderlich für tst-8: mindestens eines von sourceId, targetId, params oder url
            url: "Patient/example"
          }
        },
        {
          // Separate Aktion nur für assert (erfüllt tst-2)
          assert: {
            description: "Bestätige dass HTTP Status 200 zurückgegeben wird",
            response: "okay",
            warningOnly: false,
            stopTestOnFail: true
          }
        }
      ]
    }
  ]
}
