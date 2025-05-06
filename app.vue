<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-bold">FHIR TestScript Builder</h1>
        <p class="text-muted-foreground">Erstelle und bearbeite TestScript-Ressourcen</p>
      </header>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TestScriptForm />
        <TestScriptPreview />
      </div>
    </div>

    <Toaster />
  </div>
</template>
