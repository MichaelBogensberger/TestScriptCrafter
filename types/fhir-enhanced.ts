// Import types from version-specific modules for better version management
import type {
  FhirOperationOutcome,
  FhirOperationOutcomeIssue,
  FhirTestScript,
  FhirTestScriptMetadata,
  FhirTestScriptMetadataCapability,
  FhirTestScriptMetadataLink,
  FhirTestScriptSetup,
  FhirTestScriptSetupAction,
  FhirTestScriptSetupActionAssert,
  FhirTestScriptSetupActionOperation,
  FhirTestScriptSetupActionAssertRequirement,
  FhirTestScriptTeardown,
  FhirTestScriptTeardownAction,
  FhirTestScriptTest,
  FhirTestScriptTestAction,
  FhirParameters,
  FhirExtension,
  FhirTestScriptOrigin,
  FhirTestScriptDestination,
  FhirTestScriptFixture,
  FhirTestScriptVariable,
  FhirCoding,
  FhirCodeableConcept
} from "./fhir-versions/r5-types"

// Import R5-specific types that might not exist in R4
import type { TestScriptScope as FhirTestScriptScope } from "fhir/r5"

import type { FhirVersion } from "./fhir-config"

/**
 * Erweiterte FHIR-Typen basierend auf @types/fhir
 * Kombiniert Standard-FHIR-Typen mit projektspezifischen Erweiterungen
 */

export type TestScriptStatus = NonNullable<FhirTestScript["status"]>;

export type TestScriptTest = FhirTestScriptTest;
export type TestScriptTestAction = FhirTestScriptTestAction;
export type TestScriptSetup = FhirTestScriptSetup;
export type TestScriptSetupAction = FhirTestScriptSetupAction;
export type TestScriptSetupActionAssert = FhirTestScriptSetupActionAssert;
export type TestScriptSetupActionOperation = FhirTestScriptSetupActionOperation;
export type TestScriptTeardown = FhirTestScriptTeardown;
export type TestScriptTeardownAction = FhirTestScriptTeardownAction;
export type TestScriptSetupActionAssertRequirement = FhirTestScriptSetupActionAssertRequirement;
export type TestScriptOrigin = FhirTestScriptOrigin;
export type TestScriptDestination = FhirTestScriptDestination;
export type TestScriptFixture = FhirTestScriptFixture;
export type TestScriptVariable = FhirTestScriptVariable;
export type TestScriptScope = FhirTestScriptScope;

export type TestScriptMetadata = FhirTestScriptMetadata;
export type TestScriptCapability = FhirTestScriptMetadataCapability;
export type TestScriptMetadataCapability = FhirTestScriptMetadataCapability;
export type TestScriptMetadataLink = FhirTestScriptMetadataLink;

export type EnhancedTestScriptOperation = FhirTestScriptSetupActionOperation;
export type EnhancedTestScriptAssert = FhirTestScriptSetupActionAssert;

export interface TestSystem {
  index: number;
  title: string;
  actor?: string[];
  description?: string;
  url?: string;
}

export interface TestScriptCommonParameter {
  name?: string;
  value?: string;
}

export interface TestScriptCommon {
  key: string;
  name?: string;
  description?: string;
  parameter?: TestScriptCommonParameter[];
  action: TestScriptTestAction[];
}

export type TestScript = FhirTestScript & {
  testSystem?: TestSystem[];
  common?: TestScriptCommon[];
};

export type OperationOutcome = FhirOperationOutcome;
export type OperationOutcomeIssue = FhirOperationOutcomeIssue;

export interface ValidationIssue extends FhirOperationOutcomeIssue {
  line?: number;
  column?: number;
}

export type ValidationResult = Omit<FhirOperationOutcome, "issue"> & {
  issue: ValidationIssue[];
};

export type Parameters = FhirParameters;

export type Extension = FhirExtension;

export type Coding = FhirCoding;

export type CodeableConcept = FhirCodeableConcept;

// Define commonly used Enum types as string unions (consistent across FHIR versions)
export type TestScriptSetupActionAssertDirection = "request" | "response"
export type TestScriptSetupActionAssertOperator = "equals" | "notEquals" | "in" | "notIn" | "greaterThan" | "lessThan" | "empty" | "notEmpty" | "contains" | "notContains" | "eval"
export type TestScriptSetupActionAssertResponse = "continue" | "switchingProtocols" | "okay" | "created" | "accepted" | "nonAuthoritativeInformation" | "noContent" | "resetContent" | "partialContent" | "multipleChoices" | "movedPermanently" | "found" | "seeOther" | "notModified" | "useProxy" | "temporaryRedirect" | "badRequest" | "unauthorized" | "paymentRequired" | "forbidden" | "notFound" | "methodNotAllowed" | "notAcceptable" | "proxyAuthenticationRequired" | "requestTimeOut" | "conflict" | "gone" | "lengthRequired" | "preconditionFailed" | "contentTooLarge" | "uriTooLong" | "unsupportedMediaType" | "rangeNotSatisfiable" | "expectationFailed" | "unprocessableEntity" | "locked" | "failedDependency" | "upgradeRequired" | "internalServerError" | "notImplemented" | "badGateway" | "serviceUnavailable" | "gatewayTimeOut" | "httpVersionNotSupported"
export type TestScriptSetupActionOperationMethod = "head" | "get" | "post" | "put" | "patch" | "delete" | "options"
