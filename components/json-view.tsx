import { TestScript } from "@/types/fhir-enhanced";
import SyntaxHighlighter from "./syntax-highlighter";
import { Button } from "./ui/button";
import { ClipboardCopy, Download } from "lucide-react";
import { toast } from "sonner";

interface JsonViewProps {
  testScript: TestScript;
}

export function JsonView({ testScript }: JsonViewProps) {
  const formatToJson = (data: any, indent: number = 2) => {
    return JSON.stringify(data, null, indent);
  };

  const copyToClipboard = () => {
    const content = formatToJson(testScript);
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success("In die Zwischenablage kopiert", {
          description: "TestScript JSON wurde kopiert",
        });
      })
      .catch((error) => {
        toast.error("Fehler beim Kopieren", {
          description: error.message,
        });
      });
  };

  const downloadContent = () => {
    const content = formatToJson(testScript);
    const filename = `testscript_${testScript.id || "export"}.json`;
    
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success("Datei heruntergeladen", {
      description: `${filename} wurde heruntergeladen`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2"
        >
          <ClipboardCopy className="h-4 w-4" />
          <span>Kopieren</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={downloadContent}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Herunterladen</span>
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <SyntaxHighlighter
          language="json"
          code={formatToJson(testScript)}
          showLineNumbers={true}
        />
      </div>
    </div>
  );
} 