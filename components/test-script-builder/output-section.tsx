"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Eye } from "lucide-react"
import type { TestScript } from "@/types/fhir-enhanced"
import { OutputViewer } from "@/components/output-viewer"

interface OutputSectionProps {
  testScript: TestScript
}

/**
 * Output-Sektion für den TestScript Builder
 * Zeigt die Live-Vorschau des TestScripts an
 */
export function OutputSection({ testScript }: OutputSectionProps) {
  const testCount = testScript.test?.length || 0
  const actionCount = testScript.test?.reduce((sum, test) => sum + (test.action?.length || 0), 0) || 0

  return (
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
              <Eye className="h-3 w-3 mr-1" />
              Live Update
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {testCount} Tests • {actionCount} Aktionen
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <OutputViewer testScript={testScript} />
      </CardContent>
    </Card>
  )
}
