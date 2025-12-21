"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Plus } from "lucide-react"
import type { TestScriptTeardown, TestScriptTeardownAction } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface TeardownSectionProps {
  teardown: TestScriptTeardown
  updateTeardown: (teardown: TestScriptTeardown) => void
  availableFixtures?: Array<{ id: string; description?: string }>
}

export default function TeardownSection({ teardown, updateTeardown, availableFixtures = [] }: TeardownSectionProps) {
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
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={addTeardownAction} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Teardown Action
        </Button>
      </div>

      {actions.length === 0 ? (
        <EmptyState
          title="No teardown actions defined yet."
          description="Add cleanup operations that run after test completion."
        />
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
              availableFixtures={availableFixtures}
            />
          ))}
        </div>
      )}
    </div>
  )
}
