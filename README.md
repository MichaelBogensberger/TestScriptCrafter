# 🧪 TestScript Crafter

Ein modernes, interaktives Tool zur Erstellung und Verwaltung von FHIR TestScript-Ressourcen. Entwickelt mit Next.js 15, TypeScript und shadcn/ui für eine optimale Entwicklererfahrung.

## ✨ Features

### 🎯 Kernfunktionalitäten
- **Visueller TestScript Builder** - Intuitive Formular-basierte Erstellung
- **Live-Vorschau** - Echtzeit-Anzeige der generierten FHIR-Ressourcen
- **FHIR-Validierung** - Integration mit FHIR-Servern für Validierung
- **Modulare Architektur** - Saubere Trennung der Verantwortlichkeiten
- **Type-Safety** - Vollständige TypeScript-Unterstützung mit @types/fhir

### 🎨 UI/UX Features
- **Moderne shadcn/ui Komponenten** - Konsistente, zugängliche Benutzeroberfläche
- **Responsive Design** - Optimiert für Desktop und Mobile
- **Dark/Light Mode** - Automatische Theme-Unterstützung
- **Progress-Indikatoren** - Visuelle Fortschrittsanzeige
- **Interaktive Accordion-Items** - Organisierte Sektions-Verwaltung

### 🔧 Technische Features
- **FHIR R5 Unterstützung** - Aktuelle FHIR-Standards
- **Erweiterte Typen** - Kombination von @types/fhir mit spezifischen Erweiterungen
- **Modulare Komponenten** - Wiederverwendbare UI-Elemente
- **Performance-Optimiert** - React Hooks und Memoization
- **Code-Splitting** - Optimierte Bundle-Größen

## 🚀 Quick Start

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/MichaelBogensberger/TestScriptCrafter.git
cd TestScriptCrafter

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist dann unter `http://localhost:3000` verfügbar.

## 📁 Projektstruktur

```
testscript-crafter/
├── app/                          # Next.js App Router
│   ├── api/validate/            # FHIR-Validierungs-API
│   ├── globals.css              # Globale Styles
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # Hauptseite
├── components/                   # React-Komponenten
│   ├── form-builder/            # Formular-Builder Module
│   │   ├── sections/            # Formular-Sektionen
│   │   ├── progress-indicator.tsx
│   │   ├── test-case-manager.tsx
│   │   └── form-builder.tsx
│   ├── test-script-builder/     # TestScript Builder Module
│   │   ├── header-section.tsx
│   │   └── output-section.tsx
│   ├── ui/                      # shadcn/ui Komponenten
│   └── *.tsx                    # Weitere Komponenten
├── hooks/                        # Custom React Hooks
│   └── use-fhir-validation.ts
├── lib/                         # Utilities und Services
│   ├── formatters/             # JSON/XML Formatierung
│   ├── services/               # FHIR-Validierungs-Service
│   └── utils.ts
├── types/                       # TypeScript-Typen
│   ├── fhir-enhanced.ts        # Erweiterte FHIR-Typen
│   ├── test-script.ts          # TestScript-spezifische Typen
│   └── validation.ts
└── public/                      # Statische Assets
```

## 🛠️ Entwicklung

### Verfügbare Scripts

```bash
# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Produktions-Server starten
npm run start

# Linting ausführen
npm run lint
```

### Komponenten-Entwicklung

Das Projekt verwendet eine modulare Komponenten-Architektur:

#### FormBuilder-Module
- **`SectionAccordionItem`** - Wiederverwendbare Accordion-Items mit Status-Icons
- **`ProgressIndicator`** - Fortschrittsanzeige mit detaillierter Sektions-Übersicht
- **`TestCaseManager`** - Spezialisierte Testfall-Verwaltung

#### TestScript-Builder-Module
- **`HeaderSection`** - Status-Header mit Validierungsanzeige
- **`OutputSection`** - Live-Vorschau mit Metadaten

### TypeScript-Integration

Das Projekt nutzt erweiterte FHIR-Typen:

```typescript
// Basis-FHIR-Typen von @types/fhir
import type { TestScript, TestScriptTest } from '@/types/fhir-enhanced'

// Erweiterte Typen für bessere Type-Safety
interface EnhancedTestScript extends fhir2.TestScript {
  testSystem?: TestSystem[]
  scope?: Scope[]
  common?: TestScriptCommon[]
}
```

## 🎨 UI-Komponenten

Das Projekt verwendet shadcn/ui für konsistente, moderne UI-Komponenten:

### Verfügbare Komponenten
- **Layout:** Accordion, Card, Tabs, Separator
- **Formulare:** Button, Input, Select, Checkbox, Switch
- **Feedback:** Badge, Progress, Alert, Skeleton
- **Navigation:** Breadcrumb, Navigation Menu
- **Overlays:** Dialog, Popover, Tooltip, Sheet

### Theme-Unterstützung
- Automatische Dark/Light Mode Erkennung
- Konsistente Farbpalette
- Responsive Design-Prinzipien

## 🔍 FHIR-Validierung

### Integrierte Validierung
- **Server-Validierung** - Integration mit FHIR-Servern
- **Client-seitige Validierung** - Grundlegende Struktur-Validierung
- **Echtzeit-Feedback** - Sofortige Validierungsergebnisse

### Unterstützte FHIR-Server
- HAPI FHIR Server (Standard)
- Konfigurierbare Server-URLs
- OperationOutcome-Integration

## 📊 Features im Detail

### TestScript Builder
- **Grundlegende Informationen** - Name, Status, URL, Beschreibung
- **Metadaten** - Capabilities, Links, Konfiguration
- **Setup/Teardown** - Vor- und Nachbereitungsschritte
- **Testfälle** - Strukturierte Test-Definitionen
- **Live-Vorschau** - Echtzeit-Anzeige der generierten Ressourcen

### Ausgabe-Formate
- **JSON** - Standard FHIR JSON-Format
- **XML** - FHIR XML-Format
- **Strukturierte Ansicht** - Organisierte Darstellung
- **Gefilterte Ansicht** - Fokussierte Inhaltsanzeige

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel --prod
```

### Andere Plattformen
Das Projekt ist kompatibel mit:
- Netlify
- AWS Amplify
- Docker
- Traditionelle Hosting-Provider

## 🤝 Beitragen

### Entwicklungsworkflow
1. Fork des Repositories
2. Feature-Branch erstellen: `git checkout -b feature/neue-funktion`
3. Änderungen committen: `git commit -m 'feat: neue Funktion hinzugefügt'`
4. Branch pushen: `git push origin feature/neue-funktion`
5. Pull Request erstellen

### Code-Standards
- TypeScript für alle neuen Dateien
- ESLint-Konfiguration befolgen
- Komponenten-Dokumentation
- Unit-Tests für kritische Funktionen

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 👥 Autoren

- **Michael Bogensberger** - Hauptentwickler
- **FHIR Community** - Standards und Spezifikationen

## 🙏 Danksagungen

- **HL7 FHIR** - Für die FHIR-Standards
- **shadcn/ui** - Für die exzellenten UI-Komponenten
- **Next.js Team** - Für das großartige Framework
- **TypeScript Community** - Für die Typen-Unterstützung

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues erstellen
- Dokumentation durchsuchen
- Community-Forum nutzen

---

**Entwickelt mit ❤️ für die FHIR-Community**