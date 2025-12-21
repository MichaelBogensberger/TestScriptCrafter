"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Settings, Database } from "lucide-react"
import type { TestScript } from "@/types/fhir-enhanced"
import type { IGConfiguration } from "@/types/ig-types"
import { ManualFixturesTab } from "./manual-fixtures-tab"
import { IGConfigTab } from "./ig-config-tab"
import { IGBrowserTab } from "./ig-browser-tab"

interface FixturesSectionProps {
  fixtures: TestScript["fixture"]
  updateFixtures: (fixtures: TestScript["fixture"]) => void
}

/**
 * Enhanced Fixtures Section with tabbed interface
 * Supports both manual fixture creation and IG-based Example Instance integration
 */
export function FixturesSection({ fixtures, updateFixtures }: FixturesSectionProps) {
  const [igConfiguration, setIGConfiguration] = useState<IGConfiguration>()

  const handleConfigurationChange = useCallback((config: IGConfiguration) => {
    setIGConfiguration(config)
  }, [])

  return (
    <div className="space-y-4 p-2">
      <div>
        <h4 className="text-sm font-medium">Fixtures & Example Instances</h4>
        <p className="text-xs text-muted-foreground">
          Manage test data through manual input or automatic loading from Implementation Guides.
        </p>
      </div>

      <Tabs defaultValue="ig-config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ig-config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">IG Configuration</span>
            <span className="sm:hidden">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="ig-browser" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">IG Example Browser</span>
            <span className="sm:hidden">IG Browser</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Manual Fixtures</span>
            <span className="sm:hidden">Manual</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ig-config" className="mt-4">
          <IGConfigTab onConfigurationChange={handleConfigurationChange} />
        </TabsContent>

        <TabsContent value="ig-browser" className="mt-4">
          <IGBrowserTab 
            fixtures={fixtures} 
            updateFixtures={updateFixtures}
            igConfiguration={igConfiguration}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <ManualFixturesTab 
            fixtures={fixtures} 
            updateFixtures={updateFixtures} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

