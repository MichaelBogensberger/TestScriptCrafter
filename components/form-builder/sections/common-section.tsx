"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { TestScript, TestScriptCommon, TestScriptCommonParameter, TestScriptTestAction } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface CommonSectionProps {
  common: TestScript["common"]
  updateCommon: (common: TestScript["common"]) => void
}

export function CommonSection({ common, updateCommon }: CommonSectionProps) {
  const entries = useMemo(() => common ?? [], [common])

  const addCommon = () => {
    const uniqueKeyBase = `common-${entries.length + 1}`
    const newCommon: TestScriptCommon = {
      key: uniqueKeyBase,
      action: [],
    }
    updateCommon([...(entries ?? []), newCommon])
  }

  const updateEntry = (idx: number, entry: TestScriptCommon) => {
    const next = [...entries]
    next[idx] = entry
    updateCommon(next)
  }

  const removeEntry = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateCommon(next.length > 0 ? next : undefined)
  }

  const addParameter = (entry: TestScriptCommon): TestScriptCommon => {
    const parameter: TestScriptCommonParameter = {
      name: "",
      value: "",
    }
    return {
      ...entry,
      parameter: [...(entry.parameter ?? []), parameter],
    }
  }

  const updateParameter = (
    entry: TestScriptCommon,
    parameterIdx: number,
    parameter: TestScriptCommonParameter,
  ): TestScriptCommon => {
    const params = [...(entry.parameter ?? [])]
    params[parameterIdx] = parameter
    return {
      ...entry,
      parameter: params,
    }
  }

const removeParameter = (entry: TestScriptCommon, parameterIdx: number): TestScriptCommon => {
  const params = (entry.parameter ?? []).filter((_, index) => index !== parameterIdx)
  return {
    ...entry,
    parameter: params.length > 0 ? params : undefined,
  }
}

  const addAction = (entry: TestScriptCommon): TestScriptCommon => ({
    ...entry,
    action: [
      ...(entry.action ?? []),
      {
        operation: {
          encodeRequestUrl: true,
        },
      } as TestScriptTestAction,
    ],
  })

  const updateAction = (
    entry: TestScriptCommon,
    actionIdx: number,
    action: TestScriptTestAction,
  ): TestScriptCommon => {
    const actions = [...(entry.action ?? [])]
    actions[actionIdx] = action
    return {
      ...entry,
      action: actions,
    }
  }

const removeAction = (entry: TestScriptCommon, actionIdx: number): TestScriptCommon => {
  const actions = (entry.action ?? []).filter((_, index) => index !== actionIdx)
  return {
    ...entry,
    action: actions.length > 0 ? actions : [],
  }
}

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Common Actions</h4>
          <p className="text-xs text-muted-foreground">
            Shared actions that can be referenced by their key.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addCommon} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Common Action
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          No common actions defined.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <Card key={entry.key ?? idx} className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`common-${idx}-key`}>Key</Label>
                      <Input
                        id={`common-${idx}-key`}
                        value={entry.key ?? ""}
                        onChange={(event) =>
                          updateEntry(idx, { ...entry, key: event.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`common-${idx}-name`}>Name</Label>
                      <Input
                        id={`common-${idx}-name`}
                        value={entry.name ?? ""}
                        onChange={(event) =>
                          updateEntry(idx, { ...entry, name: event.target.value || undefined })
                        }
                        placeholder="Optional name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`common-${idx}-description`}>Description</Label>
                    <Input
                      id={`common-${idx}-description`}
                      value={entry.description ?? ""}
                      onChange={(event) =>
                        updateEntry(idx, {
                          ...entry,
                          description: event.target.value || undefined,
                        })
                      }
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Parameter</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateEntry(idx, addParameter(entry))}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Parameter
                      </Button>
                    </div>
                    {(entry.parameter ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No parameters defined. Add optional key/value pairs.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {entry.parameter?.map((parameter, parameterIdx) => (
                          <div
                            key={parameterIdx}
                            className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"
                          >
                            <Input
                              value={parameter.name ?? ""}
                              onChange={(event) =>
                                updateEntry(
                                  idx,
                                  updateParameter(entry, parameterIdx, {
                                    ...parameter,
                                    name: event.target.value,
                                  }),
                                )
                              }
                              placeholder="Name"
                            />
                            <Input
                              value={parameter.value ?? ""}
                              onChange={(event) =>
                                updateEntry(
                                  idx,
                                  updateParameter(entry, parameterIdx, {
                                    ...parameter,
                                    value: event.target.value || undefined,
                                  }),
                                )
                              }
                              placeholder="Wert"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() =>
                                updateEntry(idx, removeParameter(entry, parameterIdx))
                              }
                              title="Remove parameter"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Aktionen</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateEntry(idx, addAction(entry))}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Aktion
                      </Button>
                    </div>

                    {(entry.action ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No actions created yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {entry.action?.map((action, actionIdx) => (
                          <ActionComponent
                            key={actionIdx}
                            action={action}
                            index={actionIdx}
                            sectionType="common"
                            updateAction={(updated) =>
                              updateEntry(idx, updateAction(entry, actionIdx, updated))
                            }
                            removeAction={() =>
                              updateEntry(idx, removeAction(entry, actionIdx))
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-8 text-destructive"
                  onClick={() => removeEntry(idx)}
                  title="Remove common block"
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

