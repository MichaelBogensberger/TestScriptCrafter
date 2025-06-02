"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { TestScriptMetadata, Capability } from "@/types/test-script"

interface MetadataSectionProps {
  metadata: TestScriptMetadata
  updateMetadata: (metadata: TestScriptMetadata) => void
}

/**
 * Component for editing TestScript metadata
 * Focuses on required capability elements
 */
export default function MetadataSection({ metadata, updateMetadata }: MetadataSectionProps) {
  /**
   * Adds a new capability to the metadata
   */
  const addCapability = () => {
    const newCapability: Capability = {
      required: true,
      validated: true,
      capabilities: "CapabilityStatement/example",
      description: "FHIR REST support",
    }

    const updatedCapabilities = [...(metadata.capability || []), newCapability]
    updateMetadata({ ...metadata, capability: updatedCapabilities })
  }

  /**
   * Updates a specific capability
   */
  const updateCapability = (index: number, updatedCapability: Capability) => {
    const updatedCapabilities = [...(metadata.capability || [])]
    updatedCapabilities[index] = updatedCapability
    updateMetadata({ ...metadata, capability: updatedCapabilities })
  }

  /**
   * Removes a capability
   */
  const removeCapability = (index: number) => {
    const updatedCapabilities = (metadata.capability || []).filter((_, i) => i !== index)
    updateMetadata({ ...metadata, capability: updatedCapabilities })
  }

  /**
   * Adds a new link to the metadata
   */
  const addLink = () => {
    const newLink = {
      url: "http://hl7.org/fhir/http.html",
      description: "FHIR HTTP Protocol",
    }

    const updatedLinks = [...(metadata.link || []), newLink]
    updateMetadata({ ...metadata, link: updatedLinks })
  }

  /**
   * Updates a specific link
   */
  const updateLink = (index: number, field: string, value: string) => {
    const updatedLinks = [...(metadata.link || [])]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    updateMetadata({ ...metadata, link: updatedLinks })
  }

  /**
   * Removes a link
   */
  const removeLink = (index: number) => {
    const updatedLinks = (metadata.link || []).filter((_, i) => i !== index)
    updateMetadata({ ...metadata, link: updatedLinks })
  }

  return (
    <div className="space-y-4 p-2">
      {/* Capabilities Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>
            Capabilities <span className="text-red-500">*</span>
          </Label>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={addCapability}>
            <Plus className="h-4 w-4" /> Add Capability
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          Capabilities that are assumed to function correctly on the FHIR server being tested (at least one required)
        </p>

        {(metadata.capability || []).map((capability, index) => (
          <Card key={`capability-${index}`} className="p-3 space-y-3 mb-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Capability {index + 1}</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeCapability(index)}
                disabled={(metadata.capability || []).length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`capability-${index}-capabilities`}>
                Capabilities Reference <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`capability-${index}-capabilities`}
                value={capability.capabilities}
                onChange={(e) => updateCapability(index, { ...capability, capabilities: e.target.value })}
                placeholder="CapabilityStatement/example"
                required
              />
              <p className="text-xs text-muted-foreground">Reference to a CapabilityStatement (required)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`capability-${index}-required`}>
                    Required <span className="text-red-500">*</span>
                  </Label>
                  <Switch
                    id={`capability-${index}-required`}
                    checked={capability.required}
                    onCheckedChange={(checked) => updateCapability(index, { ...capability, required: checked })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Are the capabilities required?</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`capability-${index}-validated`}>
                    Validated <span className="text-red-500">*</span>
                  </Label>
                  <Switch
                    id={`capability-${index}-validated`}
                    checked={capability.validated}
                    onCheckedChange={(checked) => updateCapability(index, { ...capability, validated: checked })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Are the capabilities validated?</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`capability-${index}-description`}>Description</Label>
              <Input
                id={`capability-${index}-description`}
                value={capability.description || ""}
                onChange={(e) => updateCapability(index, { ...capability, description: e.target.value })}
                placeholder="The expected capabilities of the server"
              />
            </div>
          </Card>
        ))}

        {(metadata.capability || []).length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No capabilities defined. Click the button above to add one.
          </div>
        )}
      </div>

      {/* Links Section */}
      <div className="space-y-2 mt-6">
        <div className="flex justify-between items-center">
          <Label>Links</Label>
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={addLink}>
            <Plus className="h-4 w-4" /> Add Link
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mb-2">Links to the FHIR specification</p>

        {(metadata.link || []).map((link, index) => (
          <Card key={`link-${index}`} className="p-3 space-y-3 mb-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Link {index + 1}</h4>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLink(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`link-${index}-url`}>
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`link-${index}-url`}
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                placeholder="http://hl7.org/fhir/http.html"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`link-${index}-description`}>Description</Label>
              <Input
                id={`link-${index}-description`}
                value={link.description || ""}
                onChange={(e) => updateLink(index, "description", e.target.value)}
                placeholder="Short description"
              />
            </div>
          </Card>
        ))}

        {(metadata.link || []).length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No links defined. Click the button above to add one.
          </div>
        )}
      </div>
    </div>
  )
}
