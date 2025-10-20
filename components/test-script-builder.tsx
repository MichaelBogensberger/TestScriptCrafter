"use client"

import { useState, useCallback, useMemo } from "react"
import FormBuilder from "@/components/form-builder/form-builder"
import { HeaderSection } from "./test-script-builder/header-section"
import { OutputSection } from "./test-script-builder/output-section"
import type { TestScript, TestScriptStatus } from "@/types/fhir-enhanced"
import { initialTestScript } from "@/lib/initial-data"

/**
 * Main TestScript Builder component that manages the overall state and layout
 * Optimized with modern React patterns and better type safety
 */
export default function TestScriptBuilder() {
  // State for the TestScript data with proper typing
  const [testScript, setTestScript] = useState<TestScript>(initialTestScript)

  /**
   * Updates the TestScript data with new values using functional updates
   * @param newData - Partial TestScript data to merge with the current state
   */
  const updateTestScript = useCallback((newData: Partial<TestScript>) => {
    setTestScript((prev) => ({ ...prev, ...newData }))
  }, [])

  /**
   * Updates a specific section of the TestScript with type safety
   * @param section - The section to update (e.g., 'metadata', 'setup')
   * @param data - The new data for the section
   */
  const updateSection = useCallback(<K extends keyof TestScript>(
    section: K, 
    data: TestScript[K]
  ) => {
    setTestScript((prev) => ({
      ...prev,
      [section]: data,
    }))
  }, [])

  /**
   * Resets the TestScript to initial state
   */
  const resetTestScript = useCallback(() => {
    setTestScript(initialTestScript)
  }, [])

  /**
   * Validates the current TestScript state
   */
  const isValidTestScript = useMemo(() => {
    return !!(
      testScript.resourceType === "TestScript" &&
      testScript.name &&
      testScript.status &&
      testScript.url
    )
  }, [testScript])

  /**
   * Gets the status badge variant based on the current status
   */
  const getStatusBadgeVariant = useCallback((status: TestScriptStatus) => {
    switch (status) {
      case 'active':
        return 'default' as const
      case 'draft':
        return 'secondary' as const
      case 'retired':
        return 'destructive' as const
      case 'unknown':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: TestScript Builder */}
      <div className="space-y-6">
        <HeaderSection 
          testScript={testScript}
          isValidTestScript={isValidTestScript}
          getStatusBadgeVariant={getStatusBadgeVariant}
        />
        <FormBuilder 
          testScript={testScript} 
          updateTestScript={updateTestScript} 
          updateSection={updateSection} 
        />
      </div>

      {/* Right column: Output Viewer */}
      <div className="space-y-6">
        <OutputSection testScript={testScript} />
      </div>
    </div>
  )
}
