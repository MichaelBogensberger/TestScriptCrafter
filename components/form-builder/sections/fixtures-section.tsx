"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { TestScript, TestScriptFixture } from "@/types/fhir-enhanced"

interface FixturesSectionProps {
  fixtures: TestScript["fixture"]
  updateFixtures: (fixtures: TestScript["fixture"]) => void
}

export function FixturesSection({ fixtures, updateFixtures }: FixturesSectionProps) {
  const entries = useMemo(() => fixtures ?? [], [fixtures])

  const addFixture = () => {
    const newFixture: TestScriptFixture = {
      autocreate: false,
      autodelete: false,
    }
    updateFixtures([...(entries ?? []), newFixture])
  }

  const updateFixture = (idx: number, fixture: TestScriptFixture) => {
    const next = [...entries]
    next[idx] = fixture
    updateFixtures(next)
  }

  const removeFixture = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateFixtures(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Fixtures</h4>
          <p className="text-xs text-muted-foreground">
            Referenzen auf Ressourcen, die als Testdaten fungieren.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addFixture} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Fixture hinzufügen
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Noch keine Fixtures definiert.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((fixture, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div>
                        <Label htmlFor={`fixture-${idx}-autocreate`}>Automatisch erstellen</Label>
                        <p className="text-xs text-muted-foreground">
                          Fixture wird während des Setups erstellt.
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
                        <Label htmlFor={`fixture-${idx}-autodelete`}>Automatisch löschen</Label>
                        <p className="text-xs text-muted-foreground">
                          Fixture wird nach den Tests entfernt.
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label htmlFor={`fixture-${idx}-reference`}>Resource Reference</Label>
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
                        placeholder="Resource/123"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fixture-${idx}-type`}>Type (optional)</Label>
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
                        placeholder="ResourceType"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fixture-${idx}-display`}>Display (optional)</Label>
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
                        placeholder="Lesbare Beschreibung"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-1 h-8 w-8 text-destructive"
                  onClick={() => removeFixture(idx)}
                  title="Fixture entfernen"
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

