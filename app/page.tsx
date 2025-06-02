import TestScriptBuilder from "@/components/test-script-builder";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">FHIR TestScript Builder</h1>
      <TestScriptBuilder />
    </main>
  );
}
