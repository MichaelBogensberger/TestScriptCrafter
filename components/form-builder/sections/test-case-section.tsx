"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { TestScriptTest } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface TestCaseSectionProps {
  test: TestScriptTest
  testIndex: number
  updateTest: (test: TestScriptTest) => void
  removeTest: () => void
}

/**
 * Component for editing a test case in the TestScript
 */
export default function TestCaseSection({ test, testIndex, updateTest, removeTest }: TestCaseSectionProps) {
  /**
   * Updates a field in the test case
   */
  const updateField = (field: keyof TestScriptTest, value: any) => {
    updateTest({ ...test, [field]: value })
  }

  /**
   * Adds a new action to the test case
   */
  const addAction = () => {
    const newAction = {
      operation: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/testscript-operation-codes",
          code: "read",
        },
        resource: "Patient",
        description: "Read a Patient resource",
        encodeRequestUrl: true,
      },
    }

    updateField("action", [...(test.action || []), newAction])
  }

  /**
   * Updates a specific action in the test case
   */
  const updateAction = (actionIndex: number, updatedAction: any) => {
    const updatedActions = [...(test.action || [])]
    updatedActions[actionIndex] = updatedAction
    updateField("action", updatedActions)
  }

  /**
   * Removes an action from the test case
   */
  const removeAction = (actionIndex: number) => {
    const updatedActions = (test.action || []).filter((_, i) => i !== actionIndex)
    updateField("action", updatedActions)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-2 flex-1">
          <Label htmlFor={`test-${testIndex}-name`}>Name</Label>
          <Input
            id={`test-${testIndex}-name`}
            value={test.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Tracking/logging name of this test"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 mt-6" onClick={removeTest} title="Remove test case">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`test-${testIndex}-description`}>Description</Label>
        <Textarea
          id={`test-${testIndex}-description`}
          value={test.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Tracking/reporting short description of the test"
        />
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Actions</h4>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={addAction}>
            <Plus className="h-4 w-4" /> Add Action
          </Button>
        </div>

        {(test.action || []).map((action, actionIndex) => (
          <ActionComponent
            key={`test-${testIndex}-action-${actionIndex}`}
            action={action}
            index={actionIndex}
            sectionType="test"
            updateAction={(updatedAction) => updateAction(actionIndex, updatedAction)}
            removeAction={() => removeAction(actionIndex)}
          />
        ))}

        {(test.action || []).length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No actions defined. Click the button above to add one.
          </div>
        )}
      </div>
    </div>
  )
}
