"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import type {
  TestScript,
  TestScriptDestination,
  TestScriptOrigin,
  Coding,
} from "@/types/fhir-enhanced"

interface EndpointsSectionProps {
  origin: TestScript["origin"]
  destination: TestScript["destination"]
  updateOrigin: (origin: TestScript["origin"]) => void
  updateDestination: (destination: TestScript["destination"]) => void
}

const defaultCoding = (): Coding => ({
  system: "http://terminology.hl7.org/CodeSystem/testscript-profile-origin-types",
  code: "",
})

export function EndpointsSection({
  origin,
  destination,
  updateOrigin,
  updateDestination,
}: EndpointsSectionProps) {
  const origins = useMemo(() => origin ?? [], [origin])
  const destinations = useMemo(() => destination ?? [], [destination])

  const addOrigin = () => {
    const nextIndex = origins.reduce((max, entry) => Math.max(max, entry.index ?? 0), 0) + 1 || 1
    const entry: TestScriptOrigin = {
      index: nextIndex,
      profile: defaultCoding(),
    }
    updateOrigin([...(origins ?? []), entry])
  }

  const updateOriginEntry = (idx: number, entry: TestScriptOrigin) => {
    const next = [...origins]
    next[idx] = entry
    updateOrigin(next)
  }

  const removeOrigin = (idx: number) => {
    const next = origins.filter((_, index) => index !== idx)
    updateOrigin(next.length > 0 ? next : undefined)
  }

  const addDestination = () => {
    const nextIndex =
      destinations.reduce((max, entry) => Math.max(max, entry.index ?? 0), 0) + 1 || 1
    const entry: TestScriptDestination = {
      index: nextIndex,
      profile: {
        system: "http://terminology.hl7.org/CodeSystem/testscript-profile-destination-types",
        code: "",
      },
    }
    updateDestination([...(destinations ?? []), entry])
  }

  const updateDestinationEntry = (idx: number, entry: TestScriptDestination) => {
    const next = [...destinations]
    next[idx] = entry
    updateDestination(next)
  }

  const removeDestination = (idx: number) => {
    const next = destinations.filter((_, index) => index !== idx)
    updateDestination(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-6 p-2">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Origin (Sender)</h4>
            <p className="text-xs text-muted-foreground">
              Sender-Definitionen, die in Aktionen als <code>origin</code> referenziert werden.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addOrigin} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Origin hinzufügen
          </Button>
        </div>

        {origins.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Noch keine Sender definiert.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {origins.map((entry, idx) => (
              <Card key={entry.index ?? idx} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`origin-${idx}-index`}>Index</Label>
                        <Input
                          id={`origin-${idx}-index`}
                          type="number"
                          min={1}
                          value={entry.index ?? ""}
                          onChange={(event) =>
                            updateOriginEntry(idx, {
                              ...entry,
                              index: Number(event.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`origin-${idx}-url`}>URL (optional)</Label>
                        <Input
                          id={`origin-${idx}-url`}
                          value={entry.url ?? ""}
                          onChange={(event) =>
                            updateOriginEntry(idx, {
                              ...entry,
                              url: event.target.value || undefined,
                            })
                          }
                          placeholder="https://example.org/originProfile"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Profil (Coding)</Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Input
                          value={entry.profile?.system ?? ""}
                          onChange={(event) =>
                            updateOriginEntry(idx, {
                              ...entry,
                              profile: {
                                ...(entry.profile ?? defaultCoding()),
                                system: event.target.value,
                              },
                            })
                          }
                          placeholder="System"
                        />
                        <Input
                          value={entry.profile?.code ?? ""}
                          onChange={(event) =>
                            updateOriginEntry(idx, {
                              ...entry,
                              profile: {
                                ...(entry.profile ?? defaultCoding()),
                                code: event.target.value,
                              },
                            })
                          }
                          placeholder="Code"
                        />
                        <Input
                          value={entry.profile?.display ?? ""}
                          onChange={(event) =>
                            updateOriginEntry(idx, {
                              ...entry,
                              profile: {
                                ...(entry.profile ?? defaultCoding()),
                                display: event.target.value || undefined,
                              },
                            })
                          }
                          placeholder="Anzeige (optional)"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-1 h-8 w-8 text-destructive"
                    onClick={() => removeOrigin(idx)}
                    title="Origin entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Destination (Empfänger)</h4>
            <p className="text-xs text-muted-foreground">
              Empfänger-Definitionen, die in Aktionen als <code>destination</code> referenziert werden.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addDestination}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Destination hinzufügen
          </Button>
        </div>

        {destinations.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Noch keine Empfänger definiert.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {destinations.map((entry, idx) => (
              <Card key={entry.index ?? idx} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`destination-${idx}-index`}>Index</Label>
                        <Input
                          id={`destination-${idx}-index`}
                          type="number"
                          min={1}
                          value={entry.index ?? ""}
                          onChange={(event) =>
                            updateDestinationEntry(idx, {
                              ...entry,
                              index: Number(event.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`destination-${idx}-url`}>URL (optional)</Label>
                        <Input
                          id={`destination-${idx}-url`}
                          value={entry.url ?? ""}
                          onChange={(event) =>
                            updateDestinationEntry(idx, {
                              ...entry,
                              url: event.target.value || undefined,
                            })
                          }
                          placeholder="https://example.org/destinationProfile"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Profil (Coding)</Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Input
                          value={entry.profile?.system ?? ""}
                          onChange={(event) =>
                            updateDestinationEntry(idx, {
                              ...entry,
                              profile: {
                                ...(entry.profile ?? defaultCoding()),
                                system: event.target.value,
                              },
                            })
                          }
                          placeholder="System"
                        />
                        <Input
                          value={entry.profile?.code ?? ""}
                          onChange={(event) =>
                            updateDestinationEntry(idx, {
                              ...entry,
                              profile: {
                                ...(entry.profile ?? defaultCoding()),
                                code: event.target.value,
                              },
                            })
                          }
                          placeholder="Code"
                        />
                        <Input
                          value={entry.profile?.display ?? ""}
                          onChange={(event) =>
                            updateDestinationEntry(idx, {
                              ...entry,
                              profile: {
                                ...(entry.profile ?? defaultCoding()),
                                display: event.target.value || undefined,
                              },
                            })
                          }
                          placeholder="Anzeige (optional)"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-1 h-8 w-8 text-destructive"
                    onClick={() => removeDestination(idx)}
                    title="Destination entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

