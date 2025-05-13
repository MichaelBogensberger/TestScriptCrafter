<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Vorschau</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex justify-between items-center mb-4">
          <Tabs v-model="activeFormat">
            <TabsList>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="xml">XML</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" @click="downloadTestScript">
              <DownloadIcon class="h-4 w-4 mr-1" />
              Herunterladen
            </Button>
            <Button variant="outline" size="sm" @click="copyToClipboard">
              <ClipboardIcon class="h-4 w-4 mr-1" />
              Kopieren
            </Button>
          </div>
        </div>
        
        <div class="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
          <pre class="text-xs">{{ formattedContent }}</pre>
        </div>
      </CardContent>
    </Card>

    <!-- Validierungsfehler -->
    <Card v-if="store.validationErrors.value.length > 0">
      <CardHeader>
        <CardTitle>Validierungsfehler</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-for="(error, index) in store.validationErrors.value" 
             :key="index" 
             class="text-destructive">
          • {{ error }}
        </div>
      </CardContent>
    </Card>

    <!-- Reset-Button -->
    <div class="flex justify-end">
      <Button variant="destructive" @click="confirmReset">
        <RefreshCwIcon class="h-4 w-4 mr-1" />
        Zurücksetzen
      </Button>
    </div>

    <!-- Reset-Dialog -->
    <Dialog :open="showResetDialog" @update:open="showResetDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>TestScript zurücksetzen?</DialogTitle>
          <DialogDescription>
            Diese Aktion löscht alle eingegebenen Daten. Dies kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showResetDialog = false">Abbrechen</Button>
          <Button variant="destructive" @click="resetAndCloseDialog">Zurücksetzen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { DownloadIcon, ClipboardIcon, RefreshCwIcon } from 'lucide-vue-next'
import { useTestScriptStore } from '~/composables/useTestScriptStore'
import { testScriptService } from '~/services/testscript-service'

const store = useTestScriptStore()
const activeFormat = ref('json')
const showResetDialog = ref(false)

const formattedContent = computed(() => {
  if (activeFormat.value === 'json') {
    return testScriptService.toJson(store.testScript.value)
  } else {
    return testScriptService.toXml(store.testScript.value)
  }
})

function copyToClipboard() {
  navigator.clipboard.writeText(formattedContent.value)
    .then(() => {
      toast.success('In Zwischenablage kopiert')
    })
    .catch(() => {
      toast.error('Kopieren fehlgeschlagen')
    })
}

function downloadTestScript() {
  const fileName = store.testScript.value.name 
    ? `${store.testScript.value.name}.${activeFormat.value}` 
    : `testscript.${activeFormat.value}`
  
  const blob = new Blob([formattedContent.value], { 
    type: activeFormat.value === 'json' 
      ? 'application/json' 
      : 'application/xml' 
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = fileName
  link.click()
  
  URL.revokeObjectURL(url)
  toast.success(`Datei ${fileName} heruntergeladen`)
}

function confirmReset() {
  showResetDialog.value = true
}

function resetAndCloseDialog() {
  store.resetTestScript()
  showResetDialog.value = false
}
</script> 