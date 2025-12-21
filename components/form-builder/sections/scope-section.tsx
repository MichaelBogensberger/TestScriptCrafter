"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { TestScript, TestScriptScope, CodeableConcept } from "@/types/fhir-enhanced"

interface ScopeSectionProps {
  scopes: TestScript["scope"]
  updateScopes: (scopes: TestScript["scope"]) => void
}

const defaultConcept = (): CodeableConcept => ({
  coding: [],
})

export function ScopeSection({ scopes, updateScopes }: ScopeSectionProps) {
  const entries = useMemo(() => scopes ?? [], [scopes])

  const addScope = () => {
    const scope: TestScriptScope = {
      artifact: "",
    }
    updateScopes([...(entries ?? []), scope])
  }

  const updateScope = (idx: number, scope: TestScriptScope) => {
    const next = [...entries]
    next[idx] = scope
    updateScopes(next)
  }

  const removeScope = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateScopes(next.length > 0 ? next : undefined)
  }

  const updateConcept = (
    scope: TestScriptScope,
    key: "conformance" | "phase",
    field: "system" | "code" | "display",
    value: string,
  ): TestScriptScope => {
    const concept = scope[key] ?? defaultConcept()
    const coding = concept.coding?.[0] ?? { system: "", code: "" }
    const nextCoding = {
      ...coding,
      [field]: value,
    }

    return {
      ...scope,
      [key]: {
        ...concept,
        coding: [nextCoding],
        text: concept.text,
      },
    }
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Scope</h4>
          <p className="text-xs text-muted-foreground">
            Define which artifacts this TestScript covers and what expectations exist.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addScope} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Scope
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          No scopes defined yet.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((scope, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor={`scope-${idx}-artifact`}>
                      Artifact <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`scope-${idx}-artifact`}
                      value={scope.artifact ?? ""}
                      onChange={(event) =>
                        updateScope(idx, { ...scope, artifact: event.target.value })
                      }
                      placeholder="Canonical URL or reference"
                      required
                      className={!scope.artifact?.trim() ? "border-red-500" : ""}
                    />
                    {!scope.artifact?.trim() && (
                      <p className="text-xs text-red-500 mt-1">Artifact is required</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label htmlFor={`scope-${idx}-conformance-system`}>Conformance System</Label>
                      <Input
                        id={`scope-${idx}-conformance-system`}
                        value={scope.conformance?.coding?.[0]?.system ?? ""}
                        onChange={(event) =>
                          updateScope(
                            idx,
                            updateConcept(scope, "conformance", "system", event.target.value),
                          )
                        }
                        placeholder="System"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`scope-${idx}-conformance-code`}>Conformance Code</Label>
                      <Input
                        id={`scope-${idx}-conformance-code`}
                        value={scope.conformance?.coding?.[0]?.code ?? ""}
                        onChange={(event) =>
                          updateScope(
                            idx,
                            updateConcept(scope, "conformance", "code", event.target.value),
                          )
                        }
                        placeholder="Code"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`scope-${idx}-conformance-display`}>Conformance Display</Label>
                      <Input
                        id={`scope-${idx}-conformance-display`}
                        value={scope.conformance?.coding?.[0]?.display ?? ""}
                        onChange={(event) =>
                          updateScope(
                            idx,
                            updateConcept(scope, "conformance", "display", event.target.value),
                          )
                        }
                        placeholder="Display"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label htmlFor={`scope-${idx}-phase-system`}>Phase System</Label>
                      <Input
                        id={`scope-${idx}-phase-system`}
                        value={scope.phase?.coding?.[0]?.system ?? ""}
                        onChange={(event) =>
                          updateScope(idx, updateConcept(scope, "phase", "system", event.target.value))
                        }
                        placeholder="System"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`scope-${idx}-phase-code`}>Phase Code</Label>
                      <Input
                        id={`scope-${idx}-phase-code`}
                        value={scope.phase?.coding?.[0]?.code ?? ""}
                        onChange={(event) =>
                          updateScope(idx, updateConcept(scope, "phase", "code", event.target.value))
                        }
                        placeholder="Code"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`scope-${idx}-phase-display`}>Phase Display</Label>
                      <Input
                        id={`scope-${idx}-phase-display`}
                        value={scope.phase?.coding?.[0]?.display ?? ""}
                        onChange={(event) =>
                          updateScope(
                            idx,
                            updateConcept(scope, "phase", "display", event.target.value),
                          )
                        }
                        placeholder="Display"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-8 text-destructive"
                  onClick={() => removeScope(idx)}
                  title="Remove scope"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

