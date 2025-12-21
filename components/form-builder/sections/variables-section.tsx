"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { TestScript, TestScriptVariable } from "@/types/fhir-enhanced"

interface VariablesSectionProps {
  variables: TestScript["variable"]
  updateVariables: (variables: TestScript["variable"]) => void
}

export function VariablesSection({ variables, updateVariables }: VariablesSectionProps) {
  const entries = useMemo(() => variables ?? [], [variables])

  const addVariable = () => {
    const newVariable: TestScriptVariable = {
      name: `variable-${entries.length + 1}`,
    }
    updateVariables([...(entries ?? []), newVariable])
  }

  const updateVariable = (idx: number, variable: TestScriptVariable) => {
    const next = [...entries]
    next[idx] = variable
    updateVariables(next)
  }

  const removeVariable = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateVariables(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Variables</h4>
          <p className="text-xs text-muted-foreground">
            Placeholders that can be used for expressions, headers or paths.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addVariable} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Variable
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No variables created yet."
          description="Add parameters that will be replaced during execution."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((variable, idx) => (
            <Card key={variable.name ?? idx} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`variable-${idx}-name`}>
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`variable-${idx}-name`}
                        value={variable.name ?? ""}
                        onChange={(event) =>
                          updateVariable(idx, { ...variable, name: event.target.value })
                        }
                        placeholder="e.g. accessToken"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`variable-${idx}-default`}>Default Value</Label>
                      <Input
                        id={`variable-${idx}-default`}
                        value={variable.defaultValue ?? ""}
                        onChange={(event) =>
                          updateVariable(idx, {
                            ...variable,
                            defaultValue: event.target.value || undefined,
                          })
                        }
                        placeholder="Optional default value"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`variable-${idx}-description`}>Description</Label>
                    <Textarea
                      id={`variable-${idx}-description`}
                      value={variable.description ?? ""}
                      onChange={(event) =>
                        updateVariable(idx, {
                          ...variable,
                          description: event.target.value || undefined,
                        })
                      }
                      rows={2}
                      placeholder="Zweck der Variable"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`variable-${idx}-expression`}>Expression</Label>
                      <Input
                        id={`variable-${idx}-expression`}
                        value={variable.expression ?? ""}
                        onChange={(event) =>
                          updateVariable(idx, {
                            ...variable,
                            expression: event.target.value || undefined,
                          })
                        }
                        placeholder="FHIRPath oder JSONPath"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`variable-${idx}-path`}>Path</Label>
                      <Input
                        id={`variable-${idx}-path`}
                        value={variable.path ?? ""}
                        onChange={(event) =>
                          updateVariable(idx, { ...variable, path: event.target.value || undefined })
                        }
                        placeholder="Pfad im Fixture"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`variable-${idx}-header`}>Header Field</Label>
                      <Input
                        id={`variable-${idx}-header`}
                        value={variable.headerField ?? ""}
                        onChange={(event) =>
                          updateVariable(idx, {
                            ...variable,
                            headerField: event.target.value || undefined,
                          })
                        }
                        placeholder="HTTP Header Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`variable-${idx}-source`}>Source ID</Label>
                      <Input
                        id={`variable-${idx}-source`}
                        value={variable.sourceId ?? ""}
                        onChange={(event) =>
                          updateVariable(idx, {
                            ...variable,
                            sourceId: event.target.value || undefined,
                          })
                        }
                        placeholder="Fixture- oder Antwort-ID"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`variable-${idx}-hint`}>Hinweis</Label>
                    <Input
                      id={`variable-${idx}-hint`}
                      value={variable.hint ?? ""}
                      onChange={(event) =>
                        updateVariable(idx, { ...variable, hint: event.target.value || undefined })
                      }
                      placeholder="Hint text for users"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-8 text-destructive"
                  onClick={() => removeVariable(idx)}
                  title="Remove variable"
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

