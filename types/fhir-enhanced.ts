import type {
  OperationOutcome as FhirOperationOutcome,
  OperationOutcomeIssue as FhirOperationOutcomeIssue,
  TestScript as FhirTestScript,
  TestScriptMetadata as FhirTestScriptMetadata,
  TestScriptMetadataCapability as FhirTestScriptMetadataCapability,
  TestScriptMetadataLink as FhirTestScriptMetadataLink,
  TestScriptSetup as FhirTestScriptSetup,
  TestScriptSetupAction as FhirTestScriptSetupAction,
  TestScriptSetupActionAssert as FhirTestScriptSetupActionAssert,
  TestScriptSetupActionOperation as FhirTestScriptSetupActionOperation,
  TestScriptSetupActionAssertRequirement as FhirTestScriptSetupActionAssertRequirement,
  TestScriptTeardown as FhirTestScriptTeardown,
  TestScriptTeardownAction as FhirTestScriptTeardownAction,
  TestScriptTest as FhirTestScriptTest,
  TestScriptTestAction as FhirTestScriptTestAction,
  Parameters as FhirParameters,
  Extension as FhirExtension,
  TestScriptOrigin as FhirTestScriptOrigin,
  TestScriptDestination as FhirTestScriptDestination,
  TestScriptFixture as FhirTestScriptFixture,
  TestScriptVariable as FhirTestScriptVariable,
  TestScriptScope as FhirTestScriptScope,
} from "fhir/r5";

/**
 * Erweiterte FHIR-Typen basierend auf @types/fhir
 * Kombiniert Standard-FHIR-Typen mit projektspezifischen Erweiterungen
 */

export type TestScriptStatus = NonNullable<FhirTestScript["status"]>;

export type TestScriptTest = FhirTestScriptTest;
export type TestScriptTestAction = FhirTestScriptTestAction;
export type TestScriptSetup = FhirTestScriptSetup;
export type TestScriptSetupAction = FhirTestScriptSetupAction;
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
