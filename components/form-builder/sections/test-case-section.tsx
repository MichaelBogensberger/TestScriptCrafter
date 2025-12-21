"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { FlaskConical, Plus, Trash2, TestTube2 } from "lucide-react"
import type { TestScriptTest, TestScriptTestAction } from "@/types/fhir-enhanced"
import { cn } from "@/lib/utils"
import ActionComponent from "../shared/action-component"

interface TestCaseSectionProps {
  test: TestScriptTest
  testIndex: number
  updateTest: (test: TestScriptTest) => void
  removeTest: () => void
  availableFixtures?: Array<{ id: string; description?: string }>
}

export function TestCaseSection({
  test,
  testIndex,
  updateTest,
  removeTest,
  availableFixtures = [],
}: TestCaseSectionProps) {
  const actions = test.action ?? []
  const [activeActionIndex, setActiveActionIndex] = useState(0)

  useEffect(() => {
    if (actions.length === 0) {
      setActiveActionIndex(0)
      return
    }
    setActiveActionIndex((prev) => Math.min(prev, actions.length - 1))
  }, [actions.length])

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
    setActiveActionIndex(actions.length)
  }

  const addAssertionAction = () => {
    const newAction: TestScriptTestAction = {
      assert: {
        description: "",
        response: "okay",
        warningOnly: false,
        stopTestOnFail: true,
      },
    }
    updateField("action", [...actions, newAction])
    setActiveActionIndex(actions.length)
  }

  const updateAction = (index: number, action: TestScriptTestAction) => {
    const next = [...actions]
    next[index] = action
    updateField("action", next)
  }

  const removeAction = (index: number) => {
    const next = actions.filter((_, idx) => idx !== index)
    updateField("action", next)
    setActiveActionIndex((prev) => {
      if (next.length === 0) return 0
      if (prev === index) return Math.max(0, index - 1)
      if (prev > index) return prev - 1
      return prev
    })
  }

  const activeAction = actions[activeActionIndex]

  const getActionTitle = (action: TestScriptTestAction, index: number) => {
    if (action.operation?.label) return action.operation.label
    if (action.assert?.label) return action.assert.label
    if (action.operation?.resource) return `Operation ${action.operation.resource}`
    if (action.assert?.description) return action.assert.description
    return `Aktion ${index + 1}`
  }

  const getActionBadge = (action: TestScriptTestAction) => {
    if (action.operation) return { label: "Operation", variant: "secondary" as const }
    if (action.assert) return { label: "Assertion", variant: "outline" as const }
    return { label: "Schritt", variant: "default" as const }
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
            title="Remove test case"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor={`test-${testIndex}-description`}>Description</Label>
        <Textarea
          id={`test-${testIndex}-description`}
          value={test.description ?? ""}
          onChange={(event) => updateField("description", event.target.value || undefined)}
          rows={3}
          placeholder="Brief description for reporting"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Actions & Assertions</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addAction} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Operation
            </Button>
            <Button variant="outline" size="sm" onClick={addAssertionAction} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Assertion
            </Button>
          </div>
        </div>

        {actions.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No actions defined yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
            <Card className="p-3">
              <ScrollArea className="h-[260px] pr-2 md:h-[320px]">
                <div className="space-y-2">
                  {actions.map((action, idx) => {
                    const badge = getActionBadge(action)
                    const isActive = idx === activeActionIndex
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveActionIndex(idx)}
                        className={cn(
                          "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                          isActive
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{getActionTitle(action, idx)}</span>
                          <Badge variant={badge.variant} className="text-[10px]">
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {action.operation?.description || action.assert?.description || "Keine Beschreibung"}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>

            <Card className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TestTube2 className="h-4 w-4 text-primary" />
                  <span>{getActionTitle(activeAction, activeActionIndex)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeAction(activeActionIndex)}
                  disabled={actions.length === 1}
                  title={actions.length === 1 ? "Mindestens eine Action ist erforderlich" : "Action entfernen"}
                >
                  <Trash2 className="h-4 w-4" />
                  Entfernen
                </Button>
              </div>

              {activeAction ? (
                <ActionComponent
                  key={activeActionIndex}
                  action={activeAction}
                  index={activeActionIndex}
                  sectionType="test"
                  updateAction={(updated) => updateAction(activeActionIndex, updated)}
                  removeAction={() => removeAction(activeActionIndex)}
                  availableFixtures={availableFixtures}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select an action from the left.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
