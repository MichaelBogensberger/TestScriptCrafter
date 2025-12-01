/**
 * FHIR R4 Type Definitions
 * Re-exports spezifisch für FHIR R4
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
  Coding as FhirCoding,
  CodeableConcept as FhirCodeableConcept
} from "fhir/r4"

// R4-spezifische Features oder Unterschiede können hier definiert werden
export const R4_VERSION_INFO = {
  version: 'R4',
  versionNumber: '4.0.1',
  supportsTestReport: false
} as const
