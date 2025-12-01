"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FhirVersion, DEFAULT_FHIR_VERSION, getFhirVersionConfig, FhirVersionConfig } from '@/types/fhir-config'

interface FhirVersionContextType {
  /** Aktuell ausgewählte FHIR Version */
  currentVersion: FhirVersion
  /** Konfiguration der aktuellen Version */
  currentConfig: FhirVersionConfig
  /** Alle verfügbaren Versionen */
  availableVersions: FhirVersion[]
  /** Version ändern */
  setVersion: (version: FhirVersion) => void
  /** Prüfen ob eine spezifische Version aktiv ist */
  isVersion: (version: FhirVersion) => boolean
}

const FhirVersionContext = createContext<FhirVersionContextType | undefined>(undefined)

interface FhirVersionProviderProps {
  children: ReactNode
  /** Initiale FHIR Version - optional, Standard ist R5 */
  initialVersion?: FhirVersion
}

/**
 * Provider für FHIR Version Management
 * Stellt globalen Zugriff auf aktuelle FHIR Version bereit
 */
export function FhirVersionProvider({ 
  children, 
  initialVersion = DEFAULT_FHIR_VERSION 
}: FhirVersionProviderProps) {
  const [currentVersion, setCurrentVersion] = useState<FhirVersion>(initialVersion)

  const currentConfig = getFhirVersionConfig(currentVersion)
  const availableVersions = Object.values(FhirVersion)

  const setVersion = useCallback((version: FhirVersion) => {
    console.log(`FHIR Version geändert: ${currentVersion} → ${version}`)
    setCurrentVersion(version)
  }, [currentVersion])

  const isVersion = useCallback((version: FhirVersion) => {
    return currentVersion === version
  }, [currentVersion])

  const value: FhirVersionContextType = {
    currentVersion,
    currentConfig,
    availableVersions,
    setVersion,
    isVersion
  }

  return (
    <FhirVersionContext.Provider value={value}>
      {children}
    </FhirVersionContext.Provider>
  )
}

/**
 * Hook für Zugriff auf FHIR Version Context
 * Muss innerhalb eines FhirVersionProvider verwendet werden
 */
export function useFhirVersion(): FhirVersionContextType {
  const context = useContext(FhirVersionContext)
  
  if (context === undefined) {
    throw new Error('useFhirVersion muss innerhalb eines FhirVersionProvider verwendet werden')
  }
  
  return context
}

/**
 * Hook für einfachen Zugriff auf aktuelle FHIR Version
 */
export function useCurrentFhirVersion(): FhirVersion {
  const { currentVersion } = useFhirVersion()
  return currentVersion
}

/**
 * Hook für Zugriff auf aktuelle FHIR Version Konfiguration
 */
export function useCurrentFhirConfig(): FhirVersionConfig {
  const { currentConfig } = useFhirVersion()
  return currentConfig
}
