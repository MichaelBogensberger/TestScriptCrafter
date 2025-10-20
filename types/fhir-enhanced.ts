/**
 * Erweiterte FHIR-Typen basierend auf @types/fhir
 * Kombiniert Standard-FHIR-Typen mit spezifischen TestScript-Erweiterungen
 */

// Re-export der Standard-FHIR-Typen für bessere Lesbarkeit
export type {
  Element,
  Extension,
  CodeableConcept,
  Identifier,
  ContactDetail,
  UsageContext,
  Coding,
  Reference,
  Narrative,
  Resource,
  DomainResource,
  BackboneElement,
  TestScript as FhirTestScript,
  TestScriptSetup,
  TestScriptTest,
  TestScriptTeardown,
  TestScriptAction,
  TestScriptAssert,
  TestScriptOperation,
  TestScriptCapability,
  TestScriptMetadata,
  TestScriptFixture,
  TestScriptVariable,
  TestScriptScope,
  TestScriptCommon,
  TestScriptTestAction,
  TestScriptSetupAction,
  TestScriptTeardownAction,
  OperationOutcome,
  OperationOutcomeIssue
} from '@types/fhir';

// Erweiterte Typen für bessere TypeScript-Unterstützung
export interface TestScript extends fhir2.TestScript {
  // Zusätzliche Eigenschaften für unsere Anwendung
  testSystem?: TestSystem[];
  scope?: Scope[];
  common?: TestScriptCommon[];
}

// Erweiterte Interfaces für bessere Funktionalität
export interface TestSystem {
  index: number;
  title: string;
  actor?: string[]; // canonical references
  description?: string;
  url?: string;
}

export interface Scope {
  artifact: string; // canonical reference
  conformance?: string; // canonical reference
  phase?: string; // canonical reference
}

// Validierungs-Typen
export interface ValidationIssue {
  severity: 'fatal' | 'error' | 'warning' | 'information';
  code: string;
  details: {
    text: string;
  };
  location?: string[];
  line?: number;
  column?: number;
  expression?: string | null;
}

export interface ValidationResult {
  resourceType: 'OperationOutcome';
  issue: ValidationIssue[];
}

// Utility-Typen für bessere Entwicklererfahrung
export type TestScriptStatus = 'draft' | 'active' | 'retired' | 'unknown';
export type TestScriptActionType = 'setup' | 'test' | 'teardown' | 'common';
export type AssertionType = 'equals' | 'notEquals' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'contains' | 'notContains' | 'eval';

// Erweiterte Action-Typen mit besserer Type-Safety
export interface EnhancedTestScriptAction extends fhir2.TestScriptAction {
  operation?: EnhancedTestScriptOperation;
  assert?: EnhancedTestScriptAssert;
}

export interface EnhancedTestScriptOperation extends fhir2.TestScriptOperation {
  type?: fhir2.Coding;
  resource?: string;
  label?: string;
  description?: string;
  accept?: string;
  contentType?: string;
  destination?: number;
  encodeRequestUrl?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  origin?: number;
  params?: string;
  requestHeader?: TestScriptRequestHeader[];
  requestId?: string;
  responseId?: string;
  sourceId?: string;
  targetId?: string;
  url?: string;
}

export interface EnhancedTestScriptAssert extends fhir2.TestScriptAssert {
  label?: string;
  description?: string;
  direction?: 'response' | 'request';
  compareToSourceId?: string;
  compareToSourceExpression?: string;
  compareToSourcePath?: string;
  contentType?: string;
  expression?: string;
  headerField?: string;
  minimumId?: string;
  navigationLinks?: boolean;
  operator?: AssertionType;
  path?: string;
  requestMethod?: string;
  requestURL?: string;
  resource?: string;
  response?: 'okay' | 'created' | 'noContent' | 'notModified' | 'bad' | 'forbidden' | 'notFound' | 'methodNotAllowed' | 'conflict' | 'gone' | 'preconditionFailed' | 'unprocessable';
  responseCode?: string;
  rule?: TestScriptRule;
  validateProfileId?: string;
  value?: string;
  warningOnly?: boolean;
}

export interface TestScriptRequestHeader {
  field: string;
  value: string;
}

export interface TestScriptRule {
  id?: string;
  parameter?: TestScriptRuleParameter[];
  rule?: string[];
}

export interface TestScriptRuleParameter {
  name: string;
  value?: string;
}

// Namespace für globale FHIR-Typen
declare global {
  namespace fhir2 {
    // @types/fhir stellt bereits alle benötigten Typen bereit
  }
}
