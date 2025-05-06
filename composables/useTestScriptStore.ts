import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { FhirTestScript } from '~/types/fhir-testscript'
import { testScriptService } from '~/services/testscript-service'

// Erstelle einen globalen Store
const testScript = ref<FhirTestScript>(testScriptService.createEmpty())
const isModified = ref(false)

export function useTestScriptStore() {
  // Getters
  const validationErrors = computed(() => 
    testScriptService.validate(testScript.value)
  )

  const isValid = computed(() => 
    validationErrors.value.length === 0
  )

  // Actions
  function resetTestScript() {
    testScript.value = testScriptService.createEmpty()
    isModified.value = false
    toast.success('TestScript zurückgesetzt')
  }

  function updateTestScript(script: FhirTestScript) {
    testScript.value = script
    isModified.value = true
  }

  function addTest() {
    testScript.value = testScriptService.addTest(testScript.value)
    isModified.value = true
    toast.success(`Test ${testScript.value.test.length} hinzugefügt`)
  }

  function removeTest(index: number) {
    if (testScript.value.test.length <= 1) {
      toast.error('Mindestens ein Test muss erhalten bleiben')
      return
    }
    
    testScript.value = testScriptService.removeTest(testScript.value, index)
    isModified.value = true
    toast.success('Test entfernt')
  }

  function addOperation(testIndex: number) {
    testScript.value = testScriptService.addOperation(testScript.value, testIndex)
    isModified.value = true
    toast.success('Operation hinzugefügt')
  }

  function addAssertion(testIndex: number) {
    testScript.value = testScriptService.addAssertion(testScript.value, testIndex)
    isModified.value = true
    toast.success('Assertion hinzugefügt')
  }

  function removeAction(testIndex: number, actionIndex: number) {
    testScript.value = testScriptService.removeAction(
      testScript.value, 
      testIndex, 
      actionIndex
    )
    isModified.value = true
    toast.success('Aktion entfernt')
  }

  function exportAsJson() {
    if (!isValid.value) {
      toast.error('TestScript enthält Fehler', {
        description: 'Bitte korrigiere alle Fehler vor dem Export'
      })
      return null
    }
    
    return testScriptService.toJson(testScript.value)
  }

  return {
    // State
    testScript,
    isModified,
    
    // Getters
    validationErrors,
    isValid,
    
    // Actions
    resetTestScript,
    updateTestScript,
    addTest,
    removeTest,
    addOperation,
    addAssertion,
    removeAction,
    exportAsJson
  }
} 