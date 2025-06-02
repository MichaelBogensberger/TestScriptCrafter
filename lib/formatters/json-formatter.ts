/**
 * Formatiert ein TestScript-Objekt als JSON mit anpassbarer Einrückung
 */
export function formatToJson(testScript: any, spaces: number = 2) {
  try {
    return JSON.stringify(testScript, null, spaces)
  } catch (error: any) {
    console.error("JSON-Formatierungsfehler:", error)
    throw new Error(`Fehler bei der JSON-Formatierung: ${error instanceof Error ? error.message : String(error)}`)
  }
}