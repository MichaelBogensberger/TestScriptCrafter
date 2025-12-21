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
 * Vereinfachte Assertion-Form ohne verschachtelte Requirements
 * Fokussiert auf die wichtigsten Assertion-Felder
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
          <Label htmlFor="assertion-value">Expected Value</Label>
          <Input
            id="assertion-value"
            value={assertion.value ?? ""}
            onChange={(e) => updateField("value", e.target.value || undefined)}
            placeholder="e.g. Patient, 200, ..."
          />
        </div>
        <div>
          <Label htmlFor="assertion-expression">FHIRPath Expression</Label>
          <Input
            id="assertion-expression"
            value={assertion.expression ?? ""}
            onChange={(e) => updateField("expression", e.target.value || undefined)}
            placeholder="e.g. Bundle.entry.count()"
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
