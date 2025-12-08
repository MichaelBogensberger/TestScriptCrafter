"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { TestScriptSetup, TestScriptSetupAction } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface SetupSectionProps {
  setup: TestScriptSetup
  updateSetup: (setup: TestScriptSetup) => void
}

export default function SetupSection({ setup, updateSetup }: SetupSectionProps) {
  const actions = setup.action ?? []

  const addSetupAction = () => {
    const newAction: TestScriptSetupAction = {
      operation: {
        encodeRequestUrl: true,
      },
    }
    updateSetup({
      ...setup,
      action: [...actions, newAction],
    })
  }

  const updateAction = (index: number, action: TestScriptSetupAction) => {
    const next = [...actions]
    next[index] = action
    updateSetup({
      ...setup,
      action: next,
    })
  }

  const removeAction = (index: number) => {
    const next = actions.filter((_, idx) => idx !== index)
    updateSetup({
      ...setup,
      action: next,
    })
  }

  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="setup-id">Setup ID</Label>
          <Input
            id="setup-id"
            value={setup.id ?? ""}
            onChange={(event) =>
              updateSetup({
                ...setup,
                id: event.target.value || undefined,
              })
            }
            placeholder="Optionaler Identifier"
          />
        </div>
        <div className="flex items-end justify-end">
          <Button variant="outline" size="sm" onClick={addSetupAction} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Setup-Aktion hinzufügen
          </Button>
        </div>
      </div>

      {actions.length === 0 ? (
        <EmptyState
          title="Noch keine Setup-Aktionen definiert."
          description="Füge vorbereitende Operationen hinzu, die vor den eigentlichen Tests ausgeführt werden."
        />
      ) : (
        <div className="space-y-3">
          {actions.map((action, idx) => (
            <ActionComponent
              key={idx}
              action={action}
              index={idx}
              sectionType="setup"
              updateAction={(updated) => updateAction(idx, updated)}
              removeAction={() => removeAction(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}