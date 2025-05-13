<script setup lang="ts">
import type { TestAction } from '~/types/fhir-testscript'

const props = defineProps<{
  action: TestAction
  index: number
}>()

const emit = defineEmits(['remove'])
</script>

<template>
  <div class="border rounded-md p-4 relative">
    <Button 
      variant="outline" 
      size="icon" 
      class="absolute top-2 right-2"
      @click="emit('remove', props.index)"
    >
      <XIcon class="h-4 w-4" />
    </Button>

    <TestOperation 
      v-if="props.action.operation" 
      :operation="props.action.operation" 
    />
    
    <TestAssertion 
      v-if="props.action.assert" 
      :assertion="props.action.assert" 
    />
  </div>
</template>
