import TestScriptBuilder from "@/components/test-script-builder";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompactVersionSelector } from "@/components/version-selector";
import { FileText, Activity } from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none">
        <GridPattern width={40} height={40} className="opacity-40" />
      </div>
      {/* Compact Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">TestScript Crafter</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">FHIR TestScript Builder</p>
                </div>
              </div>
              <div className="hidden md:inline-flex">
                <CompactVersionSelector showLabel={false} />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Version 2.0</span>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        <TestScriptBuilder />
      </main>

      {/* Compact Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-muted-foreground">
              © 2025 TestScript Crafter • Made at FH OÖ - Campus Hagenberg
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                HL7 FHIR Multi-Version compatible
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
