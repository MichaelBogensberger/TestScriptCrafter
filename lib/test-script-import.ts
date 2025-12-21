import type { TestScript, OperationOutcome } from "@/types/fhir-enhanced"

export interface ImportResult {
  success: boolean
  testScript?: TestScript
  errors?: string[]
  validationResult?: OperationOutcome
}

/**
 * Parst eine JSON-Datei zu einem TestScript
 */
export function parseJsonTestScript(jsonContent: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonContent) as unknown

    // Prüfe grundlegende Struktur
    if (!parsed || typeof parsed !== "object") {
      return {
        success: false,
        errors: ["Invalid JSON format"],
      }
    }

    const testScript = parsed as TestScript

    // Check if it's a TestScript
    if (testScript.resourceType !== "TestScript") {
      return {
        success: false,
        errors: [`Invalid ResourceType: ${testScript.resourceType}. Expected: TestScript`],
      }
    }

    return {
      success: true,
      testScript,
    }
  } catch (error) {
    return {
      success: false,
      errors: [`JSON parsing error: ${error instanceof Error ? error.message : String(error)}`],
    }
  }
}

/**
 * Konvertiert XML zu JSON und parst dann das TestScript
 * Verwendet DOMParser für XML-Parsing
 */
export function parseXmlTestScript(xmlContent: string): ImportResult {
  try {
    // Check if DOMParser is available (browser environment)
    if (typeof window === "undefined" || !window.DOMParser) {
      return {
        success: false,
        errors: ["XML parsing is only available in the browser"],
      }
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    // Check for XML parsing errors
    const parseError = xmlDoc.querySelector("parsererror")
    if (parseError) {
      const errorText = parseError.textContent || "Unknown XML parsing error"
      return {
        success: false,
        errors: [`XML parsing error: ${errorText}`],
      }
    }

    // Convert XML to JSON
    const jsonContent = xmlToJson(xmlDoc.documentElement)

    // Check if it's a TestScript
    if (jsonContent.resourceType !== "TestScript") {
      return {
        success: false,
        errors: [`Invalid ResourceType: ${jsonContent.resourceType}. Expected: TestScript`],
      }
    }

    return {
      success: true,
      testScript: jsonContent as TestScript,
    }
  } catch (error) {
    return {
      success: false,
      errors: [`XML parsing error: ${error instanceof Error ? error.message : String(error)}`],
    }
  }
}

/**
 * Konvertiert ein XML-Element rekursiv zu einem JavaScript-Objekt
 */
function xmlToJson(xml: Element): any {
  const result: any = {}

  // Attribute verarbeiten
  if (xml.attributes.length > 0) {
    for (let i = 0; i < xml.attributes.length; i++) {
      const attr = xml.attributes[i]
      result[attr.name] = attr.value
    }
  }

  // Child-Elemente verarbeiten
  if (xml.childNodes.length > 0) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const node = xml.childNodes[i]

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          // If there's only text and no other children, store as value
          if (xml.childNodes.length === 1) {
            return text
          }
          // Otherwise as text property
          result._text = text
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName

        // If the element already exists, make it an array
        if (result[tagName]) {
          if (!Array.isArray(result[tagName])) {
            result[tagName] = [result[tagName]]
          }
          result[tagName].push(xmlToJson(element))
        } else {
          result[tagName] = xmlToJson(element)
        }
      }
    }
  }

  return result
}

/**
 * Validiert ein TestScript über die API
 */
export async function validateImportedTestScript(
  testScript: TestScript,
  fhirVersion?: string | { toString(): string }
): Promise<OperationOutcome | null> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Validation-Mode": "import", // Lockere Validierung für Import
    }

    if (fhirVersion) {
      headers["X-FHIR-Version"] = typeof fhirVersion === "string" ? fhirVersion : fhirVersion.toString()
    }

    const response = await fetch("/api/validate", {
      method: "POST",
      headers,
      body: JSON.stringify(testScript),
    })

    if (!response.ok) {
      return {
        resourceType: "OperationOutcome",
        issue: [
          {
            severity: "error",
            code: "exception",
            diagnostics: `Validation error: ${response.status} ${response.statusText}`,
          },
        ],
      }
    }

    return (await response.json()) as OperationOutcome
  } catch (error) {
    return {
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: "error",
          code: "exception",
          diagnostics: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

/**
 * Liest eine Datei und erkennt automatisch das Format (JSON oder XML)
 */
export async function importTestScriptFromFile(
  file: File,
  fhirVersion?: string | { toString(): string }
): Promise<ImportResult> {
  const fileContent = await file.text()
  const trimmedContent = fileContent.trim()

  let parseResult: ImportResult

  // Detect format primarily based on content, not filename
  if (trimmedContent.startsWith("{") || trimmedContent.startsWith("[")) {
    // JSON format detected
    parseResult = parseJsonTestScript(fileContent)
  } else if (trimmedContent.startsWith("<")) {
    // XML format detected
    parseResult = parseXmlTestScript(fileContent)
  } else {
    // Try both formats, starting with JSON
    parseResult = parseJsonTestScript(fileContent)
    if (!parseResult.success) {
      // If JSON fails, try XML
      parseResult = parseXmlTestScript(fileContent)
    }
    
    // If both fail, return error
    if (!parseResult.success) {
      return {
        success: false,
        errors: ["Unknown file format. The file must contain valid JSON or XML."],
      }
    }
  }

  // If parsing failed, return error
  if (!parseResult.success || !parseResult.testScript) {
    return parseResult
  }

  // Validate the imported TestScript (with lenient import validation)
  const validationResult = await validateImportedTestScript(parseResult.testScript, fhirVersion)

  // Check if there are critical errors
  if (validationResult && validationResult.issue && validationResult.issue.length > 0) {
    const hasErrors = validationResult.issue.some(
      (issue) => issue.severity === "error" || issue.severity === "fatal"
    )

    if (hasErrors) {
      // There are errors, import fails
      return {
        success: false,
        testScript: parseResult.testScript,
        validationResult,
        errors: validationResult.issue
          .filter((issue) => issue.severity === "error" || issue.severity === "fatal")
          .map((issue) => `${issue.severity}: ${issue.diagnostics || issue.code}`),
      }
    }

    // Only warnings present - import successful
    return {
      success: true,
      testScript: parseResult.testScript,
      validationResult,
    }
  }

  return {
    success: true,
    testScript: parseResult.testScript,
    validationResult: validationResult || undefined,
  }
}

