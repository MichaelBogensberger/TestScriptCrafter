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
  Coding,
} from "@/types/fhir-enhanced"
import { useMemo, useState, useEffect } from "react"
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

const CONTENT_TYPE_OPTIONS = [
  { value: "application/fhir+json", label: "application/fhir+json" },
  { value: "application/fhir+xml", label: "application/fhir+xml" },
  { value: "application/json+fhir", label: "application/json+fhir" },
  { value: "application/xml+fhir", label: "application/xml+fhir" },
  { value: "application/json", label: "application/json" },
  { value: "application/xml", label: "application/xml" },
]

const OPERATION_TYPE_CODES = [
  { value: "read", label: "read - Read the current state of the resource" },
  { value: "vread", label: "vread - Read the state of a specific version" },
  { value: "update", label: "update - Update an existing resource" },
  { value: "patch", label: "patch - Update parts of a resource" },
  { value: "delete", label: "delete - Delete a resource" },
  { value: "create", label: "create - Create a new resource" },
  { value: "search", label: "search - Search based on filter criteria" },
  { value: "history", label: "history - Retrieve change history" },
  { value: "transaction", label: "transaction - Execute a transaction" },
  { value: "batch", label: "batch - Execute a batch" },
  { value: "operation", label: "operation - Perform an operation" },
  { value: "capabilities", label: "capabilities - Get capability statement" },
]

const FHIR_RESOURCE_TYPES = [
  "Account", "ActivityDefinition", "ActorDefinition", "AdministrableProductDefinition",
  "AdverseEvent", "AllergyIntolerance", "Appointment", "AppointmentResponse",
  "ArtifactAssessment", "AuditEvent", "Basic", "Binary", "BiologicallyDerivedProduct",
  "BiologicallyDerivedProductDispense", "BodyStructure", "Bundle", "CapabilityStatement",
  "CarePlan", "CareTeam", "ChargeItem", "ChargeItemDefinition", "Citation", "Claim",
  "ClaimResponse", "ClinicalImpression", "ClinicalUseDefinition", "CodeSystem",
  "Communication", "CommunicationRequest", "CompartmentDefinition", "Composition",
  "ConceptMap", "Condition", "ConditionDefinition", "Consent", "Contract", "Coverage",
  "CoverageEligibilityRequest", "CoverageEligibilityResponse", "DetectedIssue",
  "Device", "DeviceAssociation", "DeviceDefinition", "DeviceDispense", "DeviceMetric",
  "DeviceRequest", "DeviceUsage", "DiagnosticReport", "DocumentReference",
  "Encounter", "EncounterHistory", "Endpoint", "EnrollmentRequest", "EnrollmentResponse",
  "EpisodeOfCare", "EventDefinition", "Evidence", "EvidenceReport", "EvidenceVariable",
  "ExampleScenario", "ExplanationOfBenefit", "FamilyMemberHistory", "Flag",
  "FormularyItem", "GenomicStudy", "Goal", "GraphDefinition", "Group",
  "GuidanceResponse", "HealthcareService", "ImagingSelection", "ImagingStudy",
  "Immunization", "ImmunizationEvaluation", "ImmunizationRecommendation",
  "ImplementationGuide", "Ingredient", "InsurancePlan", "InventoryItem",
  "InventoryReport", "Invoice", "Library", "Linkage", "List", "Location",
  "ManufacturedItemDefinition", "Measure", "MeasureReport", "Medication",
  "MedicationAdministration", "MedicationDispense", "MedicationKnowledge",
  "MedicationRequest", "MedicationStatement", "MedicinalProductDefinition",
  "MessageDefinition", "MessageHeader", "MolecularSequence", "NamingSystem",
  "NutritionIntake", "NutritionOrder", "NutritionProduct", "Observation",
  "ObservationDefinition", "OperationDefinition", "OperationOutcome", "Organization",
  "OrganizationAffiliation", "PackagedProductDefinition", "Parameters", "Patient",
  "PaymentNotice", "PaymentReconciliation", "Permission", "Person", "PlanDefinition",
  "Practitioner", "PractitionerRole", "Procedure", "Provenance", "Questionnaire",
  "QuestionnaireResponse", "RegulatedAuthorization", "RelatedPerson",
  "RequestOrchestration", "Requirements", "ResearchStudy", "ResearchSubject",
  "RiskAssessment", "Schedule", "SearchParameter", "ServiceRequest", "Slot",
  "Specimen", "SpecimenDefinition", "StructureDefinition", "StructureMap",
  "Subscription", "SubscriptionStatus", "SubscriptionTopic", "Substance",
  "SubstanceDefinition", "SubstanceNucleicAcid", "SubstancePolymer",
  "SubstanceProtein", "SubstanceReferenceInformation", "SubstanceSourceMaterial",
  "SupplyDelivery", "SupplyRequest", "Task", "TerminologyCapabilities", "TestPlan",
  "TestReport", "TestScript", "Transport", "ValueSet", "VerificationResult",
  "VisionPrescription"
]

