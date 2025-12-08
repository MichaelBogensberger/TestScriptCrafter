"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, CheckCircle, AlertCircle } from "lucide-react"
import type { TestScript, TestScriptStatus } from "@/types/fhir-enhanced"
import { TestScriptImport } from "./test-script-import"

interface HeaderSectionProps {
  testScript: TestScript
  isValidTestScript: boolean
  getStatusBadgeVariant: (status: TestScriptStatus) => "default" | "secondary" | "destructive" | "outline"
  onImport: (testScript: TestScript) => void
}

/**
 * Header-Sektion für den TestScript Builder
 * Zeigt Status, Validierung und grundlegende Informationen an
 */
export function HeaderSection({ 
  testScript, 
  isValidTestScript, 
  getStatusBadgeVariant,
  onImport
}: HeaderSectionProps) {
  return (
    <Card className="relative bg-card/95 backdrop-blur-sm overflow-hidden">
      <div className="relative z-10">
        <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">TestScript Builder</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Konfiguriere dein FHIR TestScript Schritt für Schritt
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TestScriptImport onImport={onImport} />
            <Badge variant={getStatusBadgeVariant(testScript.status as TestScriptStatus)}>
              {testScript.status}
            </Badge>
            {testScript.experimental && (
              <Badge variant="secondary">Experimentell</Badge>
            )}
            {!isValidTestScript && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Ungültig
              </Badge>
            )}
            {isValidTestScript && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Gültig
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Name:</span>
            <p className="font-mono">{testScript.name || "Nicht gesetzt"}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">URL:</span>
            <p className="font-mono truncate">{testScript.url || "Nicht gesetzt"}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Tests:</span>
            <p className="font-mono">{testScript.test?.length || 0} Testfälle</p>
          </div>
        </div>
      </CardContent>
      </div>
    </Card>
  )
}
