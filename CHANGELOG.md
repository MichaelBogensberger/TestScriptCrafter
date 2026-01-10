# Changelog

## [Unreleased] - 2026-01-10

### ✅ Hinzugefügt

#### 1. Response Code Eingabe
- **Feature:** Response Codes können jetzt direkt eingegeben werden
- **Verwendung:** Feld "Expected Status Code" in Assertions
- **Beispiele:** 
  - Einzelner Code: `"200"`
  - Mehrere Codes: `"200,201"`
- **Technische Details:** Neues Feld `responseCode` in `TestScriptSetupActionAssert`

#### 2. Mehrere Assertions pro Action
- **Feature:** Actions unterstützen jetzt mehrere Assertions
- **Verwendung:** Beliebig viele Assertions können zu einer Action hinzugefügt werden
- **UI:** 
  - "Add Assertion" Button fügt weitere Assertions hinzu
  - Jede Assertion kann individuell bearbeitet und entfernt werden
  - Zähler zeigt Anzahl der Assertions an
- **Technische Details:** 
  - `TestScriptTestAction.assert` unterstützt jetzt Array von Assertions
  - Typ: `TestScriptSetupActionAssert | TestScriptSetupActionAssert[]`
- **FHIR® Konformität:** ✅ Entspricht der FHIR® TestScript Spezifikation

#### 3. Content-Type Auswahl in Assertions
- **Feature:** Dropdown-Menü für Content-Type Auswahl
- **Unterstützte Typen:**
  - `application/fhir+json`
  - `application/fhir+xml`
  - `application/json+fhir`
  - `application/xml+fhir`
  - `application/json`
  - `application/xml`
- **Verwendung:** Im Feld "Content-Type" in Assertions
- **Technische Details:** Verwendet das FHIR® `contentType` Feld

#### 4. Erweiterte Profile-Struktur
- **Feature:** Profile haben jetzt ID und Reference Felder
- **Struktur:**
  ```typescript
  interface TestScriptProfile {
    id: string;        // Eindeutiger Identifier
    reference: string; // Kanonische URL zur StructureDefinition
  }
  ```
- **Beispiel:**
  - ID: `"patient-profile"`
  - Reference: `"http://hl7.at/fhir/HL7ATCoreProfiles/4.0.1/StructureDefinition/at-core-patient"`
- **Verwendung in Assertions:** 
  - Referenzierung über `validateProfileId` Feld
  - Beispiel: `<validateProfileId value="patient-profile"/>`
- **FHIR® Konformität:** ✅ Entspricht der FHIR® TestScript Spezifikation

### 📝 Dokumentiert

#### Common Actions
- **Status:** ⚠️ Experimentelles Feature (NICHT Teil des FHIR® Standards)
- **Zweck:** Wiederverwendbare Action-Blöcke mit Parametern
- **Empfehlung:** 
  - Nur für interne Tests verwenden
  - Alternative: Standard FHIR® Setup/Teardown Sections
- **Hinweis:** Wird möglicherweise nicht von allen FHIR® TestScript Engines unterstützt

### 🔧 Geändert

#### UI-Verbesserungen
- Profile-Section zeigt jetzt ID und Reference Felder
- Assertion-Component zeigt Anzahl der Assertions
- Deutsche Übersetzungen für neue Features

#### Typen
- `TestScriptProfile` Interface hinzugefügt
- `TestScriptTestAction.assert` erweitert für Arrays
- `TestScript` erweitert um `profile?: TestScriptProfile[]`

### 📚 README Updates
- Neue Sektion "Aktuelle Änderungen (Januar 2026)"
- Erweiterte Funktionalitäten-Dokumentation
- Common Actions Dokumentation mit Warnung
- Limitierungen aktualisiert

## Technische Details

### Betroffene Dateien
- `types/fhir-enhanced.ts` - Erweiterte Typen
- `components/form-builder/sections/profiles-section.tsx` - Profile UI
- `components/form-builder/shared/action-component.tsx` - Multiple Assertions
- `components/form-builder/shared/assertion-component.tsx` - Content-Type & Response Code
- `README.md` - Dokumentation

### Breaking Changes
- ⚠️ Profile-Struktur geändert von `string[]` zu `TestScriptProfile[]`
- Migration erforderlich für bestehende TestScripts mit Profilen

### Kompatibilität
- ✅ FHIR® R5 konform
- ✅ Abwärtskompatibel (mit Migration)
- ✅ Build erfolgreich (Next.js 15.2.4)

---

**Hinweis:** Alle Änderungen basieren auf Feedback vom 10. Januar 2026 und folgen der FHIR® TestScript Spezifikation.

