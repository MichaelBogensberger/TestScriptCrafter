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
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-sm">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Tinker Tool
                    </h1>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 hidden sm:inline-flex">
                      FHIR
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">TestScript Builder & Validator</p>
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
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-muted-foreground">
              © 2025 Tinker Tool • Made at FH OÖ - Campus Hagenberg
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                FHIR TestScript
              </Badge>
              <Badge variant="outline" className="text-xs">
                Multi-Version R4/R5
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
