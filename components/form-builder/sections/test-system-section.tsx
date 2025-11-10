"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { TestScript, TestSystem } from "@/types/fhir-enhanced"

interface TestSystemSectionProps {
  testSystems: TestScript["testSystem"]
  updateTestSystems: (testSystems: TestScript["testSystem"]) => void
}

export function TestSystemSection({ testSystems, updateTestSystems }: TestSystemSectionProps) {
  const systems = useMemo(() => testSystems ?? [], [testSystems])

  const addSystem = () => {
    const nextIndex =
      systems.reduce((max, system) => Math.max(max, system.index ?? 0), 0) + 1 || 1

    const newSystem: TestSystem = {
      index: nextIndex,
      title: `System ${nextIndex}`,
    }

    updateTestSystems([...(systems ?? []), newSystem])
  }

  const updateSystem = (idx: number, updated: TestSystem) => {
    const next = [...systems]
    next[idx] = updated
    updateTestSystems(next)
  }

  const removeSystem = (idx: number) => {
    const next = systems.filter((_, index) => index !== idx)
    updateTestSystems(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Testsysteme</h4>
          <p className="text-xs text-muted-foreground">
            Definiere optionale Systeme (Clients/Server), die in Aktionen referenziert werden können.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addSystem} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Hinzufügen
        </Button>
      </div>

      {systems.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Noch keine Testsysteme definiert.
        </div>
      ) : (
        <div className="space-y-3">
          {systems.map((system, idx) => (
            <Card key={system.index ?? idx} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`test-system-${idx}-index`}>Index</Label>
                      <Input
                        id={`test-system-${idx}-index`}
                        type="number"
                        min={1}
                        value={system.index ?? ""}
                        onChange={(event) =>
                          updateSystem(idx, { ...system, index: Number(event.target.value) || 1 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`test-system-${idx}-title`}>Titel</Label>
                      <Input
                        id={`test-system-${idx}-title`}
                        value={system.title ?? ""}
                        onChange={(event) =>
                          updateSystem(idx, { ...system, title: event.target.value })
                        }
                        placeholder="z. B. FHIR Server"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`test-system-${idx}-actors`}>Actor Referenzen</Label>
                      <Input
                        id={`test-system-${idx}-actors`}
                        value={system.actor?.join(", ") ?? ""}
                        onChange={(event) =>
                          updateSystem(idx, {
                            ...system,
                            actor: event.target.value
                              .split(",")
                              .map((value) => value.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Liste kanonischer URLs, getrennt durch Kommas"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`test-system-${idx}-url`}>URL</Label>
                      <Input
                        id={`test-system-${idx}-url`}
                        value={system.url ?? ""}
                        onChange={(event) =>
                          updateSystem(idx, { ...system, url: event.target.value || undefined })
                        }
                        placeholder="https://example.org/system"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`test-system-${idx}-description`}>Beschreibung</Label>
                    <Textarea
                      id={`test-system-${idx}-description`}
                      value={system.description ?? ""}
                      onChange={(event) =>
                        updateSystem(idx, {
                          ...system,
                          description: event.target.value || undefined,
                        })
                      }
                      rows={3}
                      placeholder="Kurze Beschreibung des Systems"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-8 text-destructive"
                  onClick={() => removeSystem(idx)}
                  title="Testsystem entfernen"
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