interface ActionComponentProps<TAction extends ScriptAction> {
  action: TAction
  index: number
  sectionType: SectionType
  updateAction: (action: TAction) => void
  removeAction?: () => void
  availableFixtures?: Array<{ id: string; description?: string }>
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
  availableFixtures = [],
}: ActionComponentProps<TAction>) {
  const [showCustomResourceType, setShowCustomResourceType] = useState(false)
  
  const operation = useMemo<TestScriptSetupActionOperation>(
    () => ({
      encodeRequestUrl: true,
      ...action.operation,
    }),
    [action.operation],
  )

  const requestHeaders = useMemo(() => operation.requestHeader ?? [], [operation.requestHeader])
  
  // Check if current resource type is custom (not in predefined list)
  useEffect(() => {
    if (operation.resource && !FHIR_RESOURCE_TYPES.includes(operation.resource)) {
      setShowCustomResourceType(true)
    }
  }, [operation.resource])

  const operationErrors = useMemo(() => {
    const errors: {
      typeCode?: string
      method?: string
      resource?: string
      url?: string
      sourceId?: string
      requestHeaders?: Record<number, string[]>
    } = {}

    // Type Code is always required
    if (!operation.type?.code?.trim()) {
      errors.typeCode = "Operation type required"
    }

    // Method, Resource and URL are only required in setup, optional in tests
    if (sectionType === "setup") {
      if (!operation.method) {
        errors.method = "HTTP method required"
      }

      if (!operation.resource?.trim()) {
        errors.resource = "Resource type required"
      }

      if (!operation.url?.trim()) {
        errors.url = "URL required"
      }
    }

    // Source ID only required in setup for POST/PUT
    if (
      sectionType === "setup" &&
      operation.method &&
      ["post", "put"].includes(operation.method) &&
      !operation.sourceId?.trim()
    ) {
      errors.sourceId = "Source ID required for POST/PUT in setup"
    }

    const headerErrors: Record<number, string[]> = {}
    requestHeaders.forEach((header, idx) => {
      const fieldErrors: string[] = []
      if (!header.field?.trim()) {
        fieldErrors.push("Field name required")
      }
      if (!header.value?.trim()) {
        fieldErrors.push("Value required")
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
    
    // Description is only required in setup, optional in tests
    const { description, response } = action.assert
    return {
      description: sectionType === "setup" && !description?.trim() ? "Description required" : undefined,
      response: sectionType === "setup" && !response ? "Select expected response" : undefined,
    }
  }, [action.assert, sectionType])

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
            {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Action {index + 1}
          </h4>
          <p className="text-xs text-muted-foreground">
            Defines an operation and optionally an assertion.
          </p>
        </div>
        {removeAction && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={removeAction}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor={`action-${index}-label`}>Label</Label>
        <Input
          id={`action-${index}-label`}
          value={operation.label ?? ""}
          onChange={(event) => updateOperationField("label", event.target.value || undefined)}
          placeholder="Short display name for this operation"
        />
      </div>

      <div>
        <Label>Operation Type System</Label>
        <Input
          value={operation.type?.system ?? "http://terminology.hl7.org/CodeSystem/testscript-operation-codes"}
          onChange={(event) => updateOperationTypeField("system", event.target.value)}
        />
      </div>

      <div>
        <Label>Operation Type Code</Label>
        <Select
          value={operation.type?.code ?? ""}
          onValueChange={(value) => updateOperationTypeField("code", value)}
        >
          <SelectTrigger className={cn(operationErrors.typeCode && "border-destructive focus-visible:ring-destructive")}>
            <SelectValue placeholder="Select operation..." />
          </SelectTrigger>
          <SelectContent>
            {OPERATION_TYPE_CODES.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {operationErrors.typeCode && (
          <p className="text-xs text-destructive">{operationErrors.typeCode}</p>
        )}
      </div>

      <div>
        <Label>Operation Type Display</Label>
        <Input
          value={operation.type?.display ?? ""}
          onChange={(event) => updateOperationTypeField("display", event.target.value || undefined)}
          placeholder="Human readable name"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor={`action-${index}-method`}>HTTP Method</Label>
          <Select
            value={operation.method ?? ""}
            onValueChange={(value) => updateOperationField("method", value as typeof operation.method)}
          >
            <SelectTrigger id={`action-${index}-method`}>
              <SelectValue placeholder="Select method" />
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
          <Label htmlFor={`action-${index}-resource`}>Resource Type</Label>
          {showCustomResourceType ? (
            <div className="space-y-2">
              <Input
                id={`action-${index}-resource`}
                value={operation.resource ?? ""}
                onChange={(event) => updateOperationField("resource", event.target.value || undefined)}
                placeholder="Custom resource type"
                className={cn(operationErrors.resource && "border-destructive focus-visible:ring-destructive")}
                aria-invalid={Boolean(operationErrors.resource)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomResourceType(false)
                  updateOperationField("resource", undefined)
                }}
                className="text-xs"
              >
                ← Back to selection
              </Button>
            </div>
          ) : (
          <Select
            value={operation.resource ?? "__none__"}
            onValueChange={(value) => {
              if (value === "__custom__") {
                setShowCustomResourceType(true)
                updateOperationField("resource", "")
              } else if (value === "__none__") {
                updateOperationField("resource", undefined)
              } else {
                updateOperationField("resource", value || undefined)
              }
            }}
          >
            <SelectTrigger 
              id={`action-${index}-resource`}
              className={cn(operationErrors.resource && "border-destructive focus-visible:ring-destructive")}
            >
              <SelectValue placeholder="Select resource..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-- None --</SelectItem>
              {FHIR_RESOURCE_TYPES.map((resourceType) => (
                <SelectItem key={resourceType} value={resourceType}>
                  {resourceType}
                </SelectItem>
              ))}
              <SelectItem value="__custom__" className="text-primary font-medium">
                ✏️ Custom Type...
              </SelectItem>
            </SelectContent>
          </Select>
          )}
          {operationErrors.resource && (
            <p className="text-xs text-destructive">{operationErrors.resource}</p>
          )}
        </div>
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor={`action-${index}-accept`}>Accept</Label>
          <Select
            value={operation.accept ?? "__none__"}
            onValueChange={(value) => updateOperationField("accept", value === "__none__" ? undefined : value)}
          >
            <SelectTrigger id={`action-${index}-accept`}>
              <SelectValue placeholder="Select accept type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-- None --</SelectItem>
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`action-${index}-contentType`}>Content-Type</Label>
          <Select
            value={operation.contentType ?? "__none__"}
            onValueChange={(value) => updateOperationField("contentType", value === "__none__" ? undefined : value)}
          >
            <SelectTrigger id={`action-${index}-contentType`}>
              <SelectValue placeholder="Select content type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-- None --</SelectItem>
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          {availableFixtures.length > 0 ? (
            <Select
              value={operation.targetId ?? "__none__"}
              onValueChange={(value) => updateOperationField("targetId", value === "__none__" ? undefined : value)}
            >
              <SelectTrigger id={`action-${index}-targetId`}>
                <SelectValue placeholder="Select fixture..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">-- None --</SelectItem>
                {availableFixtures.map((fixture) => (
                  <SelectItem key={fixture.id} value={fixture.id}>
                    {fixture.id}
                    {fixture.description && ` (${fixture.description})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`action-${index}-targetId`}
              value={operation.targetId ?? ""}
              onChange={(event) => updateOperationField("targetId", event.target.value || undefined)}
              placeholder="Fixture ID"
            />
          )}
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor={`action-${index}-encode`}>Encode Request URL</Label>
            <p className="text-xs text-muted-foreground">Enabled by default.</p>
          </div>
          <Switch
            id={`action-${index}-encode`}
            checked={operation.encodeRequestUrl ?? true}
            onCheckedChange={(checked) => updateOperationField("encodeRequestUrl", checked)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium">Request Header</h5>
          <Button variant="ghost" size="sm" onClick={addRequestHeader} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Header
          </Button>
        </div>
        {requestHeaders.length === 0 ? (
          <p className="text-xs text-muted-foreground">No additional headers defined.</p>
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
                  placeholder="Header field"
                  className={cn(
                    operationErrors.requestHeaders?.[headerIdx] &&
                      operationErrors.requestHeaders[headerIdx].some((msg) => msg.includes("Field")) &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <Input
                  value={header.value}
                  onChange={(event) => updateRequestHeader(headerIdx, "value", event.target.value)}
                  placeholder="Header value"
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
                Add Assertion
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
              Optionally add assertions that are applied to the previous operation.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}