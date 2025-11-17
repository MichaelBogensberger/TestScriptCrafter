"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type {
  TestScriptSetupAction,
  TestScriptSetupActionAssert,
  TestScriptSetupActionOperation,
  TestScriptSetupActionAssertRequirement,
  TestScriptTeardownAction,
  TestScriptTestAction,
} from "@/types/fhir-enhanced"
import type { Coding } from "fhir/r5"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { SimpleAssertionForm } from "./simple-assertion-form"

type SectionType = "setup" | "test" | "teardown" | "common"
type ScriptAction = TestScriptSetupAction | TestScriptTestAction | TestScriptTeardownAction

const HTTP_METHODS: Array<TestScriptSetupActionOperation["method"]> = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
]

const RESPONSE_OPTIONS: Array<TestScriptSetupActionAssert["response"]> = [
  "continue",
  "switchingProtocols",
  "okay",
  "created",
  "accepted",
  "nonAuthoritativeInformation",
  "noContent",
  "resetContent",
  "partialContent",
  "multipleChoices",
  "movedPermanently",
  "found",
  "seeOther",
  "notModified",
  "useProxy",
  "temporaryRedirect",
  "permanentRedirect",
  "badRequest",
  "unauthorized",
  "paymentRequired",
  "forbidden",
  "notFound",
  "methodNotAllowed",
  "notAcceptable",
  "proxyAuthenticationRequired",
  "requestTimeout",
  "conflict",
  "gone",
  "lengthRequired",
  "preconditionFailed",
  "contentTooLarge",
  "uriTooLong",
  "unsupportedMediaType",
  "rangeNotSatisfiable",
  "expectationFailed",
  "misdirectedRequest",
  "unprocessableContent",
  "upgradeRequired",
  "internalServerError",
  "notImplemented",
  "badGateway",
  "serviceUnavailable",
  "gatewayTimeout",
  "httpVersionNotSupported",
]

const ASSERTION_DIRECTIONS: Array<TestScriptSetupActionAssert["direction"]> = [
  "response",
  "request",
]

const ASSERTION_OPERATORS: Array<TestScriptSetupActionAssert["operator"]> = [
  "equals",
  "notEquals",
  "in",
  "notIn",
  "greaterThan",
  "lessThan",
  "empty",
  "notEmpty",
  "contains",
  "notContains",
  "eval",
  "manualEval",
]

const REQUEST_METHOD_OPTIONS: Array<TestScriptSetupActionAssert["requestMethod"]> = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
]

interface ActionComponentProps<TAction extends ScriptAction> {
  action: TAction
  index: number
  sectionType: SectionType
  updateAction: (action: TAction) => void
  removeAction: () => void
}

const ensureCoding = (coding: Coding | undefined, defaultSystem: string): Coding => ({
  system: defaultSystem,
  code: "",
  ...coding,
})

