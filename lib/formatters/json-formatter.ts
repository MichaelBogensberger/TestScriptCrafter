/**
 * Formatiert beliebige Daten als JSON mit anpassbarer Einrückung
 */
export function formatToJson<T>(data: T, spaces = 2): string {
  try {
    return JSON.stringify(data, null, spaces)
  } catch (error: unknown) {
    console.error("JSON-Formatierungsfehler:", error)
    if (error instanceof Error) {
      throw new Error(`Fehler bei der JSON-Formatierung: ${error.message}`)
    }
    throw new Error(`Fehler bei der JSON-Formatierung: ${String(error)}`)
  }
}