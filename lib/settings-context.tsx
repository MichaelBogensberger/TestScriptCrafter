"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface AppSettings {
  showMetadataCapabilities: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  showMetadataCapabilities: false,
}

interface SettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'testscript-crafter-settings'

/**
 * Provider für App-weite Einstellungen
 * Speichert Einstellungen in localStorage
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }, [settings])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Hook für Zugriff auf Settings Context
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext)
  
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  
  return context
}

