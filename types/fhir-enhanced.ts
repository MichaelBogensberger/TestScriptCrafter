/**
 * Erweiterte FHIR-Typen basierend auf @types/fhir
 * Kombiniert Standard-FHIR-Typen mit spezifischen TestScript-Erweiterungen
 */

// Vereinfachte FHIR-Typen für bessere Kompatibilität
export interface TestScript {
  resourceType: "TestScript";
  id?: string;
  url?: string;
  identifier?: any[];
  version?: string;
  name: string;
  title?: string;
  status: "draft" | "active" | "retired" | "unknown";
  experimental?: boolean;
  date?: string;
  publisher?: string;
  contact?: any[];
  description?: string;
  useContext?: any[];
  jurisdiction?: any[];
  purpose?: string;
  copyright?: string;
  copyrightLabel?: string;
  testSystem?: TestSystem[];
  metadata?: TestScriptMetadata;
  scope?: Scope[];
  fixture?: any[];
  profile?: string[];
  variable?: any[];
  setup?: TestScriptSetup;
  test?: TestScriptTest[];
  teardown?: TestScriptTeardown;
  common?: any[];
}

export interface TestScriptTest {
  id?: string;
  name?: string;
  description?: string;
  action?: TestScriptAction[];
}

export interface TestScriptSetup {
  id?: string;
  action?: TestScriptAction[];
}

export interface TestScriptTeardown {
  id?: string;
  action?: TestScriptAction[];
}

export interface TestScriptAction {
  id?: string;
  operation?: TestScriptOperation;
  assert?: TestScriptAssert;
}

export interface TestScriptOperation {
  id?: string;
  type?: any;
  resource?: string;
  label?: string;
  description?: string;
  accept?: string;
  contentType?: string;
  destination?: number;
  encodeRequestUrl?: boolean;
  method?: string;
  origin?: number;
  params?: string;
  requestHeader?: any[];
  requestId?: string;
  responseId?: string;
  sourceId?: string;
  targetId?: string;
  url?: string;
}

export interface TestScriptAssert {
  id?: string;
  label?: string;
  description?: string;
  direction?: "response" | "request";
  compareToSourceId?: string;
  compareToSourceExpression?: string;
  compareToSourcePath?: string;
  contentType?: string;
  expression?: string;
  headerField?: string;
  minimumId?: string;
  navigationLinks?: boolean;
  operator?: string;
  path?: string;
  requestMethod?: string;
  requestURL?: string;
  resource?: string;
  response?: string;
  responseCode?: string;
  rule?: any;
  validateProfileId?: string;
  value?: string;
  warningOnly?: boolean;
}

export interface TestScriptMetadata {
  id?: string;
  link?: any[];
  capability?: TestScriptCapability[];
}

export interface TestScriptCapability {
  id?: string;
  required?: boolean;
  validated?: boolean;
  description?: string;
  origin?: number[];
  destination?: number;
  link?: string[];
  capabilities?: string;
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
export interface EnhancedTestScriptAction extends TestScriptAction {
  operation?: EnhancedTestScriptOperation;
  assert?: EnhancedTestScriptAssert;
}

export interface EnhancedTestScriptOperation extends TestScriptOperation {
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

export interface EnhancedTestScriptAssert extends TestScriptAssert {
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
