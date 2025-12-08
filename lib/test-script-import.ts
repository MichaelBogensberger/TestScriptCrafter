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
        errors: ["Ungültiges JSON-Format"],
      }
    }

    const testScript = parsed as TestScript

    // Prüfe ob es ein TestScript ist
    if (testScript.resourceType !== "TestScript") {
      return {
        success: false,
        errors: [`Ungültiger ResourceType: ${testScript.resourceType}. Erwartet: TestScript`],
      }
    }

    return {
      success: true,
      testScript,
    }
  } catch (error) {
    return {
      success: false,
      errors: [`JSON-Parsing-Fehler: ${error instanceof Error ? error.message : String(error)}`],
    }
  }
}

/**
 * Konvertiert XML zu JSON und parst dann das TestScript
 * Verwendet DOMParser für XML-Parsing
 */
export function parseXmlTestScript(xmlContent: string): ImportResult {
  try {
    // Prüfe ob DOMParser verfügbar ist (Browser-Umgebung)
    if (typeof window === "undefined" || !window.DOMParser) {
      return {
        success: false,
        errors: ["XML-Parsing ist nur im Browser verfügbar"],
      }
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    // Prüfe auf XML-Parsing-Fehler
    const parseError = xmlDoc.querySelector("parsererror")
    if (parseError) {
      const errorText = parseError.textContent || "Unbekannter XML-Parsing-Fehler"
      return {
        success: false,
        errors: [`XML-Parsing-Fehler: ${errorText}`],
      }
    }

    // Konvertiere XML zu JSON
    const jsonContent = xmlToJson(xmlDoc.documentElement)

    // Prüfe ob es ein TestScript ist
    if (jsonContent.resourceType !== "TestScript") {
      return {
        success: false,
        errors: [`Ungültiger ResourceType: ${jsonContent.resourceType}. Erwartet: TestScript`],
      }
    }

    return {
      success: true,
      testScript: jsonContent as TestScript,
    }
  } catch (error) {
    return {
      success: false,
      errors: [`XML-Parsing-Fehler: ${error instanceof Error ? error.message : String(error)}`],
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
          // Wenn es nur Text gibt und keine anderen Kinder, speichere als Wert
          if (xml.childNodes.length === 1) {
            return text
          }
          // Sonst als Text-Property
          result._text = text
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName

        // Wenn das Element bereits existiert, mache es zu einem Array
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
            diagnostics: `Validierungsfehler: ${response.status} ${response.statusText}`,
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
          diagnostics: `Verbindungsfehler: ${error instanceof Error ? error.message : String(error)}`,
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

  // Erkenne Format primär basierend auf Inhalt, nicht Dateinamen
  if (trimmedContent.startsWith("{") || trimmedContent.startsWith("[")) {
    // JSON-Format erkannt
    parseResult = parseJsonTestScript(fileContent)
  } else if (trimmedContent.startsWith("<")) {
    // XML-Format erkannt
    parseResult = parseXmlTestScript(fileContent)
  } else {
    // Versuche beide Formate, beginne mit JSON
    parseResult = parseJsonTestScript(fileContent)
    if (!parseResult.success) {
      // Falls JSON fehlschlägt, versuche XML
      parseResult = parseXmlTestScript(fileContent)
    }
    
    // Wenn beide fehlschlagen, gib Fehler zurück
    if (!parseResult.success) {
      return {
        success: false,
        errors: ["Unbekanntes Dateiformat. Die Datei muss gültiges JSON oder XML enthalten."],
      }
    }
  }

  // Wenn Parsing fehlgeschlagen ist, gib Fehler zurück
  if (!parseResult.success || !parseResult.testScript) {
    return parseResult
  }

  // Validiere das importierte TestScript
  const validationResult = await validateImportedTestScript(parseResult.testScript, fhirVersion)

  // Wenn Validierung Fehler hat, filtere Namensvalidierungsfehler heraus (beim Import weniger streng)
  if (validationResult && validationResult.issue && validationResult.issue.length > 0) {
    // Trenne Namensfehler von anderen Fehlern
    const nameIssues = validationResult.issue.filter((issue) => {
      const location = issue.location || []
      return location.includes("name") && 
        (issue.diagnostics?.includes("Name muss") || 
         issue.diagnostics?.includes("Name") ||
         (issue.code === "structure" && issue.diagnostics?.toLowerCase().includes("name")))
    })

    const otherIssues = validationResult.issue.filter((issue) => {
      const location = issue.location || []
      const isNameError = location.includes("name") && 
        (issue.diagnostics?.includes("Name muss") || 
         issue.diagnostics?.includes("Name") ||
         (issue.code === "structure" && issue.diagnostics?.toLowerCase().includes("name")))
      return !isNameError
    })

    // Konvertiere Namensfehler zu Warnungen
    const nameWarnings = nameIssues.map((issue) => ({
      ...issue,
      severity: "warning" as const,
    }))

    // Prüfe ob es noch andere Fehler gibt (außer Namensfehler)
    const hasOtherErrors = otherIssues.some(
      (issue) => issue.severity === "error" || issue.severity === "fatal"
    )

    if (hasOtherErrors) {
      // Es gibt andere Fehler, Import schlägt fehl
      return {
        success: false,
        testScript: parseResult.testScript,
        validationResult: {
          ...validationResult,
          issue: [...otherIssues, ...nameWarnings],
        },
        errors: otherIssues.map(
          (issue) => `${issue.severity}: ${issue.diagnostics || issue.code}`
        ),
      }
    }

    // Nur Namensfehler oder Warnungen vorhanden - Import erfolgreich
    return {
      success: true,
      testScript: parseResult.testScript,
      validationResult: {
        ...validationResult,
        issue: [...otherIssues, ...nameWarnings],
      },
    }
  }

  return {
    success: true,
    testScript: parseResult.testScript,
    validationResult: validationResult || undefined,
  }
}

