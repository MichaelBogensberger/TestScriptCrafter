import { create } from 'xmlbuilder2'
import type { 
  FhirTestScript, 
  TestCase, 
  TestOperation, 
  TestAssertion 
} from '~/types/fhir-testscript'

/**
 * Service für die Verwaltung von FHIR TestScripts
 */
export class TestScriptService {
  /**
   * Erstellt ein neues leeres TestScript mit Standardwerten
   */
  createEmpty(): FhirTestScript {
    return {
      resourceType: 'TestScript',
      name: '',
      status: 'draft',
      metadata: {
        capability: [{
          required: true,
          validated: false,
          capabilities: ''
        }]
      },
      test: [{
        name: 'Test 1',
        action: []
      }]
    }
  }

  /**
   * Validiert ein TestScript auf erforderliche Felder
   */
  validate(script: FhirTestScript): string[] {
    const errors: string[] = []
    
    if (!script.name) {
      errors.push('Name ist erforderlich')
    }
    
    if (!script.status) {
      errors.push('Status ist erforderlich')
    }
    
    if (!script.test?.length) {
      errors.push('Mindestens ein Test ist erforderlich')
    } else {
      // Überprüfe, ob jeder Test einen Namen hat
      script.test.forEach((test, index) => {
        if (!test.name) {
          errors.push(`Test ${index + 1} benötigt einen Namen`)
        }
      })
    }
    
    return errors
  }

  /**
   * Fügt einen neuen Test zum TestScript hinzu
   */
  addTest(script: FhirTestScript): FhirTestScript {
    return {
      ...script,
      test: [
        ...script.test,
        {
          name: `Test ${script.test.length + 1}`,
          action: []
        }
      ]
    }
  }

  /**
   * Entfernt einen Test aus dem TestScript
   */
  removeTest(script: FhirTestScript, index: number): FhirTestScript {
    if (script.test.length <= 1) {
      return script // Mindestens ein Test muss erhalten bleiben
    }
    
    const updatedTest = [...script.test]
    updatedTest.splice(index, 1)
    
    return {
      ...script,
      test: updatedTest
    }
  }

  /**
   * Fügt eine Operation zu einem Test hinzu
   */
  addOperation(script: FhirTestScript, testIndex: number): FhirTestScript {
    const newOperation: TestOperation = {
      method: 'GET',
      url: '',
      encodeRequestUrl: true
    }
    
    const updatedTests = [...script.test]
    updatedTests[testIndex] = {
      ...updatedTests[testIndex],
      action: [
        ...updatedTests[testIndex].action,
        { operation: newOperation }
      ]
    }
    
    return {
      ...script,
      test: updatedTests
    }
  }

  /**
   * Fügt eine Assertion zu einem Test hinzu
   */
  addAssertion(script: FhirTestScript, testIndex: number): FhirTestScript {
    const newAssertion: TestAssertion = {
      operator: 'equals',
      warningOnly: false,
      stopTestOnFail: false
    }
    
    const updatedTests = [...script.test]
    updatedTests[testIndex] = {
      ...updatedTests[testIndex],
      action: [
        ...updatedTests[testIndex].action,
        { assert: newAssertion }
      ]
    }
    
    return {
      ...script,
      test: updatedTests
    }
  }

  /**
   * Entfernt eine Aktion aus einem Test
   */
  removeAction(script: FhirTestScript, testIndex: number, actionIndex: number): FhirTestScript {
    const updatedTests = [...script.test]
    const updatedActions = [...updatedTests[testIndex].action]
    updatedActions.splice(actionIndex, 1)
    
    updatedTests[testIndex] = {
      ...updatedTests[testIndex],
      action: updatedActions
    }
    
    return {
      ...script,
      test: updatedTests
    }
  }

  /**
   * Konvertiert ein TestScript in JSON-Format
   */
  toJson(script: FhirTestScript): string {
    return JSON.stringify(script, null, 2)
  }

  /**
   * Konvertiert ein TestScript in XML-Format
   */
  toXml(script: FhirTestScript): string {
    try {
      // Erstelle ein neues XML-Dokument mit einem Wurzelelement
      const doc = create({ version: '1.0', encoding: 'UTF-8' })
      
      // Füge das TestScript als Wurzelelement hinzu
      const root = doc.ele('TestScript')
      
      // Füge alle Eigenschaften manuell hinzu
      root.att('xmlns', 'http://hl7.org/fhir')
      
      if (script.id) root.ele('id').txt(script.id)
      if (script.url) root.ele('url').txt(script.url)
      
      root.ele('resourceType').txt(script.resourceType)
      root.ele('name').txt(script.name || '')
      root.ele('status').txt(script.status)
      
      if (script.description) {
        root.ele('description').txt(script.description)
      }
      
      // Metadata
      const metadata = root.ele('metadata')
      script.metadata.capability.forEach(cap => {
        const capability = metadata.ele('capability')
        capability.ele('required').txt(cap.required.toString())
        capability.ele('validated').txt(cap.validated.toString())
        capability.ele('capabilities').txt(cap.capabilities || '')
        
        if (cap.description) {
          capability.ele('description').txt(cap.description)
        }
      })
      
      // Tests
      script.test.forEach(testCase => {
        const test = root.ele('test')
        test.ele('name').txt(testCase.name)
        
        if (testCase.description) {
          test.ele('description').txt(testCase.description)
        }
        
        testCase.action.forEach(action => {
          const actionEle = test.ele('action')
          
          if (action.operation) {
            const op = actionEle.ele('operation')
            op.ele('method').txt(action.operation.method)
            op.ele('url').txt(action.operation.url)
            op.ele('encodeRequestUrl').txt(action.operation.encodeRequestUrl.toString())
            
            if (action.operation.description) {
              op.ele('description').txt(action.operation.description)
            }
          }
          
          if (action.assert) {
            const assert = actionEle.ele('assert')
            
            if (action.assert.path) assert.ele('path').txt(action.assert.path)
            if (action.assert.value) assert.ele('value').txt(action.assert.value)
            
            assert.ele('operator').txt(action.assert.operator)
            assert.ele('warningOnly').txt(action.assert.warningOnly.toString())
            assert.ele('stopTestOnFail').txt(action.assert.stopTestOnFail.toString())
            
            if (action.assert.description) {
              assert.ele('description').txt(action.assert.description)
            }
          }
        })
      })
      
      // Konvertiere in einen String mit Einrückung
      return doc.end({ prettyPrint: true })
    } catch (error) {
      return `<!-- Fehler bei der XML-Konvertierung: ${error} -->`
    }
  }
}

// Singleton-Instanz des Services
export const testScriptService = new TestScriptService() 