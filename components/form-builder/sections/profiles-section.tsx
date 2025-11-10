"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface ProfilesSectionProps {
  profiles: string[] | undefined
  updateProfiles: (profiles: string[] | undefined) => void
}

export function ProfilesSection({ profiles, updateProfiles }: ProfilesSectionProps) {
  const entries = useMemo(() => profiles ?? [], [profiles])
  const [newProfile, setNewProfile] = useState("")

  const addProfile = () => {
    const value = newProfile.trim()
    if (!value) return
    updateProfiles([...(entries ?? []), value])
    setNewProfile("")
  }

  const updateProfile = (idx: number, value: string) => {
    const next = [...entries]
    next[idx] = value
    updateProfiles(next)
  }

  const removeProfile = (idx: number) => {
    const next = entries.filter((_, index) => index !== idx)
    updateProfiles(next.length > 0 ? next : undefined)
  }

  return (
    <div className="space-y-4 p-2">
      <div>
        <h4 className="text-sm font-medium">Profile</h4>
        <p className="text-xs text-muted-foreground">
          Liste kanonischer Profile, die dieses TestScript abdeckt.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newProfile}
          onChange={(event) => setNewProfile(event.target.value)}
          placeholder="https://example.org/fhir/StructureDefinition/MyProfile"
        />
        <Button variant="outline" onClick={addProfile} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Hinzufügen
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Noch keine Profile hinterlegt.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((profile, idx) => (
            <Card key={`${profile}-${idx}`} className="flex items-center justify-between p-3">
              <div className="flex-1">
                <Label htmlFor={`profile-${idx}`} className="sr-only">
                  Profil {idx + 1}
                </Label>
                <Input
                  id={`profile-${idx}`}
                  value={profile}
                  onChange={(event) => updateProfile(idx, event.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-8 w-8 text-destructive"
                onClick={() => removeProfile(idx)}
                title="Profil entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

