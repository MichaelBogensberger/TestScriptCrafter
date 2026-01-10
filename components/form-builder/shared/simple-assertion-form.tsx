"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import type { TestScriptSetupActionAssert } from "@/types/fhir-enhanced"

interface SimpleAssertionFormProps {
  assertion: TestScriptSetupActionAssert
  updateAssertion: (assertion: TestScriptSetupActionAssert) => void
  removeAssertion: () => void
  responseOptions: Array<TestScriptSetupActionAssert["response"]>
  directionOptions: Array<TestScriptSetupActionAssert["direction"]>
  operatorOptions: Array<TestScriptSetupActionAssert["operator"]>
  errors?: {
    description?: string
    response?: string
  }
}

/**
 * Simplified Assertion Form without nested Requirements
 * Focused on the most important Assertion fields
 */
export function SimpleAssertionForm({
  assertion,
  updateAssertion,
  removeAssertion,
  responseOptions,
  directionOptions,
  operatorOptions,
  errors,
}: SimpleAssertionFormProps) {
  const updateField = <K extends keyof TestScriptSetupActionAssert>(
    field: K,
    value: TestScriptSetupActionAssert[K]
  ) => {
    updateAssertion({
      ...assertion,
      [field]: value,
    })
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Assertion Configuration</h5>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeAssertion}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      <div>
        <Label htmlFor="assertion-label">Label</Label>
        <Input
          id="assertion-label"
          value={assertion.label ?? ""}
          onChange={(e) => updateField("label", e.target.value || undefined)}
          placeholder="Short name for this assertion"
        />
      </div>

      <div>
        <Label htmlFor="assertion-description">Description</Label>
        <Textarea
          id="assertion-description"
          value={assertion.description ?? ""}
          onChange={(e) => updateField("description", e.target.value || undefined)}
          placeholder="What is being checked?"
          rows={2}
        />
        {errors?.description && (
          <p className="text-xs text-destructive mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-direction">Direction</Label>
          <Select
            value={assertion.direction ?? ""}
            onValueChange={(value) => updateField("direction", value as typeof assertion.direction)}
          >
            <SelectTrigger id="assertion-direction">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {directionOptions.map((direction) => (
                <SelectItem key={direction ?? ""} value={direction ?? ""}>
                  {direction}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assertion-response">Expected Response</Label>
          <Select
            value={assertion.response ?? ""}
            onValueChange={(value) => updateField("response", value as typeof assertion.response)}
          >
            <SelectTrigger id="assertion-response">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {responseOptions.map((response) => (
                <SelectItem key={response ?? ""} value={response ?? ""}>
                  {response}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.response && (
            <p className="text-xs text-destructive mt-1">{errors.response}</p>
          )}
        </div>

        <div>
          <Label htmlFor="assertion-operator">Operator</Label>
          <Select
            value={assertion.operator ?? ""}
            onValueChange={(value) => updateField("operator", value as typeof assertion.operator)}
          >
            <SelectTrigger id="assertion-operator">
              <SelectValue placeholder="Comparison" />
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((operator) => (
                <SelectItem key={operator ?? ""} value={operator ?? ""}>
                  {operator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="assertion-response-code">Response Code</Label>
          <Input
            id="assertion-response-code"
            value={assertion.responseCode ?? ""}
            onChange={(e) => updateField("responseCode", e.target.value || undefined)}
            placeholder="z.B. 200 oder 200,201"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Einzelner Code (200) oder mehrere kommagetrennt (200,201)
          </p>
        </div>

        <div>
          <Label htmlFor="assertion-content-type">Content-Type</Label>
          <Select
            value={assertion.contentType ?? "__none__"}
            onValueChange={(value) => updateField("contentType", value === "__none__" ? undefined : value)}
          >
            <SelectTrigger id="assertion-content-type">
              <SelectValue placeholder="Select content type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-- Kein --</SelectItem>
              <SelectItem value="application/fhir+json">application/fhir+json</SelectItem>
              <SelectItem value="application/fhir+xml">application/fhir+xml</SelectItem>
              <SelectItem value="application/json+fhir">application/json+fhir</SelectItem>
              <SelectItem value="application/xml+fhir">application/xml+fhir</SelectItem>
              <SelectItem value="application/json">application/json</SelectItem>
              <SelectItem value="application/xml">application/xml</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-resource">Resource Type</Label>
          <Input
            id="assertion-resource"
            value={assertion.resource ?? ""}
            onChange={(e) => updateField("resource", e.target.value || undefined)}
            placeholder="z.B. Patient, Bundle"
          />
        </div>
        <div>
          <Label htmlFor="assertion-path">Path (FHIRPath)</Label>
          <Input
            id="assertion-path"
            value={assertion.path ?? ""}
            onChange={(e) => updateField("path", e.target.value || undefined)}
            placeholder="z.B. Bundle.entry.count()"
          />
        </div>
        <div>
          <Label htmlFor="assertion-value">Expected Value</Label>
          <Input
            id="assertion-value"
            value={assertion.value ?? ""}
            onChange={(e) => updateField("value", e.target.value || undefined)}
            placeholder="Erwarteter Wert"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="assertion-expression">Expression (Alternative zu Path)</Label>
        <Input
          id="assertion-expression"
          value={assertion.expression ?? ""}
          onChange={(e) => updateField("expression", e.target.value || undefined)}
          placeholder="z.B. Bundle.entry.count() > 0"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="assertion-validate-profile">Validate Profile ID</Label>
          <Input
            id="assertion-validate-profile"
            value={assertion.validateProfileId ?? ""}
            onChange={(e) => updateField("validateProfileId", e.target.value || undefined)}
            placeholder="z.B. patient-profile"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Referenziert ein im Profile-Abschnitt definiertes Profil
          </p>
        </div>
        <div>
          <Label htmlFor="assertion-source-id">Source ID</Label>
          <Input
            id="assertion-source-id"
            value={assertion.sourceId ?? ""}
            onChange={(e) => updateField("sourceId", e.target.value || undefined)}
            placeholder="Fixture ID zur Validierung"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="assertion-warning"
            checked={assertion.warningOnly ?? false}
            onCheckedChange={(checked) => updateField("warningOnly", checked)}
          />
          <Label htmlFor="assertion-warning" className="text-sm">
            Warning Only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="assertion-stop"
            checked={assertion.stopTestOnFail ?? true}
            onCheckedChange={(checked) => updateField("stopTestOnFail", checked)}
          />
          <Label htmlFor="assertion-stop" className="text-sm">
            Stop on Failure
          </Label>
        </div>
      </div>
    </Card>
  )
}
