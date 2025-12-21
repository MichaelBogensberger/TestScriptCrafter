"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Plus } from "lucide-react"
import type { TestScriptSetup, TestScriptSetupAction } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface SetupSectionProps {
  setup: TestScriptSetup
  updateSetup: (setup: TestScriptSetup) => void
  availableFixtures?: Array<{ id: string; description?: string }>
}

export default function SetupSection({ setup, updateSetup, availableFixtures = [] }: SetupSectionProps) {
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
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={addSetupAction} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Setup Action
        </Button>
      </div>

      {actions.length === 0 ? (
        <EmptyState
          title="No setup actions defined yet."
          description="Add preparatory operations that run before the actual tests."
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
              availableFixtures={availableFixtures}
            />
          ))}
        </div>
      )}
    </div>
  )
}