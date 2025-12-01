/**
 * FHIR Version Configuration
 * Zentrale Konfiguration für unterstützte FHIR-Versionen
 */

export enum FhirVersion {
  R4 = 'R4',
  R5 = 'R5'
}

export interface FhirVersionConfig {
  version: FhirVersion
  display: string
  description: string
  validationEndpoint: string
  packagePath: string
  isDefault?: boolean
  capabilities?: string[]
}

export const FHIR_VERSION_CONFIGS: Record<FhirVersion, FhirVersionConfig> = {
  [FhirVersion.R4]: {
    version: FhirVersion.R4,
    display: 'FHIR R4 (4.0.1)',
    description: 'FHIR Release 4 - Stabile Version, weit verbreitet',
    validationEndpoint: 'https://hapi.fhir.org/baseR4/TestScript/$validate',
    packagePath: 'fhir/r4',
    capabilities: ['TestScript', 'OperationOutcome', 'Bundle']
  },
  [FhirVersion.R5]: {
    version: FhirVersion.R5,
    display: 'FHIR R5 (5.0.0)',
    description: 'FHIR Release 5 - Neueste Version mit erweiterten Features',
    validationEndpoint: 'https://hapi.fhir.org/baseR5/TestScript/$validate',
    packagePath: 'fhir/r5',
    isDefault: true,
    capabilities: ['TestScript', 'OperationOutcome', 'Bundle', 'TestReport']
  }
}

export const DEFAULT_FHIR_VERSION = FhirVersion.R5

/**
 * Get configuration for a specific FHIR version
 */
export function getFhirVersionConfig(version: FhirVersion): FhirVersionConfig {
  return FHIR_VERSION_CONFIGS[version]
}

/**
 * Get all available FHIR versions
 */
export function getAvailableFhirVersions(): FhirVersionConfig[] {
  return Object.values(FHIR_VERSION_CONFIGS)
}

/**
 * Check if a FHIR version is supported
 */
export function isSupportedFhirVersion(version: string): version is FhirVersion {
  return Object.values(FhirVersion).includes(version as FhirVersion)
}

/**
 * Get FHIR version from string with fallback
 */
export function parseFhirVersion(version?: string): FhirVersion {
  if (version && isSupportedFhirVersion(version)) {
    return version
  }
  return DEFAULT_FHIR_VERSION
}
