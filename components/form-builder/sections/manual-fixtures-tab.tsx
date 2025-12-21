"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { TestScript, TestScriptFixture } from "@/types/fhir-enhanced"
import { toast } from "sonner"

interface ManualFixturesTabProps {
  fixtures: TestScript["fixture"]
  updateFixtures: (fixtures: TestScript["fixture"]) => void
}

/**
 * Tab component for manually creating and managing TestScript Fixtures
 * Preserves the original fixtures functionality while being part of a tabbed interface
 */
export function ManualFixturesTab({ fixtures, updateFixtures }: ManualFixturesTabProps) {
  const entries = useMemo(() => fixtures ?? [], [fixtures])

  const addFixture = () => {
    const newFixture: TestScriptFixture = {
      autocreate: false,
      autodelete: false,
    }
    updateFixtures([...(entries ?? []), newFixture])
    toast.success("Fixture hinzugefügt", {
      description: "Bitte vergessen Sie nicht, eine eindeutige Fixture ID einzugeben.",
    })
  }

  const updateFixture = (idx: number, fixture: TestScriptFixture) => {
    // Prüfe auf Duplikat-ID wenn eine ID gesetzt wird
    if (fixture.id && fixture.id.trim()) {
      const isDuplicate = entries.some((f, i) => i !== idx && f.id === fixture.id)
      if (isDuplicate) {
        toast.error("Duplikat-ID erkannt", {
          description: `Eine Fixture mit der ID "${fixture.id}" existiert bereits.`,
        })
        return
      }
    }
    
    const next = [...entries]
    next[idx] = fixture
    updateFixtures(next)
  }

  const removeFixture = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateFixtures(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Manual Fixtures</h4>
          <p className="text-xs text-muted-foreground">
            Create fixtures by manually entering resource references.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addFixture} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Fixture
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6 text-muted-foreground" />}
          title="No fixtures defined"
          description="Start by adding your first fixture for test data."
          action={
            <Button variant="outline" onClick={addFixture} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create First Fixture
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map((fixture, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-4">
                  {/* Fixture ID */}
                  <div>
                    <Label htmlFor={`fixture-${idx}-id`}>
                      Fixture ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`fixture-${idx}-id`}
                      value={fixture.id ?? ""}
                      onChange={(event) =>
                        updateFixture(idx, {
                          ...fixture,
                          id: event.target.value || undefined,
                        })
                      }
                      placeholder="fixture-patient-example"
                      className="mt-1"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Eindeutige ID für die Referenzierung in Test-Aktionen (Pflichtfeld)
                    </p>
                  </div>

                  {/* Auto-create and Auto-delete switches */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div>
                        <Label htmlFor={`fixture-${idx}-autocreate`}>Automatisch erstellen</Label>
                        <p className="text-xs text-muted-foreground">
                          Fixture is created during setup.
                        </p>
                      </div>
                      <Switch
                        id={`fixture-${idx}-autocreate`}
                        checked={fixture.autocreate}
                        onCheckedChange={(checked) =>
                          updateFixture(idx, { ...fixture, autocreate: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div>
                        <Label htmlFor={`fixture-${idx}-autodelete`}>Auto-delete</Label>
                        <p className="text-xs text-muted-foreground">
                          Fixture is removed after tests.
                        </p>
                      </div>
                      <Switch
                        id={`fixture-${idx}-autodelete`}
                        checked={fixture.autodelete}
                        onCheckedChange={(checked) =>
                          updateFixture(idx, { ...fixture, autodelete: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Resource reference fields */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label htmlFor={`fixture-${idx}-reference`}>
                        Resource Reference <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`fixture-${idx}-reference`}
                        value={fixture.resource?.reference ?? ""}
                        onChange={(event) =>
                          updateFixture(idx, {
                            ...fixture,
                            resource: {
                              ...(fixture.resource ?? {}),
                              reference: event.target.value || undefined,
                            },
                          })
                        }
                        placeholder="Patient/example-patient"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: ResourceType/id oder URL (z.B. .html Datei)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`fixture-${idx}-type`}>Resource Type</Label>
                      <Input
                        id={`fixture-${idx}-type`}
                        value={fixture.resource?.type ?? ""}
                        onChange={(event) =>
                          updateFixture(idx, {
                            ...fixture,
                            resource: {
                              ...(fixture.resource ?? {}),
                              type: event.target.value || undefined,
                            },
                          })
                        }
                        placeholder="Patient"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        FHIR Resource Type
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`fixture-${idx}-display`}>Display Name</Label>
                      <Input
                        id={`fixture-${idx}-display`}
                        value={fixture.resource?.display ?? ""}
                        onChange={(event) =>
                          updateFixture(idx, {
                            ...fixture,
                            resource: {
                              ...(fixture.resource ?? {}),
                              display: event.target.value || undefined,
                            },
                          })
                        }
                        placeholder="Max Mustermann"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Human-readable description
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeFixture(idx)}
                  title="Remove fixture"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Tipp:</strong> Fixtures können in Test-Aktionen über ihre ID referenziert werden. 
            Verwende die Resource Reference in Operations oder als Vergleichswerte in Assertions.
          </p>
        </div>
      )}
    </div>
  )
}
