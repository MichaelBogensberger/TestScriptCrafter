"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TestScript, TestScriptStatus } from "@/types/fhir-enhanced"

interface BasicInfoSectionProps {
  testScript: TestScript
  updateTestScript: (data: Partial<TestScript>) => void
}

/**
 * Component for editing basic TestScript information
 * Focuses on required elements first
 */
export default function BasicInfoSection({ testScript, updateTestScript }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4 p-2">
      {/* Required fields */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={testScript.name}
          onChange={(e) => updateTestScript({ name: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">Computer friendly name (required)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={testScript.status}
          onValueChange={(value) => updateTestScript({ status: value as TestScriptStatus })}
          required
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Status of this TestScript (required)</p>
      </div>

      {/* Optional fields */}
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={testScript.url || ""}
          onChange={(e) => updateTestScript({ url: e.target.value })}
          placeholder="http://example.org/fhir/TestScript/example"
        />
        <p className="text-xs text-muted-foreground">Canonical identifier for this TestScript</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          value={testScript.version || ""}
          onChange={(e) => updateTestScript({ version: e.target.value })}
          placeholder="1.0"
        />
        <p className="text-xs text-muted-foreground">Business version of the TestScript</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={testScript.title ?? ""}
          onChange={(e) => updateTestScript({ title: e.target.value })}
          placeholder="Human-friendly name"
        />
        <p className="text-xs text-muted-foreground">Human-friendly name for this TestScript</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={testScript.description || ""}
          onChange={(e) => updateTestScript({ description: e.target.value })}
          placeholder="Natural language description of the TestScript"
        />
        <p className="text-xs text-muted-foreground">Natural language description</p>
      </div>
    </div>
  )
}
