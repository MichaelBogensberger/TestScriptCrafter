"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { Separator } from "@/components/ui/separator"

/**
 * Settings Dialog for optional features
 */
export function SettingsDialog() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure optional features and advanced functionality.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Visibility</h4>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1">
                <Label htmlFor="metadata-capabilities" className="text-sm font-normal">
                  Show Metadata Capabilities
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Display the Metadata section with Capabilities in the form
                </p>
              </div>
              <Switch
                id="metadata-capabilities"
                checked={settings.showMetadataCapabilities}
                onCheckedChange={(checked) => updateSetting('showMetadataCapabilities', checked)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

