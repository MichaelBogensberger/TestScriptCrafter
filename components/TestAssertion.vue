<script setup lang="ts">
import type { TestAssertion } from '~/types/fhir-testscript'

const props = defineProps<{
  assertion: TestAssertion
}>()

const emit = defineEmits(['update:assertion'])

const operators = [
  'equals', 'notEquals', 'contains', 'notContains',
  'empty', 'notEmpty', 'eval', 'manualEval',
  'greaterThan', 'lessThan', 'in', 'notIn'
]
</script>

<template>
  <div class="space-y-3">
    <h4 class="font-medium">Assertion</h4>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <Label>Pfad</Label>
        <Input 
          v-model="props.assertion.path" 
          placeholder="Patient.name.given" 
        />
      </div>
      
      <div>
        <Label>Operator</Label>
        <Select v-model="props.assertion.operator">
          <SelectTrigger>
            <SelectValue placeholder="Operator wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="op in operators" 
              :key="op" 
              :value="op"
            >
              {{ op }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div v-if="!['empty', 'notEmpty', 'eval', 'manualEval'].includes(props.assertion.operator)">
      <Label>Erwarteter Wert</Label>
      <Input 
        v-model="props.assertion.value" 
        placeholder="Erwarteter Wert" 
      />
    </div>
    
    <div class="flex flex-col space-y-2">
      <div class="flex items-center space-x-2">
        <Switch v-model="props.assertion.warningOnly" id="warning-only" />
        <Label for="warning-only">Nur als Warnung</Label>
      </div>
      
      <div class="flex items-center space-x-2">
        <Switch v-model="props.assertion.stopTestOnFail" id="stop-on-fail" />
        <Label for="stop-on-fail">Test bei Fehler abbrechen</Label>
      </div>
    </div>
  </div>
</template>
