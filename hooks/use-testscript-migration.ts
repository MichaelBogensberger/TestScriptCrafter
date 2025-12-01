/**
 * TestScript Migration Hook
 * Verwaltet die automatische Migration und Rückwärtskompatibilität von TestScripts
 */

import { useCallback, useMemo } from 'react'
import { useFhirVersion } from '@/lib/fhir-version-context'
import { validateTestScriptForVersion, migrateTestScript, MigrationOptions } from '@/lib/migration-service'
import type { TestScript } from '@/types/fhir-enhanced'
import { FhirVersion } from '@/types/fhir-config'

export interface UseTestScriptMigrationReturn {
  /** Validiert TestScript für aktuelle FHIR Version */
  validateTestScriptForCurrentVersion: (testScript: TestScript) => TestScript
  /** Migriert TestScript zu einer anderen Version */
  migrateTestScript: (testScript: TestScript, targetVersion: FhirVersion) => TestScript | null
  /** Prüft ob ein TestScript mit aktueller Version kompatibel ist */
  isCompatible: (testScript: TestScript) => boolean
  /** Warnt vor Kompatibilitätsproblemen */
  getCompatibilityWarnings: (testScript: TestScript) => string[]
}

/**
 * Hook für TestScript Migration und Kompatibilität
 */
export function useTestScriptMigration(): UseTestScriptMigrationReturn {
  const { currentVersion } = useFhirVersion()

  const validateTestScriptForCurrentVersion = useCallback((testScript: TestScript): TestScript => {
    return validateTestScriptForVersion(testScript, currentVersion)
  }, [currentVersion])

  const migrateTestScriptToVersion = useCallback((testScript: TestScript, targetVersion: FhirVersion): TestScript | null => {
    const options: MigrationOptions = {
      targetVersion,
      suppressWarnings: false
    }

    const result = migrateTestScript(testScript, currentVersion, options)
    
    if (result.success && result.migratedScript) {
      if (result.warnings && result.warnings.length > 0) {
        console.warn('Migration Warnungen:', result.warnings)
      }
      return result.migratedScript
    } else {
      console.error('Migration fehlgeschlagen:', result.errors)
      return null
    }
  }, [])

  const isCompatible = useCallback((testScript: TestScript): boolean => {
    // TestScript ist jetzt versionsneutral, Kompatibilität wird durch Context bestimmt
    return true
  }, [])

  const getCompatibilityWarnings = useCallback((testScript: TestScript): string[] => {
    const warnings: string[] = []
    
    // Spezifische Warnungen für bekannte Version-spezifische Features
    if (currentVersion === FhirVersion.R4 && testScript.scope) {
      warnings.push('TestScript verwendet "scope" Eigenschaften die in FHIR R4 nicht verfügbar sind')
    }

    return warnings
  }, [currentVersion])

  return useMemo(() => ({
    validateTestScriptForCurrentVersion,
    migrateTestScript: migrateTestScriptToVersion,
    isCompatible,
    getCompatibilityWarnings
  }), [validateTestScriptForCurrentVersion, migrateTestScriptToVersion, isCompatible, getCompatibilityWarnings])
}
