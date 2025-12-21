"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, RotateCcw } from "lucide-react"
import type { TestScript, TestScriptStatus } from "@/types/fhir-enhanced"
import { TestScriptImport } from "./test-script-import"
import Image from "next/image"
import { SettingsDialog } from "@/components/settings-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface HeaderSectionProps {
  testScript: TestScript
  isValidTestScript: boolean
  getStatusBadgeVariant: (status: TestScriptStatus) => "default" | "secondary" | "destructive" | "outline"
  onImport: (testScript: TestScript) => void
  onClear: () => void
}

/**
 * Header-Sektion für den TestScript Builder
 * Zeigt Status, Validierung und grundlegende Informationen an
 */
export function HeaderSection({ 
  testScript, 
  isValidTestScript, 
  getStatusBadgeVariant,
  onImport,
  onClear
}: HeaderSectionProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const handleClear = () => {
    onClear()
    setClearDialogOpen(false)
  }

  return (
    <Card className="relative bg-card/95 backdrop-blur-sm overflow-hidden">
      <div className="relative z-10">
        <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 overflow-hidden rounded-full bg-white shadow-md">
            <Image
              src="/logo.jpg"
              alt="TestScript Crafter Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-xl font-bold">Tinker Tool</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                FHIR TestScript
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your FHIR TestScript step by step
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SettingsDialog />
            <TestScriptImport onImport={onImport} />
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset TestScript?</DialogTitle>
                  <DialogDescription>
                    This action will reset the TestScript to its initial state. 
                    All unsaved changes will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClear}>
                    Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Badge variant={getStatusBadgeVariant(testScript.status as TestScriptStatus)}>
              {testScript.status}
            </Badge>
            {testScript.experimental && (
              <Badge variant="secondary">Experimental</Badge>
            )}
            {!isValidTestScript && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalid
              </Badge>
            )}
            {isValidTestScript && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Valid
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Name:</span>
            <p className="font-mono">{testScript.name || "Not set"}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">URL:</span>
            <p className="font-mono truncate">{testScript.url || "Not set"}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Tests:</span>
            <p className="font-mono">{testScript.test?.length || 0} Test cases</p>
          </div>
        </div>
      </CardContent>
      </div>
    </Card>
  )
}
