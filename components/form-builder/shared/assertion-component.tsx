"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type {
  TestScriptSetupActionAssert,
  TestScriptSetupActionAssertRequirement,
} from "@/types/fhir-enhanced"
import type {
  TestScriptSetupActionAssertDirection,
  TestScriptSetupActionAssertOperator,
  TestScriptSetupActionAssertResponse,
  TestScriptSetupActionOperationMethod,
} from "fhir/r5"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssertionComponentProps {
  assertion: TestScriptSetupActionAssert
  updateAssertion: (assertion: TestScriptSetupActionAssert) => void
  removeAssertion: () => void
  responseOptions: { value: TestScriptSetupActionAssertResponse; label: string }[]
  directionOptions: { value: TestScriptSetupActionAssertDirection; label: string }[]
  operatorOptions: { value: TestScriptSetupActionAssertOperator; label: string }[]
  requestMethodOptions: { value: TestScriptSetupActionOperationMethod; label: string }[]
  onAddRequirement: (
    current: TestScriptSetupActionAssertRequirement[] | undefined,
  ) => TestScriptSetupActionAssertRequirement[]
  onRemoveRequirement: (
    current: TestScriptSetupActionAssertRequirement[] | undefined,
    index: number,
  ) => TestScriptSetupActionAssertRequirement[] | undefined
  errors?: {
    description?: string
    response?: string
  }
}

