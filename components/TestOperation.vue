<script setup lang="ts">
import type { TestOperation } from '~/types/fhir-testscript'

const props = defineProps<{
  operation: TestOperation
}>()

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
</script>

<template>
  <div class="space-y-3">
    <h4 class="font-medium">Operation</h4>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <Label>HTTP-Methode</Label>
        <Select v-model="props.operation.method">
          <SelectTrigger>
            <SelectValue placeholder="HTTP-Methode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="method in methods" 
              :key="method" 
              :value="method"
            >
              {{ method }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>URL</Label>
        <Input 
          v-model="props.operation.url" 
          placeholder="/Patient/${id}" 
        />
      </div>
    </div>
    
    <div class="flex items-center space-x-2">
      <Switch v-model="props.operation.encodeRequestUrl" id="encode-url" />
      <Label for="encode-url">URL codieren</Label>
    </div>
  </div>
</template>