export default function ActionComponent<TAction extends ScriptAction>({
  action,
  index,
  sectionType,
  updateAction,
  removeAction,
}: ActionComponentProps<TAction>) {
  const operation = useMemo<TestScriptSetupActionOperation>(
    () => ({
      encodeRequestUrl: true,
      ...action.operation,
    }),
    [action.operation],
  )

  const requestHeaders = useMemo(() => operation.requestHeader ?? [], [operation.requestHeader])

  const operationErrors = useMemo(() => {
    const errors: {
      typeCode?: string
      method?: string
      resource?: string
      url?: string
      sourceId?: string
      requestHeaders?: Record<number, string[]>
    } = {}

    if (!operation.type?.code?.trim()) {
      errors.typeCode = "Operationstyp erforderlich"
    }

    if (!operation.method) {
      errors.method = "HTTP-Methode erforderlich"
    }

    if (!operation.resource?.trim()) {
      errors.resource = "Resource-Typ erforderlich"
    }

    if (!operation.url?.trim()) {
      errors.url = "URL erforderlich"
    }

    if (
      sectionType === "setup" &&
      operation.method &&
      ["post", "put"].includes(operation.method) &&
      !operation.sourceId?.trim()
    ) {
      errors.sourceId = "Source ID wird für POST/PUT im Setup benötigt"
    }

    const headerErrors: Record<number, string[]> = {}
    requestHeaders.forEach((header, idx) => {
      const fieldErrors: string[] = []
      if (!header.field?.trim()) {
        fieldErrors.push("Feldname erforderlich")
      }
      if (!header.value?.trim()) {
        fieldErrors.push("Wert erforderlich")
      }
      if (fieldErrors.length > 0) {
        headerErrors[idx] = fieldErrors
      }
    })
    if (Object.keys(headerErrors).length > 0) {
      errors.requestHeaders = headerErrors
    }

    return errors
  }, [operation, requestHeaders, sectionType])

  const assertionErrors = useMemo(() => {
    if (!action.assert) return null
    const { description, response } = action.assert
    return {
      description: description?.trim() ? undefined : "Beschreibung erforderlich",
      response: response ? undefined : "Erwartete Antwort wählen",
    }
  }, [action.assert])

  const updateOperation = (partial: Partial<TestScriptSetupActionOperation>) => {
    updateAction({
      ...action,
      operation: {
        ...operation,
        ...partial,
      },
    } as TAction)
  }

  const updateOperationField = <K extends keyof TestScriptSetupActionOperation>(
    field: K,
    value: TestScriptSetupActionOperation[K],
  ) => {
    updateOperation({ [field]: value } as Partial<TestScriptSetupActionOperation>)
  }

  const updateOperationTypeField = <K extends keyof Coding>(field: K, value: Coding[K]) => {
    const typeCoding = ensureCoding(
      operation.type,
      "http://terminology.hl7.org/CodeSystem/testscript-operation-codes",
    )
    updateOperation({
      type: {
        ...typeCoding,
        [field]: value,
      },
    })
  }

  const addRequestHeader = () => {
    updateOperation({
      requestHeader: [...requestHeaders, { field: "", value: "" }],
    })
  }

  const updateRequestHeader = (headerIdx: number, field: "field" | "value", value: string) => {
    const headers = [...requestHeaders]
    headers[headerIdx] = {
      ...headers[headerIdx],
      [field]: value,
    }
    updateOperation({ requestHeader: headers })
  }

  const removeRequestHeader = (headerIdx: number) => {
    const headers = requestHeaders.filter((_, idx) => idx !== headerIdx)
    updateOperation({ requestHeader: headers.length > 0 ? headers : undefined })
  }

  const addAssertion = () => {
    const newAssertion: TestScriptSetupActionAssert = {
      description: "",
      response: "okay",
      warningOnly: false,
      stopTestOnFail: true,
    }
    updateAction({
      ...action,
      assert: newAssertion,
    } as TAction)
  }

  const updateAssertion = (assertion: TestScriptSetupActionAssert) => {
    updateAction({
      ...action,
      assert: assertion,
    } as TAction)
  }

  const removeAssertion = () => {
    if ("assert" in action) {
      const next = { ...action } as ScriptAction & { assert?: TestScriptSetupActionAssert }
      delete next.assert
      updateAction(next as TAction)
    }
  }

  const removeRequirement = (requirements: TestScriptSetupActionAssertRequirement[] | undefined, idx: number) => {
    if (!requirements) return undefined
    const next = requirements.filter((_, i) => i !== idx)
    return next.length > 0 ? next : undefined
  }

  const addRequirement = (requirements: TestScriptSetupActionAssertRequirement[] | undefined) => {
    return [...(requirements ?? []), {}]
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium">
            {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Aktion {index + 1}
          </h4>
          <p className="text-xs text-muted-foreground">
            Definiert eine Operation sowie optional eine Assertion.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={removeAction}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor={`action-${index}-id`}>ID</Label>
          <Input
            id={`action-${index}-id`}
            value={action.id ?? ""}
            onChange={(event) =>
              updateAction({
                ...action,
                id: event.target.value || undefined,
              } as TAction)
            }
            placeholder="Optionaler Identifier"
          />
        </div>
        <div>
          <Label htmlFor={`action-${index}-label`}>Label</Label>
          <Input
            id={`action-${index}-label`}
            value={operation.label ?? ""}
            onChange={(event) => updateOperationField("label", event.target.value || undefined)}
            placeholder="Kurzer Anzeigename"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label>Operation Type System</Label>
          <Input
            value={operation.type?.system ?? "http://terminology.hl7.org/CodeSystem/testscript-operation-codes"}
            onChange={(event) => updateOperationTypeField("system", event.target.value)}
          />
        </div>
        <div>
          <Label>Operation Type Code</Label>
          <Input
            value={operation.type?.code ?? ""}
            onChange={(event) => updateOperationTypeField("code", event.target.value)}
            placeholder="read | create | ..."
            className={cn(operationErrors.typeCode && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={Boolean(operationErrors.typeCode)}
          />
          {operationErrors.typeCode && (
            <p className="text-xs text-destructive">{operationErrors.typeCode}</p>
          )}
        </div>
        <div>
          <Label>Operation Type Display</Label>
          <Input
            value={operation.type?.display ?? ""}
            onChange={(event) => updateOperationTypeField("display", event.target.value || undefined)}
            placeholder="Lesbarer Name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor={`action-${index}-method`}>HTTP Methode</Label>
          <Select
            value={operation.method ?? ""}
            onValueChange={(value) => updateOperationField("method", value as typeof operation.method)}
          >
            <SelectTrigger id={`action-${index}-method`}>
              <SelectValue placeholder="Methode wählen" />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((method) => (
                <SelectItem key={method ?? ""} value={method ?? ""}>
                  {method?.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {operationErrors.method && (
            <p className="text-xs text-destructive">{operationErrors.method}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`action-${index}-resource`}>Resource Typ</Label>
          <Input
            id={`action-${index}-resource`}
            value={operation.resource ?? ""}
            onChange={(event) => updateOperationField("resource", event.target.value || undefined)}
            placeholder="z. B. Patient"
            className={cn(operationErrors.resource && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={Boolean(operationErrors.resource)}
          />
          {operationErrors.resource && (
            <p className="text-xs text-destructive">{operationErrors.resource}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`action-${index}-url`}>URL</Label>
          <Input
            id={`action-${index}-url`}
            value={operation.url ?? ""}
            onChange={(event) => updateOperationField("url", event.target.value || undefined)}
            placeholder="/Patient/example"
            className={cn(operationErrors.url && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={Boolean(operationErrors.url)}
          />
          {operationErrors.url && <p className="text-xs text-destructive">{operationErrors.url}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor={`action-${index}-accept`}>Accept</Label>
          <Input
            id={`action-${index}-accept`}
            value={operation.accept ?? ""}
            onChange={(event) => updateOperationField("accept", event.target.value || undefined)}
            placeholder="application/fhir+json"
          />
        </div>
        <div>
          <Label htmlFor={`action-${index}-contentType`}>Content-Type</Label>
          <Input
            id={`action-${index}-contentType`}
            value={operation.contentType ?? ""}
            onChange={(event) => updateOperationField("contentType", event.target.value || undefined)}
            placeholder="application/fhir+json"
          />
        </div>
        <div>
          <Label htmlFor={`action-${index}-params`}>Parameter</Label>
          <Textarea
            id={`action-${index}-params`}
            value={operation.params ?? ""}
            onChange={(event) => updateOperationField("params", event.target.value || undefined)}
            rows={2}
            placeholder="?_id=example"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <Label htmlFor={`action-${index}-destination`}>Destination</Label>
          <Input
            id={`action-${index}-destination`}
            type="number"
            min={0}
            value={operation.destination ?? ""}
            onChange={(event) =>
              updateOperationField(
                "destination",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </div>
        <div>
          <Label htmlFor={`action-${index}-origin`}>Origin</Label>
          <Input
            id={`action-${index}-origin`}
            type="number"
            min={0}
            value={operation.origin ?? ""}
            onChange={(event) =>
              updateOperationField("origin", event.target.value ? Number(event.target.value) : undefined)
            }
          />
        </div>
        <div>
          <Label htmlFor={`action-${index}-requestId`}>Request ID</Label>
          <Input
            id={`action-${index}-requestId`}
            value={operation.requestId ?? ""}
            onChange={(event) => updateOperationField("requestId", event.target.value || undefined)}
            placeholder="fixture-request"
          />
        </div>
        <div>
          <Label htmlFor={`action-${index}-responseId`}>Response ID</Label>
          <Input
            id={`action-${index}-responseId`}
            value={operation.responseId ?? ""}
            onChange={(event) => updateOperationField("responseId", event.target.value || undefined)}
            placeholder="fixture-response"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor={`action-${index}-sourceId`}>Source ID</Label>
          <Input
            id={`action-${index}-sourceId`}
            value={operation.sourceId ?? ""}
            onChange={(event) => updateOperationField("sourceId", event.target.value || undefined)}
            className={cn(operationErrors.sourceId && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={Boolean(operationErrors.sourceId)}
          />
          {operationErrors.sourceId && (
            <p className="text-xs text-destructive">{operationErrors.sourceId}</p>
          )}
        </div>
        <div>
          <Label htmlFor={`action-${index}-targetId`}>Target ID</Label>
          <Input
            id={`action-${index}-targetId`}
            value={operation.targetId ?? ""}
            onChange={(event) => updateOperationField("targetId", event.target.value || undefined)}
          />
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`action-${index}-encode`}>Encode Request URL</Label>
              <p className="text-xs text-muted-foreground">Standardmäßig aktiviert.</p>
            </div>
            <Switch
              id={`action-${index}-encode`}
              checked={operation.encodeRequestUrl ?? true}
              onCheckedChange={(checked) => updateOperationField("encodeRequestUrl", checked)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium">Request Header</h5>
          <Button variant="ghost" size="sm" onClick={addRequestHeader} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Header hinzufügen
          </Button>
        </div>
        {requestHeaders.length === 0 ? (
          <p className="text-xs text-muted-foreground">Keine zusätzlichen Header definiert.</p>
        ) : (
          <div className="space-y-2">
            {requestHeaders.map((header, headerIdx) => (
              <div
                key={headerIdx}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-md border p-3"
              >
                <Input
                  value={header.field}
                  onChange={(event) => updateRequestHeader(headerIdx, "field", event.target.value)}
                  placeholder="Header Feld"
                  className={cn(
                    operationErrors.requestHeaders?.[headerIdx] &&
                      operationErrors.requestHeaders[headerIdx].some((msg) => msg.includes("Feld")) &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <Input
                  value={header.value}
                  onChange={(event) => updateRequestHeader(headerIdx, "value", event.target.value)}
                  placeholder="Header Wert"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeRequestHeader(headerIdx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {operationErrors.requestHeaders?.[headerIdx]?.length ? (
                  <div className="col-span-3 space-y-1">
                    {operationErrors.requestHeaders[headerIdx].map((message, messageIdx) => (
                      <p key={messageIdx} className="text-xs text-destructive">
                        {message}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {(sectionType === "test" || sectionType === "common") && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium">Assertion</h5>
            {!action.assert && (
              <Button variant="outline" size="sm" onClick={addAssertion} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Assertion hinzufügen
              </Button>
            )}
          </div>

          {action.assert ? (
            <SimpleAssertionForm
              assertion={action.assert}
              updateAssertion={updateAssertion}
              removeAssertion={removeAssertion}
              responseOptions={RESPONSE_OPTIONS}
              directionOptions={ASSERTION_DIRECTIONS}
              operatorOptions={ASSERTION_OPERATORS}
              errors={assertionErrors ?? undefined}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Fügt optional Prüfungen hinzu, die auf die vorherige Operation angewendet werden.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}