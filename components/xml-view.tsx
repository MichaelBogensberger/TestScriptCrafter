import { TestScript } from "@/types/test-script";
import SyntaxHighlighter from "./syntax-highlighter";
import { Button } from "./ui/button";
import { ClipboardCopy, Download } from "lucide-react";
import { toast } from "sonner";

interface XmlViewProps {
  testScript: TestScript;
}

export function XmlView({ testScript }: XmlViewProps) {
  const formatToXml = (data: any) => {
    const convertToXml = (obj: any, indent: string = ""): string => {
      if (typeof obj !== "object" || obj === null) {
        return `${indent}${obj}`;
      }

      let xml = "";
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            xml += `${indent}<${key}>\n`;
            xml += convertToXml(item, indent + "  ");
            xml += `\n${indent}</${key}>\n`;
          });
        } else if (typeof value === "object" && value !== null) {
          xml += `${indent}<${key}>\n`;
          xml += convertToXml(value, indent + "  ");
          xml += `\n${indent}</${key}>\n`;
        } else {
          xml += `${indent}<${key}>${value}</${key}>\n`;
        }
      }
      return xml;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n<TestScript>\n${convertToXml(data, "  ")}</TestScript>`;
  };

  const copyToClipboard = () => {
    const content = formatToXml(testScript);
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success("In die Zwischenablage kopiert", {
          description: "TestScript XML wurde kopiert",
        });
      })
      .catch((error) => {
        toast.error("Fehler beim Kopieren", {
          description: error.message,
        });
      });
  };

  const downloadContent = () => {
    const content = formatToXml(testScript);
    const filename = `testscript_${testScript.id || "export"}.xml`;
    
    const blob = new Blob([content], { type: "application/xml" });
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
          language="xml"
          code={formatToXml(testScript)}
          showLineNumbers={true}
        />
      </div>
    </div>
  );
} 