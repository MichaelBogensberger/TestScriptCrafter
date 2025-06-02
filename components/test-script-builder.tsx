"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Code } from "lucide-react"
import FormBuilder from "@/components/form-builder/form-builder"
import OutputViewer from "@/components/output-viewer"
import type { TestScript } from "@/types/test-script"
import { initialTestScript } from "@/lib/initial-data"

/**
 * Main TestScript Builder component that manages the overall state and layout
 */
export default function TestScriptBuilder() {
  // State for the TestScript data
  const [testScript, setTestScript] = useState<TestScript>(initialTestScript)

  /**
   * Updates the TestScript data with new values
   * @param newData - Partial TestScript data to merge with the current state
   */
  const updateTestScript = (newData: Partial<TestScript>) => {
    setTestScript((prev) => ({ ...prev, ...newData }))
  }

  /**
   * Updates a specific section of the TestScript
   * @param section - The section to update (e.g., 'metadata', 'setup')
   * @param data - The new data for the section
   */
  const updateSection = (section: keyof TestScript, data: any) => {
    setTestScript((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: TestScript Builder */}
      <Card className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">TestScript Builder</h2>
        </div>

        {/* Form Builder component */}
        <FormBuilder testScript={testScript} updateTestScript={updateTestScript} updateSection={updateSection} />
      </Card>

      {/* Right column: Output Viewer */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Output</h2>
          <Code className="h-5 w-5" />
        </div>
        <OutputViewer testScript={testScript} />
      </Card>
    </div>
  )
}
