"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { TestScriptTeardown, TestScriptTeardownAction } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface TeardownSectionProps {
  teardown: TestScriptTeardown
  updateTeardown: (teardown: TestScriptTeardown) => void
}

export default function TeardownSection({ teardown, updateTeardown }: TeardownSectionProps) {
  const actions = teardown.action ?? []

  const addTeardownAction = () => {
    const newAction: TestScriptTeardownAction = {
      operation: {
        encodeRequestUrl: true,
      },
    }
    updateTeardown({
      ...teardown,
      action: [...actions, newAction],
    })
  }

  const updateAction = (index: number, action: TestScriptTeardownAction) => {
    const next = [...actions]
    next[index] = action
    updateTeardown({
      ...teardown,
      action: next,
    })
  }

  const removeAction = (index: number) => {
    const next = actions.filter((_, idx) => idx !== index)
    updateTeardown({
      ...teardown,
      action: next,
    })
  }

  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="teardown-id">Teardown ID</Label>
          <Input
            id="teardown-id"
            value={teardown.id ?? ""}
            onChange={(event) =>
              updateTeardown({
                ...teardown,
                id: event.target.value || undefined,
              })
            }
            placeholder="Optionaler Identifier"
          />
        </div>
        <div className="flex items-end justify-end">
          <Button variant="outline" size="sm" onClick={addTeardownAction} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Teardown-Aktion hinzufügen
          </Button>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Noch keine Teardown-Aktionen definiert.
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, idx) => (
            <ActionComponent
              key={idx}
              action={action}
              index={idx}
              sectionType="teardown"
              updateAction={(updated) => updateAction(idx, updated)}
              removeAction={() => removeAction(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
