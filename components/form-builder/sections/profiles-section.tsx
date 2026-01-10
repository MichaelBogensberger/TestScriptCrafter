"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { TestScriptProfile } from "@/types/fhir-enhanced"

interface ProfilesSectionProps {
  profiles: TestScriptProfile[] | undefined
  updateProfiles: (profiles: TestScriptProfile[] | undefined) => void
}

export function ProfilesSection({ profiles, updateProfiles }: ProfilesSectionProps) {
  const entries = useMemo(() => profiles ?? [], [profiles])
  const [newProfileId, setNewProfileId] = useState("")
  const [newProfileRef, setNewProfileRef] = useState("")

  const addProfile = () => {
    const id = newProfileId.trim()
    const reference = newProfileRef.trim()
    if (!id || !reference) return
    updateProfiles([...(entries ?? []), { id, reference }])
    setNewProfileId("")
    setNewProfileRef("")
  }

  const updateProfile = (idx: number, field: keyof TestScriptProfile, value: string) => {
    const next = [...entries]
    next[idx] = { ...next[idx], [field]: value }
    updateProfiles(next)
  }

  const removeProfile = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateProfiles(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-4 p-2">
      <div>
        <h4 className="text-sm font-medium">Profiles</h4>
        <p className="text-xs text-muted-foreground">
          Liste von Profilen (StructureDefinitions), die dieses TestScript abdeckt.
          Jedes Profil benötigt eine eindeutige ID und eine kanonische Reference URL.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <h5 className="text-sm font-medium">Neues Profil hinzufügen</h5>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="new-profile-id">ID (z.B. "patient-profile")</Label>
            <Input
              id="new-profile-id"
              value={newProfileId}
              onChange={(event) => setNewProfileId(event.target.value)}
              placeholder="patient-profile"
            />
          </div>
          <div>
            <Label htmlFor="new-profile-ref">Reference (kanonische URL)</Label>
            <Input
              id="new-profile-ref"
              value={newProfileRef}
              onChange={(event) => setNewProfileRef(event.target.value)}
              placeholder="http://hl7.at/fhir/HL7ATCoreProfiles/4.0.1/StructureDefinition/at-core-patient"
            />
          </div>
        </div>
        <Button variant="outline" onClick={addProfile} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Profil hinzufügen
        </Button>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          title="Keine Profile definiert."
          description="Fügen Sie Profile hinzu, die in Assertions referenziert werden können."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((profile, idx) => (
            <Card key={`${profile.id}-${idx}`} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`profile-id-${idx}`}>ID</Label>
                    <Input
                      id={`profile-id-${idx}`}
                      value={profile.id}
                      onChange={(event) => updateProfile(idx, "id", event.target.value)}
                      placeholder="Eindeutige ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`profile-ref-${idx}`}>Reference</Label>
                    <Input
                      id={`profile-ref-${idx}`}
                      value={profile.reference}
                      onChange={(event) => updateProfile(idx, "reference", event.target.value)}
                      placeholder="Kanonische URL"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeProfile(idx)}
                  title="Profil entfernen"
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

