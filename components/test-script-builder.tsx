"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Settings } from "lucide-react"
import FormBuilder from "@/components/form-builder/form-builder"
import { OutputViewer } from "@/components/output-viewer"
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: TestScript Builder */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-background to-muted/20 border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">TestScript Builder</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Konfiguriere dein FHIR TestScript Schritt für Schritt
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FormBuilder testScript={testScript} updateTestScript={updateTestScript} updateSection={updateSection} />
          </CardContent>
        </Card>
      </div>

      {/* Right column: Output Viewer */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-background to-muted/20 border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Code className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Live Vorschau</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Echtzeit-Vorschau deines TestScripts
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                Live Update
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <OutputViewer testScript={testScript} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
