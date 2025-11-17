/**
 * Zentrale Export-Datei für alle Hooks
 * Ermöglicht saubere Imports und bessere Wiederverwendbarkeit
 */

// SSR-sichere Hooks
export { useClientOnly, clientOnly } from './use-client-only'
export { useProgressAnimation } from './use-progress-animation'

// FHIR-spezifische Hooks
export { useFhirValidation } from './use-fhir-validation'
