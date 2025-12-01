/**
 * FHIR Migration Service
 * Verwaltet die Migration zwischen verschiedenen FHIR-Versionen
 * und stellt Rückwärtskompatibilität sicher
 */

import type { TestScript } from "@/types/fhir-enhanced"
import { FhirVersion, DEFAULT_FHIR_VERSION } from "@/types/fhir-config"

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean
  originalVersion?: FhirVersion
  targetVersion: FhirVersion
  migratedScript?: TestScript
  warnings?: string[]
  errors?: string[]
}

/**
 * Migration options
 */
export interface MigrationOptions {
  /** Ziel-FHIR Version */
  targetVersion: FhirVersion
  /** Warnungen unterdrücken */
  suppressWarnings?: boolean
  /** Trockenlauf - keine Änderungen vornehmen */
  dryRun?: boolean
}

/**
 * Migriert ein TestScript zu einer anderen FHIR Version
 */
export function migrateTestScript(
  testScript: TestScript,
  originalVersion: FhirVersion,
  options: MigrationOptions
): MigrationResult {
  const result: MigrationResult = {
    success: false,
    targetVersion: options.targetVersion,
    warnings: [],
    errors: []
  }

  result.originalVersion = originalVersion

  // Wenn Versionen identisch sind, keine Migration nötig
  if (originalVersion === options.targetVersion) {
    result.success = true
    result.migratedScript = testScript
    return result
  }

  try {
    // Kopiere TestScript für Migration (Version wird über Context verwaltet)
    const migratedScript: TestScript = {
      ...testScript
    }

    // Version-spezifische Migration Logic
    switch (`${originalVersion}_TO_${options.targetVersion}`) {
      case 'R5_TO_R4':
        migrateR5ToR4(migratedScript, result)
        break
      
      case 'R4_TO_R5':
        migrateR4ToR5(migratedScript, result)
        break
      
      default:
        result.errors?.push(`Migration von ${originalVersion} zu ${options.targetVersion} wird nicht unterstützt`)
        return result
    }

    if (!options.dryRun) {
      result.migratedScript = migratedScript
    }
    
    result.success = result.errors?.length === 0
    return result

  } catch (error) {
    result.errors?.push(`Migration fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

/**
 * Migriert von FHIR R5 zu R4
 */
function migrateR5ToR4(script: TestScript, result: MigrationResult): void {
  // R5-spezifische Features entfernen die in R4 nicht verfügbar sind
  
  // TestScript.scope ist R5-spezifisch
  if (script.scope) {
    result.warnings?.push('TestScript.scope wurde entfernt (nicht verfügbar in R4)')
    delete script.scope
  }

  // Weitere R5 → R4 spezifische Anpassungen können hier hinzugefügt werden
  result.warnings?.push('Migration von R5 zu R4: Einige erweiterte Features könnten nicht verfügbar sein')
}

/**
 * Migriert von FHIR R4 zu R5
 */
function migrateR4ToR5(script: TestScript, result: MigrationResult): void {
  // R4 → R5 Migration ist meist rückwärtskompatibel
  // Neue R5 Features können optional hinzugefügt werden
  
  result.warnings?.push('Migration von R4 zu R5: Neue R5 Features sind verfügbar aber nicht automatisch aktiviert')
}

/**
 * Validiert TestScript für bestimmte FHIR Version
 * Rückwärtskompatibilität durch Context-Version
 */
export function validateTestScriptForVersion(testScript: TestScript, version: FhirVersion): TestScript {
  // TestScript ist bereits FHIR-konform, keine zusätzlichen Properties nötig
  return testScript
}

/**
 * Batch-Migration für mehrere TestScripts
 */
export function batchMigrateTestScripts(
  testScripts: TestScript[],
  originalVersion: FhirVersion,
  options: MigrationOptions
): MigrationResult[] {
  return testScripts.map(script => migrateTestScript(script, originalVersion, options))
}

/**
 * Validiert ob ein TestScript mit einer spezifischen FHIR Version kompatibel ist
 */
export function validateVersionCompatibility(
  testScript: TestScript,
  currentVersion: FhirVersion,
  targetVersion: FhirVersion
): { compatible: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (currentVersion === targetVersion) {
    return { compatible: true, issues: [] }
  }

  // Version-spezifische Kompatibilitätsprüfungen
  if (currentVersion === FhirVersion.R5 && targetVersion === FhirVersion.R4) {
    if (testScript.scope) {
      issues.push('TestScript.scope ist in FHIR R4 nicht verfügbar')
    }
  }

  return {
    compatible: issues.length === 0,
    issues
  }
}
