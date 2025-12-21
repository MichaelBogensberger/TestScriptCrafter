"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react"
import { importTestScriptFromFile } from "@/lib/test-script-import"
import type { TestScript, OperationOutcome } from "@/types/fhir-enhanced"
import { useCurrentFhirVersion } from "@/lib/fhir-version-context"
import { toast } from "sonner"

interface TestScriptImportProps {
  onImport: (testScript: TestScript) => void
}

/**
 * Komponente für den Import von TestScripts aus JSON/XML Dateien
 */
export function TestScriptImport({ onImport }: TestScriptImportProps) {
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    errors?: string[]
    validationResult?: OperationOutcome
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFhirVersion = useCurrentFhirVersion()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const result = await importTestScriptFromFile(file, currentFhirVersion)

      if (result.success && result.testScript) {
        // Show toast message for successful import
        const hasWarnings = result.validationResult?.issue && result.validationResult.issue.length > 0
        if (hasWarnings) {
          toast.success("TestScript imported successfully", {
            description: `${result.validationResult.issue.length} hint(s) present`,
          })
        } else {
          toast.success("TestScript imported successfully")
        }

        // Importiere sofort und schließe Dialog
        onImport(result.testScript)
        setOpen(false)
        setImportResult(null)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setImportResult({
          success: false,
          errors: result.errors,
          validationResult: result.validationResult,
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Unexpected error: ${error instanceof Error ? error.message : String(error)}`],
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setImportResult(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import TestScript</DialogTitle>
          <DialogDescription>
            Select a JSON or XML file to import an existing TestScript.
            The file will be automatically validated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="testscript-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isImporting ? (
                  <Loader2 className="w-10 h-10 mb-3 text-muted-foreground animate-spin" />
                ) : (
                  <FileText className="w-10 h-10 mb-3 text-muted-foreground" />
                )}
                <p className="mb-2 text-sm text-muted-foreground">
                  {isImporting ? (
                    <span>Importing and validating...</span>
                  ) : (
                    <span className="font-semibold">Click to select</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Any file with JSON or XML content (max. 10MB)</p>
              </div>
              <input
                id="testscript-file"
                ref={fileInputRef}
                type="file"
                accept=".json,.xml,application/json,text/xml,text/plain,*/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
            </label>
          </div>

          {importResult && !importResult.success && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import failed</AlertTitle>
              <AlertDescription className="mt-2">
                <div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                  {importResult.validationResult?.issue &&
                    importResult.validationResult.issue.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Validation errors:</p>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          {importResult.validationResult.issue.map((issue, index) => (
                            <li key={index}>
                              {issue.diagnostics || issue.code}
                              {issue.location && issue.location.length > 0 && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  (Path: {issue.location.join(".")})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

