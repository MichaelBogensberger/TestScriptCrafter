/**
 * Zentrale Export-Datei für alle Komponenten
 * Ermöglicht saubere Imports und bessere Tree-Shaking
 */

// Core Components
export { TestScriptBuilder } from './test-script-builder'
export { FormBuilder } from './form-builder/form-builder'
export { StructuredView } from './structured-view'
export { TestScriptFilteredView } from './test-script-filtered-view'

// View Components
export { JsonView } from './json-view'
export { XmlView } from './xml-view'
export { ValidationTab } from './validation-tab'
export { OutputViewer } from './output-viewer'

// Utility Components
export { SyntaxHighlighter } from './syntax-highlighter'
export { ThemeToggle } from './theme-toggle'

// Form Sections
export { TestCaseSection } from './form-builder/sections/test-case-section'
export { AssertionComponent } from './form-builder/shared/assertion-component'

// Builder Sections
export { HeaderSection } from './test-script-builder/header-section'
export { OutputSection } from './test-script-builder/output-section'