export function AssertionComponent({
  assertion,
  updateAssertion,
  removeAssertion,
  responseOptions,
  directionOptions,
  operatorOptions,
  requestMethodOptions,
  onAddRequirement,
  onRemoveRequirement,
  errors,
}: AssertionComponentProps) {
  const updateField = <TKey extends keyof TestScriptSetupActionAssert>(
    field: TKey,
    value: TestScriptSetupActionAssert[TKey],
  ) => {
    updateAssertion({ ...assertion, [field]: value })
  }

  const addRequirement = () => {
    updateField("requirement", onAddRequirement(assertion.requirement))
  }

  const updateRequirement = (
    index: number,
    field: keyof TestScriptSetupActionAssertRequirement,
    value: string | undefined,
  ) => {
    const requirements = [...(assertion.requirement ?? [])]
    requirements[index] = {
      ...requirements[index],
      [field]: value,
    }
    updateField("requirement", requirements)
  }

  const removeRequirement = (index: number) => {
    updateField("requirement", onRemoveRequirement(assertion.requirement, index))
  }

  return (
    <Card className="space-y-4 bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Assertion</h5>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={removeAssertion}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="assertion-label">Label</Label>
          <Input
            id="assertion-label"
            value={assertion.label ?? ""}
            onChange={(event) => updateField("label", event.target.value || undefined)}
          />
        </div>
        <div>
          <Label htmlFor="assertion-description">Beschreibung</Label>
          <Textarea
            id="assertion-description"
            value={assertion.description ?? ""}
            onChange={(event) => updateField("description", event.target.value || undefined)}
            rows={2}
            placeholder="Beschreibung der Assertion"
            className={cn(errors?.description && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={Boolean(errors?.description)}
          />
          {errors?.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-direction">Richtung</Label>
          <Select
            value={assertion.direction ?? ""}
            onValueChange={(value) => updateField("direction", value as typeof assertion.direction)}
          >
            <SelectTrigger id="assertion-direction">
              <SelectValue placeholder="Richtung wählen" />
            </SelectTrigger>
            <SelectContent>
              {directionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assertion-response">Erwartete Antwort</Label>
          <Select
            value={assertion.response ?? ""}
            onValueChange={(value) => updateField("response", value as TestScriptSetupActionAssertResponse)}
            aria-invalid={Boolean(errors?.response)}
          >
            <SelectTrigger id="assertion-response">
              <SelectValue placeholder="Antwort auswählen" />
            </SelectTrigger>
            <SelectContent>
              {responseOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.response && <p className="text-xs text-destructive">{errors.response}</p>}
        </div>
        <div>
          <Label htmlFor="assertion-response-code">Erwarteter Statuscode</Label>
          <Input
            id="assertion-response-code"
            value={assertion.responseCode ?? ""}
            onChange={(event) => updateField("responseCode", event.target.value || undefined)}
            placeholder="z. B. 200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-operator">Operator</Label>
          <Select
            value={assertion.operator ?? ""}
            onValueChange={(value) => updateField("operator", value as typeof assertion.operator)}
          >
            <SelectTrigger id="assertion-operator">
              <SelectValue placeholder="Operator wählen" />
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assertion-request-method">Request Methode</Label>
          <Select
            value={assertion.requestMethod ?? ""}
            onValueChange={(value) =>
              updateField("requestMethod", value as typeof assertion.requestMethod)
            }
          >
            <SelectTrigger id="assertion-request-method">
              <SelectValue placeholder="HTTP Methode" />
            </SelectTrigger>
            <SelectContent>
              {requestMethodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label?.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assertion-request-url">Request URL</Label>
          <Input
            id="assertion-request-url"
            value={assertion.requestURL ?? ""}
            onChange={(event) => updateField("requestURL", event.target.value || undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-resource">Resource</Label>
          <Input
            id="assertion-resource"
            value={assertion.resource ?? ""}
            onChange={(event) => updateField("resource", event.target.value || undefined)}
            placeholder="Erwarteter Resource-Typ"
          />
        </div>
        <div>
          <Label htmlFor="assertion-path">Pfad</Label>
          <Input
            id="assertion-path"
            value={assertion.path ?? ""}
            onChange={(event) => updateField("path", event.target.value || undefined)}
            placeholder="FHIRPath"
          />
        </div>
        <div>
          <Label htmlFor="assertion-value">Erwarteter Wert</Label>
          <Input
            id="assertion-value"
            value={assertion.value ?? ""}
            onChange={(event) => updateField("value", event.target.value || undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-compare-id">Compare To Source ID</Label>
          <Input
            id="assertion-compare-id"
            value={assertion.compareToSourceId ?? ""}
            onChange={(event) =>
              updateField("compareToSourceId", event.target.value || undefined)
            }
          />
        </div>
        <div>
          <Label htmlFor="assertion-compare-path">Compare To Source Path</Label>
          <Input
            id="assertion-compare-path"
            value={assertion.compareToSourcePath ?? ""}
            onChange={(event) =>
              updateField("compareToSourcePath", event.target.value || undefined)
            }
          />
        </div>
        <div>
          <Label htmlFor="assertion-compare-expression">Compare Expression</Label>
          <Input
            id="assertion-compare-expression"
            value={assertion.compareToSourceExpression ?? ""}
            onChange={(event) =>
              updateField("compareToSourceExpression", event.target.value || undefined)
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-content-type">Content Type</Label>
          <Input
            id="assertion-content-type"
            value={assertion.contentType ?? ""}
            onChange={(event) => updateField("contentType", event.target.value || undefined)}
          />
        </div>
        <div>
          <Label htmlFor="assertion-header-field">Header Field</Label>
          <Input
            id="assertion-header-field"
            value={assertion.headerField ?? ""}
            onChange={(event) => updateField("headerField", event.target.value || undefined)}
          />
        </div>
        <div>
          <Label htmlFor="assertion-source-id">Source ID</Label>
          <Input
            id="assertion-source-id"
            value={assertion.sourceId ?? ""}
            onChange={(event) => updateField("sourceId", event.target.value || undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="assertion-validate-profile">Validate Profile ID</Label>
          <Input
            id="assertion-validate-profile"
            value={assertion.validateProfileId ?? ""}
            onChange={(event) =>
              updateField("validateProfileId", event.target.value || undefined)
            }
          />
        </div>
        <div>
          <Label htmlFor="assertion-minimum-id">Minimum ID</Label>
          <Input
            id="assertion-minimum-id"
            value={assertion.minimumId ?? ""}
            onChange={(event) => updateField("minimumId", event.target.value || undefined)}
          />
        </div>
        <div>
          <Label htmlFor="assertion-expression">Expression</Label>
          <Textarea
            id="assertion-expression"
            rows={2}
            value={assertion.expression ?? ""}
            onChange={(event) => updateField("expression", event.target.value || undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="assertion-details-text">Details Text</Label>
          <Input
            id="assertion-details-text"
            value={assertion.details?.text ?? ""}
            onChange={(event) =>
              updateField("details", {
                ...assertion.details,
                text: event.target.value || undefined,
              })
            }
          />
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assertion-navigation-links">Navigation Links</Label>
              <p className="text-xs text-muted-foreground">Bundle enthält Links first/last/next.</p>
            </div>
            <Switch
              id="assertion-navigation-links"
              checked={assertion.navigationLinks ?? false}
              onCheckedChange={(checked) => updateField("navigationLinks", checked)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assertion-warning-only">Warning Only</Label>
              <p className="text-xs text-muted-foreground">
                Bei Fehlern nur Warnungen ausgeben, Test fortsetzen.
              </p>
            </div>
            <Switch
              id="assertion-warning-only"
              checked={assertion.warningOnly ?? false}
              onCheckedChange={(checked) => updateField("warningOnly", checked)}
            />
          </div>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assertion-stop-on-fail">Stop Test on Fail</Label>
              <p className="text-xs text-muted-foreground">
                Bei Fehlern Ausführung abbrechen.
              </p>
            </div>
            <Switch
              id="assertion-stop-on-fail"
              checked={assertion.stopTestOnFail ?? false}
              onCheckedChange={(checked) => updateField("stopTestOnFail", checked)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <h6 className="text-sm font-medium">Requirements</h6>
          <Button variant="ghost" size="sm" onClick={addRequirement} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Requirement
          </Button>
        </div>

        {(assertion.requirement ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Keine Requirement-Verweise definiert. Optional können Links zur Spezifikation ergänzt werden.
          </p>
        ) : (
          <div className="space-y-2">
            {assertion.requirement?.map((req, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-md border p-3"
              >
                <Input
                  value={req.linkUri ?? ""}
                  onChange={(event) => updateRequirement(idx, "linkUri", event.target.value || undefined)}
                  placeholder="Link (URI)"
                />
                <Input
                  value={req.linkCanonical ?? ""}
                  onChange={(event) =>
                    updateRequirement(idx, "linkCanonical", event.target.value || undefined)
                  }
                  placeholder="Link (canonical)"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeRequirement(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export { AssertionComponent }
export default AssertionComponent
