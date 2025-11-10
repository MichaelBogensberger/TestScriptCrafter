import { create, type XMLBuilder } from "xmlbuilder2"
import type { TestScript } from "@/types/fhir-enhanced"

type SerializablePrimitive = string | number | boolean | null
type SerializableValue = SerializablePrimitive | SerializableValue[] | Record<string, SerializableValue>

const isRecord = (value: unknown): value is Record<string, SerializableValue> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const appendNode = (builder: XMLBuilder, key: string, value: SerializableValue): void => {
  if (Array.isArray(value)) {
    value.forEach((item) => appendNode(builder, key, item))
    return
  }

  if (isRecord(value)) {
    const child = builder.ele(key)
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendNode(child, childKey, childValue)
    })
    return
  }

  builder.ele(key).txt(String(value))
}

/**
 * Formatiert ein TestScript-Objekt als XML
 */
export function formatToXml(testScript: TestScript): string {
  try {
    const document = create({ version: "1.0", encoding: "UTF-8" })
    const root = document.ele("TestScript", { xmlns: "http://hl7.org/fhir" })

    const serializable = JSON.parse(JSON.stringify(testScript)) as Record<string, SerializableValue>
    Object.entries(serializable).forEach(([key, value]) => {
      if (key === "resourceType") {
        return
      }
      appendNode(root, key, value)
    })

    return document.end({ prettyPrint: true })
  } catch (error: unknown) {
    console.error("XML-Formatierungsfehler:", error)
    if (error instanceof Error) {
      throw new Error(`Fehler bei der XML-Formatierung: ${error.message}`)
    }
    throw new Error(`Fehler bei der XML-Formatierung: ${String(error)}`)
  }
}
