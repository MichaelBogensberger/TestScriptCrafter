"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TestScriptSetup } from "@/types/test-script"
import ActionComponent from "../shared/action-component"

interface SetupSectionProps {
  setup: TestScriptSetup
  updateSetup: (setup: TestScriptSetup) => void
}

/**
 * Component for editing the setup section of a TestScript
 */
export default function SetupSection({ setup, updateSetup }: SetupSectionProps) {
  /**
   * Adds a new action to the setup section
   */
  const addSetupAction = () => {
    const newAction = {
      operation: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/testscript-operation-codes",
          code: "create",
        },
        resource: "Patient",
        description: "Create a Patient resource",
        encodeRequestUrl: true,
      },
    }

    const updatedSetup = { ...setup }
    updatedSetup.action = [...(setup.action || []), newAction]
    updateSetup(updatedSetup)
  }

  /**
   * Updates a specific action in the setup section
   */
  const updateAction = (index: number, updatedAction: any) => {
    const updatedSetup = { ...setup }
    const actions = [...(setup.action || [])]
    actions[index] = updatedAction
    updatedSetup.action = actions
    updateSetup(updatedSetup)
  }

  /**
   * Removes an action from the setup section
   */
  const removeAction = (index: number) => {
    const updatedSetup = { ...setup }
    updatedSetup.action = (setup.action || []).filter((_, i) => i !== index)
    updateSetup(updatedSetup)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          The setup section contains actions that prepare the test environment.
        </p>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={addSetupAction}>
          <Plus className="h-4 w-4" /> Add Setup Action
        </Button>
      </div>

      {(setup.action || []).map((action, index) => (
        <ActionComponent
          key={`setup-action-${index}`}
          action={action}
          index={index}
          sectionType="setup"
          updateAction={(updatedAction) => updateAction(index, updatedAction)}
          removeAction={() => removeAction(index)}
        />
      ))}

      {(setup.action || []).length === 0 && (
        <div className="text-center p-4 text-muted-foreground">
          No setup actions defined. Click the button above to add one.
        </div>
      )}
    </div>
  )
}
