import TestScriptBuilder from "@/components/test-script-builder";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Zap, Shield, Code } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">TestScript Crafter</h1>
                  <p className="text-xs text-muted-foreground">FHIR TestScript Builder</p>
                </div>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                v1.0.0
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
            🚀 Professioneller FHIR TestScript Builder
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Erstelle <span className="text-primary">FHIR TestScripts</span> mit Leichtigkeit
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Erstelle, validiere und exportiere FHIR TestScripts mit unserem intuitiven visuellen Builder. 
            Unterstützt JSON und XML Export mit Echtzeit-Validierung.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Schnell & Intuitiv</CardTitle>
              <CardDescription>
                Drag-and-Drop Interface mit Echtzeit-Vorschau
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">FHIR-Validierung</CardTitle>
              <CardDescription>
                Automatische Validierung gegen FHIR-Server
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                <Code className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">Multi-Format Export</CardTitle>
              <CardDescription>
                Export als JSON, XML mit Syntax-Highlighting
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Separator className="my-8" />
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <TestScriptBuilder />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 TestScript Crafter. Erstellt für FHIR-Entwickler.
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                FHIR R5 kompatibel
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
