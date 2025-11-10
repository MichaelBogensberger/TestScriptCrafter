"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { TestScriptTest, TestScriptTestAction } from "@/types/fhir-enhanced"
import ActionComponent from "../shared/action-component"

interface TestCaseSectionProps {
  test: TestScriptTest
  testIndex: number
  updateTest: (test: TestScriptTest) => void
  removeTest: () => void
}

export default function TestCaseSection({
  test,
  testIndex,
  updateTest,
  removeTest,
}: TestCaseSectionProps) {
  const actions = test.action ?? []

  const updateField = <K extends keyof TestScriptTest>(field: K, value: TestScriptTest[K]) => {
    updateTest({
      ...test,
      [field]: value,
    })
  }

  const addAction = () => {
    const newAction: TestScriptTestAction = {
      operation: {
        encodeRequestUrl: true,
      },
    }
    updateField("action", [...actions, newAction])
  }

  const updateAction = (index: number, action: TestScriptTestAction) => {
    const next = [...actions]
    next[index] = action
    updateField("action", next)
  }

  const removeAction = (index: number) => {
    const next = actions.filter((_, idx) => idx !== index)
    updateField("action", next)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor={`test-${testIndex}-id`}>Test ID</Label>
            <Input
              id={`test-${testIndex}-id`}
              value={test.id ?? ""}
              onChange={(event) => updateField("id", event.target.value || undefined)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label htmlFor={`test-${testIndex}-name`}>Name</Label>
            <Input
              id={`test-${testIndex}-name`}
              value={test.name ?? ""}
              onChange={(event) => updateField("name", event.target.value || undefined)}
              placeholder="Tracking/Logging Name"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={removeTest}
            title="Testfall entfernen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor={`test-${testIndex}-description`}>Beschreibung</Label>
        <Textarea
          id={`test-${testIndex}-description`}
          value={test.description ?? ""}
          onChange={(event) => updateField("description", event.target.value || undefined)}
          rows={3}
          placeholder="Kurze Beschreibung für Reporting"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Aktionen</h4>
          <Button variant="outline" size="sm" onClick={addAction} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Aktion hinzufügen
          </Button>
        </div>

        {actions.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Noch keine Aktionen definiert.
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, idx) => (
              <ActionComponent
                key={idx}
                action={action}
                index={idx}
                sectionType="test"
                updateAction={(updated) => updateAction(idx, updated)}
                removeAction={() => removeAction(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
