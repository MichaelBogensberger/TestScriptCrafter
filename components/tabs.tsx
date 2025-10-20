import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestScript } from "@/types/fhir-enhanced";
import { JsonView } from "./json-view";
import { XmlView } from "./xml-view";
import { ValidationTab } from "./validation-tab";

interface StructuredViewProps {
  testScript: TestScript;
}

export function StructuredView({ testScript }: StructuredViewProps) {
  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList>
        <TabsTrigger value="json">JSON</TabsTrigger>
        <TabsTrigger value="xml">XML</TabsTrigger>
        <TabsTrigger value="validation">Validierung</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonView testScript={testScript} />
      </TabsContent>
      <TabsContent value="xml">
        <XmlView testScript={testScript} />
      </TabsContent>
      <TabsContent value="validation">
        <ValidationTab testScript={testScript} />
      </TabsContent>
    </Tabs>
  );
} 