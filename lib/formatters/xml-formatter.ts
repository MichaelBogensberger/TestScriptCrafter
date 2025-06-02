import { create } from 'xmlbuilder2'

/**
 * Formatiert ein TestScript-Objekt als XML
 */
export function formatToXml(testScript: any): string {
  try {
    // Erstelle das XML-Dokument
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('http://hl7.org/fhir', 'TestScript')
    
    // Füge die Pflichtfelder hinzu
    doc.ele('name').att('value', testScript.name || 'Unnamed')
    doc.ele('status').att('value', testScript.status || 'draft')
    
    // Füge optionale Felder hinzu, wenn sie existieren
    if (testScript.metadata) {
      const metadata = doc.ele('metadata')
      if (testScript.metadata.link && Array.isArray(testScript.metadata.link)) {
        for (const link of testScript.metadata.link) {
          const linkEle = metadata.ele('link')
          if (link.url) linkEle.att('url', link.url)
          if (link.description) linkEle.att('description', link.description)
        }
      }
    }
    
    // XML als formatierten String zurückgeben
    return doc.end({ prettyPrint: true })
  } catch (error: any) {
    console.error("XML-Formatierungsfehler:", error)
    throw new Error(`Fehler bei der XML-Formatierung: ${error instanceof Error ? error.message : String(error)}`)
  }
}