import TestScriptBuilder from "@/components/test-script-builder";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
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
              <Badge variant="outline" className="hidden md:inline-flex text-xs">
                FHIR R5
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Version 1.0</span>
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
                HL7 FHIR R5 compatible
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
