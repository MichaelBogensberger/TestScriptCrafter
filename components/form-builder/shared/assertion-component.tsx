"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from "lucide-react"
import type { TestScriptSetupActionAssert } from "@/types/fhir-enhanced"

interface AssertionComponentProps {
  assertion: TestScriptSetupActionAssert
  updateAssertion: (assertion: TestScriptSetupActionAssert) => void
  removeAssertion: () => void
}

/**
 * Component for editing an assertion
 */
export default function AssertionComponent({ assertion, updateAssertion, removeAssertion }: AssertionComponentProps) {
  /**
   * Updates a field in the assertion
   */
  const updateField = <TKey extends keyof TestScriptSetupActionAssert>(
    field: TKey,
    value: TestScriptSetupActionAssert[TKey],
  ) => {
    updateAssertion({ ...assertion, [field]: value })
  }

  return (
    <Card className="p-3 space-y-3 bg-muted/30">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Assertion</h5>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={removeAssertion}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={assertion.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Tracking/reporting assertion description"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Response</Label>
          <Select value={assertion.response || ""} onValueChange={(value) => updateField("response", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select response" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="okay">Okay</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="noContent">No Content</SelectItem>
              <SelectItem value="badRequest">Bad Request</SelectItem>
              <SelectItem value="forbidden">Forbidden</SelectItem>
              <SelectItem value="notFound">Not Found</SelectItem>
              <SelectItem value="internalServerError">Internal Server Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="warning-only">Warning Only</Label>
            <Switch
              id="warning-only"
              checked={assertion.warningOnly || false}
              onCheckedChange={(checked) => updateField("warningOnly", checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">Will this assert produce a warning only on error?</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="stop-test-on-fail">Stop Test On Fail</Label>
          <Switch
            id="stop-test-on-fail"
            checked={assertion.stopTestOnFail || false}
            onCheckedChange={(checked) => updateField("stopTestOnFail", checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground">If this assert fails, will the current test execution stop?</p>
      </div>
    </Card>
  )
}
