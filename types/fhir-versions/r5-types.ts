/**
 * FHIR R5 Type Definitions
 * Re-exports spezifisch für FHIR R5
 */

export type {
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
  Coding as FhirCoding,
  CodeableConcept as FhirCodeableConcept
} from "fhir/r5"

// R5-spezifische Features
export const R5_VERSION_INFO = {
  version: 'R5',
  versionNumber: '5.0.0',
  supportsTestReport: true,
  supportsScope: true
} as const
