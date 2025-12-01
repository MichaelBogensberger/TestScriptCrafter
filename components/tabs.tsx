import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestScript } from "@/types/fhir-enhanced";
import { JsonView } from "./json-view";
import { XmlView } from "./xml-view";
import { ValidationTab } from "./validation-tab";
import { useFhirValidation } from "@/hooks/use-fhir-validation";

interface StructuredViewProps {
  testScript: TestScript;
}

export function StructuredView({ testScript }: StructuredViewProps) {
  // Zentrale Validierungsergebnisse für alle Tabs
  const validationState = useFhirValidation();
  
  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList>
        <TabsTrigger value="json">JSON</TabsTrigger>
        <TabsTrigger value="xml">XML</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonView testScript={testScript} validationState={validationState} />
      </TabsContent>
      <TabsContent value="xml">
        <XmlView testScript={testScript} validationState={validationState} />
      </TabsContent>
    </Tabs>
  );
} 