# TestScript Crafter - Entwicklungsrichtlinien

## Architektur-Übersicht

### Komponenten-Struktur
```
components/
├── index.ts                    # Zentrale Exports
├── test-script-builder.tsx    # Haupt-Builder-Komponente
├── form-builder/              # Formular-Logik
│   ├── form-builder.tsx       # Haupt-Formular
│   ├── sections/              # Formular-Sektionen
│   └── shared/                # Geteilte Komponenten
├── ui/                        # Basis UI-Komponenten
└── [view-components].tsx      # Anzeige-Komponenten
```

### Hooks-Struktur
```
hooks/
├── index.ts                   # Zentrale Exports
├── use-client-only.ts         # SSR-sichere Browser-APIs
├── use-progress-animation.ts  # Deterministische Animationen
└── use-fhir-validation.ts     # FHIR-Validierung
```

## Entwicklungsrichtlinien

### 1. Import/Export-Konsistenz
- **Named Exports bevorzugen**: `export function ComponentName()`
- **Default Exports als Fallback**: `export default ComponentName`
- **Zentrale Index-Dateien**: Alle Exports über `index.ts`
- **Konsistente Imports**: `import { Component } from '@/components'`

### 2. SSR-Sicherheit
- **Browser-APIs kapseln**: Nutze `clientOnly` Wrapper
- **Deterministische Werte**: Keine `Math.random()`, `Date.now()` in Rendering
- **Client-Only Hook**: `useClientOnly()` für Browser-spezifische Logik
- **Hydration-Tests**: Immer Server/Client-Konsistenz prüfen

### 3. TypeScript-Standards
- **Strikte Typisierung**: Keine `any` Types
- **Interface-Definition**: Klare Props-Interfaces
- **Type Guards**: Für Runtime-Validierung
- **Generics nutzen**: Für wiederverwendbare Komponenten

### 4. Komponenten-Patterns
- **Funktionale Komponenten**: Immer mit TypeScript
- **Props-Destructuring**: Klare Parameter-Definition
- **Memo für Performance**: Bei komplexen Re-Renders
- **Custom Hooks**: Für wiederverwendbare Logik

### 5. Fehlerbehandlung
- **Try-Catch für APIs**: Immer mit spezifischen Fehlern
- **Fallback-UI**: Für fehlgeschlagene Operationen
- **Toast-Notifications**: Für User-Feedback
- **Console-Logging**: Für Entwickler-Debug

## LLM-Entwicklung Optimierungen

### Datei-Organisation
- **Klare Verzeichnisstruktur**: Logische Gruppierung
- **Aussagekräftige Namen**: Selbsterklärende Dateinamen
- **Konsistente Patterns**: Gleiche Struktur überall
- **Dokumentierte Exports**: JSDoc für komplexe Funktionen

### Code-Lesbarkeit
- **Einheitliche Formatierung**: Prettier + ESLint
- **Kommentierte Komplexität**: Erklärungen für schwierige Logik
- **Type-Annotationen**: Explizite Typen wo nötig
- **Funktionale Zerlegung**: Kleine, fokussierte Funktionen

### Testing-Freundlichkeit
- **Testbare Komponenten**: Klare Input/Output-Contracts
- **Mock-freundliche APIs**: Dependency Injection wo möglich
- **Isolierte Logik**: Business Logic von UI getrennt
- **Deterministische Outputs**: Vorhersagbare Ergebnisse

## Häufige Probleme & Lösungen

### Hydration-Fehler
```typescript
// ❌ Problematisch
const randomId = Math.random()

// ✅ Korrekt
const { isClient } = useClientOnly()
const id = isClient ? generateId() : 'ssr-fallback'
```

### Import-Fehler
```typescript
// ❌ Problematisch
import Component from './component' // Fehlender Export

// ✅ Korrekt
import { Component } from './component' // Named Export
```

### Performance-Probleme
```typescript
// ❌ Problematisch
const expensiveValue = calculateExpensive(props)

// ✅ Korrekt
const expensiveValue = useMemo(() => calculateExpensive(props), [props])
```

## Deployment-Checkliste

- [ ] Alle Linter-Fehler behoben
- [ ] TypeScript-Compilation erfolgreich
- [ ] Hydration-Warnings geprüft
- [ ] Performance-Metriken akzeptabel
- [ ] Browser-Kompatibilität getestet
- [ ] SSR-Funktionalität validiert

## Erweiterungsrichtlinien

### Neue Komponenten
1. TypeScript-Interface definieren
2. Named Export implementieren
3. Zu `components/index.ts` hinzufügen
4. JSDoc-Dokumentation schreiben
5. Error-Handling implementieren

### Neue Hooks
1. SSR-Sicherheit prüfen
2. TypeScript-Typen definieren
3. Zu `hooks/index.ts` hinzufügen
4. Unit-Tests schreiben
5. Dokumentation aktualisieren

### API-Änderungen
1. Backward-Compatibility prüfen
2. Migration-Guide schreiben
3. Type-Definitionen aktualisieren
4. Integration-Tests anpassen
5. Changelog aktualisieren
