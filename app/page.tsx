import TestScriptBuilder from "@/components/test-script-builder";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FHIR TestScript Builder</h1>
        <ThemeToggle />
      </div>
      <TestScriptBuilder />
    </main>
  );
}
