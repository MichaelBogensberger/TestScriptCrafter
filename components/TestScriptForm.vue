<template>
  <div class="space-y-6">
    <!-- Basisdaten -->
    <Card>
      <CardHeader>
        <CardTitle>Basis-Informationen</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <Label for="name">Name</Label>
            <Input 
              id="name" 
              v-model="testScript.name" 
              placeholder="TestScript-Name eingeben" 
            />
          </div>

          <div>
            <Label for="status">Status</Label>
            <Select v-model="testScript.status">
              <SelectTrigger id="status">
                <SelectValue placeholder="Status wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="description">Beschreibung (optional)</Label>
            <Textarea 
              id="description" 
              v-model="testScript.description" 
              placeholder="Beschreibung des TestScripts" 
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Test-Bereich -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium">Tests</h2>
        <Button size="sm" @click="store.addTest">
          <PlusIcon class="w-4 h-4 mr-1" />
          Test hinzufügen
        </Button>
      </div>

      <Card v-for="(test, testIndex) in testScript.test" :key="testIndex">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            <Input 
              v-model="test.name" 
              class="w-64 h-7 text-base" 
              :placeholder="`Test ${testIndex + 1}`" 
            />
          </CardTitle>
          <Button 
            variant="outline" 
            size="icon" 
            @click="store.removeTest(testIndex)"
            :disabled="testScript.test.length <= 1"
          >
            <TrashIcon class="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div>
              <Label>Beschreibung (optional)</Label>
              <Input v-model="test.description" placeholder="Test-Beschreibung" />
            </div>

            <!-- Test-Aktionen -->
            <div v-if="test.action.length === 0" class="text-center py-4 text-muted-foreground">
              Keine Aktionen definiert
            </div>

            <div v-else class="space-y-4 mt-4">
              <div v-for="(action, actionIndex) in test.action" :key="actionIndex" class="border rounded-md p-4 relative">
                <Button 
                  variant="outline" 
                  size="icon" 
                  class="absolute top-2 right-2"
                  @click="store.removeAction(testIndex, actionIndex)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>

                <!-- Operation -->
                <div v-if="action.operation" class="space-y-3">
                  <h4 class="font-medium">Operation</h4>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>HTTP-Methode</Label>
                      <Select v-model="action.operation.method">
                        <SelectTrigger>
                          <SelectValue placeholder="HTTP-Methode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>URL</Label>
                      <Input v-model="action.operation.url" placeholder="/Patient/${id}" />
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <Switch v-model="action.operation.encodeRequestUrl" id="encode-url" />
                    <Label for="encode-url">URL codieren</Label>
                  </div>
                </div>

                <!-- Assertion -->
                <div v-if="action.assert" class="space-y-3">
                  <h4 class="font-medium">Assertion</h4>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Pfad</Label>
                      <Input v-model="action.assert.path" placeholder="Patient.name.given" />
                    </div>
                    
                    <div>
                      <Label>Operator</Label>
                      <Select v-model="action.assert.operator">
                        <SelectTrigger>
                          <SelectValue placeholder="Operator wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="notEquals">notEquals</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="notContains">notContains</SelectItem>
                          <SelectItem value="empty">empty</SelectItem>
                          <SelectItem value="notEmpty">notEmpty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div v-if="!['empty', 'notEmpty'].includes(action.assert.operator)">
                    <Label>Erwarteter Wert</Label>
                    <Input v-model="action.assert.value" placeholder="Erwarteter Wert" />
                  </div>
                  
                  <div class="flex flex-col space-y-2">
                    <div class="flex items-center space-x-2">
                      <Switch v-model="action.assert.warningOnly" id="warning-only" />
                      <Label for="warning-only">Nur als Warnung</Label>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <Switch v-model="action.assert.stopTestOnFail" id="stop-on-fail" />
                      <Label for="stop-on-fail">Test bei Fehler abbrechen</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex space-x-2 mt-4">
              <Button variant="outline" size="sm" @click="store.addOperation(testIndex)">
                <PlusIcon class="h-4 w-4 mr-1" />
                Operation
              </Button>
              <Button variant="outline" size="sm" @click="store.addAssertion(testIndex)">
                <PlusIcon class="h-4 w-4 mr-1" />
                Assertion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PlusIcon, TrashIcon, XIcon } from 'lucide-vue-next'
import { useTestScriptStore } from '~/composables/useTestScriptStore'

const store = useTestScriptStore()

const testScript = computed({
  get: () => store.testScript.value,
  set: (value) => store.updateTestScript(value)
})
</script> 