import { TestScript } from "@/types/fhir-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

type FocusArea = "all" | "setup" | "test" | "teardown" | "common";

interface FilteredViewProps {
  testScript: TestScript;
}

export function FilteredView({ testScript }: FilteredViewProps) {
  const [focusArea, setFocusArea] = useState<FocusArea>("all");

  const getFilteredTestScript = () => {
    if (focusArea === "all") return testScript;
    
    const filtered = { ...testScript };
    
    if (focusArea !== "setup") delete filtered.setup;
    if (focusArea !== "test") delete filtered.test;
    if (focusArea !== "teardown") delete filtered.teardown;
    if (focusArea !== "common") delete filtered.common;
    
    return filtered;
  };

  const renderTestScriptSection = (title: string, content: unknown) => {
    if (!content) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={focusArea} onValueChange={(value) => setFocusArea(value as FocusArea)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Gesamtes TestScript</SelectItem>
            <SelectItem value="setup">Setup</SelectItem>
            <SelectItem value="test">Tests</SelectItem>
            <SelectItem value="teardown">Teardown</SelectItem>
            <SelectItem value="common">Common</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {testScript.status && (
            <Badge variant={testScript.status === "active" ? "default" : "outline"}>
              {testScript.status}
            </Badge>
          )}
          {testScript.experimental && (
            <Badge variant="secondary">Experimentell</Badge>
          )}
        </div>
      </div>

      {renderTestScriptSection("Setup", getFilteredTestScript().setup)}
      {renderTestScriptSection("Tests", getFilteredTestScript().test)}
      {renderTestScriptSection("Teardown", getFilteredTestScript().teardown)}
      {renderTestScriptSection("Common", getFilteredTestScript().common)}
    </div>
  );
} 