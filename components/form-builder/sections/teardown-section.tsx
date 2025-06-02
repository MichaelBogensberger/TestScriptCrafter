"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TestScriptTeardown } from "@/types/test-script"
import ActionComponent from "../shared/action-component"

interface TeardownSectionProps {
  teardown: TestScriptTeardown
  updateTeardown: (teardown: TestScriptTeardown) => void
}

/**
 * Component for editing the teardown section of a TestScript
 */
export default function TeardownSection({ teardown, updateTeardown }: TeardownSectionProps) {
  /**
   * Adds a new action to the teardown section
   */
  const addTeardownAction = () => {
    const newAction = {
      operation: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/testscript-operation-codes",
          code: "delete",
        },
        resource: "Patient",
        description: "Delete test resources",
        encodeRequestUrl: true,
      },
    }

    const updatedTeardown = { ...teardown }
    updatedTeardown.action = [...(teardown.action || []), newAction]
    updateTeardown(updatedTeardown)
  }

  /**
   * Updates a specific action in the teardown section
   */
  const updateAction = (index: number, updatedAction: any) => {
    const updatedTeardown = { ...teardown }
    const actions = [...(teardown.action || [])]
    actions[index] = updatedAction
    updatedTeardown.action = actions
    updateTeardown(updatedTeardown)
  }

  /**
   * Removes an action from the teardown section
   */
  const removeAction = (index: number) => {
    const updatedTeardown = { ...teardown }
    updatedTeardown.action = (teardown.action || []).filter((_, i) => i !== index)
    updateTeardown(updatedTeardown)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          The teardown section contains actions that clean up after the test is complete.
        </p>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={addTeardownAction}>
          <Plus className="h-4 w-4" /> Add Teardown Action
        </Button>
      </div>

      {(teardown.action || []).map((action, index) => (
        <ActionComponent
          key={`teardown-action-${index}`}
          action={action}
          index={index}
          sectionType="teardown"
          updateAction={(updatedAction) => updateAction(index, updatedAction)}
          removeAction={() => removeAction(index)}
        />
      ))}

      {(teardown.action || []).length === 0 && (
        <div className="text-center p-4 text-muted-foreground">
          No teardown actions defined. Click the button above to add one.
        </div>
      )}
    </div>
  )
}
