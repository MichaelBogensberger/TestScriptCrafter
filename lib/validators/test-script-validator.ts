import { TestScript } from "@/types/test-script"

/**
 * Validierungsergebnis für ein TestScript
 */
interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validiert ein TestScript auf Korrektheit und Vollständigkeit
 * 
 * @param testScript Das zu validierende TestScript
 * @returns ValidationResult mit Status und Fehlermeldungen
 */
export function validateTestScript(testScript: TestScript): ValidationResult {
  const errors: string[] = []
  
  // Prüfung auf erforderliche Felder
  if (!testScript) {
    return { valid: false, errors: ["Kein TestScript vorhanden"] }
  }
  
  // Prüfung auf den ResourceType
  if (testScript.resourceType !== "TestScript") {
    errors.push("ResourceType muss 'TestScript' sein")
  }
  
  // Prüfung auf Name (erforderliches Feld)
  if (!testScript.name) {
    errors.push("TestScript muss einen Namen haben")
  }
  
  // Prüfung auf Status (erforderliches Feld)
  if (!testScript.status) {
    errors.push("TestScript muss einen Status haben")
  }
  
  // Prüfung auf Metadata (erforderliches Feld laut Schema)
  if (!testScript.metadata) {
    errors.push("TestScript muss Metadata enthalten")
  } else if (!testScript.metadata.capability || testScript.metadata.capability.length === 0) {
    errors.push("Metadata muss mindestens eine Capability enthalten")
  }
  
  // Prüfung auf leere Tests
  if (testScript.test && testScript.test.length === 0) {
    errors.push("TestScript enthält einen leeren Test-Array")
  }
  
  // Prüfung auf Setup ohne Aktionen
  if (testScript.setup && (!testScript.setup.action || testScript.setup.action.length === 0)) {
    errors.push("Setup ist definiert, enthält aber keine Aktionen")
  }
  
  // Prüfung auf Teardown ohne Aktionen
  if (testScript.teardown && (!testScript.teardown.action || testScript.teardown.action.length === 0)) {
    errors.push("Teardown ist definiert, enthält aber keine Aktionen")
  }
  
  // Prüfung auf widersprüchliche Assertions
  if (testScript.setup?.action) {
    checkAssertionsForContradictions(testScript.setup.action, errors)
  }
  
  if (testScript.test) {
    testScript.test.forEach(test => {
      if (test.action) {
        checkAssertionsForContradictions(test.action, errors)
      }
    })
  }
  
  return { 
    valid: errors.length === 0,
    errors 
  }
}

/**
 * Prüft Assertions auf Widersprüche
 */
function checkAssertionsForContradictions(actions: any[], errors: string[]): void {
  actions.forEach((action, index) => {
    if (action.assert) {
      const assertion = action.assert
      
      // Prüfung auf compareToSourceId ohne Expression oder Path
      if (assertion.compareToSourceId && 
          !assertion.compareToSourceExpression && 
          !assertion.compareToSourcePath) {
        errors.push(`Assertion #${index + 1}: compareToSourceId ohne Expression oder Path angegeben`)
      }
      
      // Prüfung auf widersprüchliche Response/Request-Werte
      if (assertion.response && assertion.requestMethod) {
        errors.push(`Assertion #${index + 1}: Enthält sowohl response als auch requestMethod`)
      }
    }
  })
} 