"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import AssertionComponent from "./assertion-component"

interface ActionComponentProps {
  action: any
  index: number
  sectionType: "setup" | "test" | "teardown"
  updateAction: (action: any) => void
  removeAction: () => void
}

/**
 * Reusable component for editing an action in any section
 */
export default function ActionComponent({
  action,
  index,
  sectionType,
  updateAction,
  removeAction,
}: ActionComponentProps) {
  /**
   * Updates a field in the operation
   */
  const updateOperationField = (field: string, value: any) => {
    const updatedAction = { ...action }
    if (!updatedAction.operation) {
      updatedAction.operation = {}
    }
    updatedAction.operation[field] = value
    updateAction(updatedAction)
  }

  /**
   * Updates a field in the operation type
   */
  const updateOperationTypeField = (field: string, value: any) => {
    const updatedAction = { ...action }
    if (!updatedAction.operation) {
      updatedAction.operation = {}
    }
    if (!updatedAction.operation.type) {
      updatedAction.operation.type = {
        system: "http://terminology.hl7.org/CodeSystem/testscript-operation-codes",
      }
    }
    updatedAction.operation.type[field] = value
    updateAction(updatedAction)
  }

  /**
   * Adds an assertion to the action (only for test actions)
   */
  const addAssertion = () => {
    const updatedAction = { ...action }
    updatedAction.assert = {
      description: "Confirm that the returned HTTP status is 200(OK)",
      response: "okay",
      warningOnly: false,
      stopTestOnFail: true,
    }
    updateAction(updatedAction)
  }

  /**
   * Updates the assertion
   */
  const updateAssertion = (assertion: any) => {
    const updatedAction = { ...action }
    updatedAction.assert = assertion
    updateAction(updatedAction)
  }

  /**
   * Removes the assertion
   */
  const removeAssertion = () => {
    const updatedAction = { ...action }
    delete updatedAction.assert
    updateAction(updatedAction)
  }

  return (
    <Card className="p-3 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">
          {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Action {index + 1}
        </h4>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={removeAction}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Operation Type</Label>
          <Select
            value={action.operation?.type?.code || ""}
            onValueChange={(value) => updateOperationTypeField("code", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="search">Search</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Resource Type</Label>
          <Select
            value={action.operation?.resource || ""}
            onValueChange={(value) => updateOperationField("resource", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Patient">Patient</SelectItem>
              <SelectItem value="Observation">Observation</SelectItem>
              <SelectItem value="Encounter">Encounter</SelectItem>
              <SelectItem value="Condition">Condition</SelectItem>
              <SelectItem value="Procedure">Procedure</SelectItem>
              <SelectItem value="MedicationRequest">MedicationRequest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={action.operation?.description || ""}
          onChange={(e) => updateOperationField("description", e.target.value)}
          placeholder="Tracking/reporting operation description"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`action-${index}-encodeRequestUrl`}>Encode Request URL</Label>
          <Switch
            id={`action-${index}-encodeRequestUrl`}
            checked={action.operation?.encodeRequestUrl !== false}
            onCheckedChange={(checked) => updateOperationField("encodeRequestUrl", checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground">Whether or not to send the request URL in encoded format</p>
      </div>

      {/* Only show assertions for test actions */}
      {sectionType === "test" && (
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-medium">Assertions</h5>
            {!action.assert && (
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={addAssertion}>
                <Plus className="h-4 w-4" /> Add Assertion
              </Button>
            )}
          </div>

          {action.assert ? (
            <AssertionComponent
              assertion={action.assert}
              updateAssertion={updateAssertion}
              removeAssertion={removeAssertion}
            />
          ) : (
            <div className="text-center p-2 text-muted-foreground text-sm">
              No assertions defined. Assertions validate the response from the operation.
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
