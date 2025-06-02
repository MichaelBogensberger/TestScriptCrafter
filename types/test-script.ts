/**
 * Vollständige TypeScript-Typen für die FHIR TestScript-Ressource
 * basierend auf dem FHIR R5 Schema
 */

// Basis-Interfaces
export interface Element {
  id?: string;
  extension?: Extension[];
}

export interface Extension {
  url: string;
  value?: any;
}

// Link Interface
export interface Link {
  url: string;
  description?: string;
}

// Capability Interface
export interface Capability {
  required: boolean;
  validated: boolean;
  description?: string;
  origin?: number[];
  destination?: number;
  link?: string[];
  capabilities: string; // canonical reference
}

// TestSystem Interface
export interface TestSystem {
  index: number;
  title: string;
  actor?: string[]; // canonical references
  description?: string;
  url?: string;
}

// Metadata Interface
export interface TestScriptMetadata {
  link?: Link[];
  capability: Capability[];
}

// Scope Interface
export interface Scope {
  artifact: string; // canonical reference
  conformance?: CodeableConcept;
  phase?: CodeableConcept;
}

// CodeableConcept Interface
export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
}

// Fixture Interface
export interface Fixture {
  autocreate: boolean;
  autodelete: boolean;
  resource?: Reference;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: any;
  display?: string;
}

// Variable Interface
export interface Variable {
  name: string;
  defaultValue?: string;
  description?: string;
  expression?: string;
  headerField?: string;
  hint?: string;
  path?: string;
  sourceId?: string;
}

// Parameter Interface
export interface Parameter {
  name?: string;
  value?: string;
}

// Common Interface
export interface Common {
  testScript?: string; // canonical reference
  keyRef: string;
  parameter?: Parameter[];
}

// Operation Interface
export interface Operation {
  type?: {
    system?: string;
    code?: string;
  };
  resource?: string;
  label?: string;
  description?: string;
  accept?: string;
  contentType?: string;
  destination?: number;
  encodeRequestUrl: boolean;
  method?: string;
  origin?: number;
  params?: string;
  requestHeader?: Array<{
    field: string;
    value: string;
  }>;
  requestId?: string;
  responseId?: string;
  sourceId?: string;
  targetId?: string;
  url?: string;
}

// Assertion Interface
export interface Assertion {
  label?: string;
  description?: string;
  direction?: string; // "request" | "response"
  compareToSourceId?: string;
  compareToSourceExpression?: string;
  compareToSourcePath?: string;
  contentType?: string;
  expression?: string;
  headerField?: string;
  minimumId?: string;
  navigationLinks?: boolean;
  operator?: string; // "equals" | "notEquals" | etc.
  path?: string;
  requestMethod?: string;
  requestURL?: string;
  resource?: string;
  response?: string;
  responseCode?: string;
  sourceId?: string;
  stopTestOnFail: boolean;
  validateProfileId?: string;
  value?: string;
  warningOnly: boolean;
}

// Action Interfaces
export interface ActionBase {
  common?: Common;
}

export interface Action extends ActionBase {
  operation?: Operation;
  assert?: Assertion;
}

// Setup Interface
export interface TestScriptSetup {
  action: Action[];
}

// Test Interface
export interface TestScriptTest {
  name?: string;
  description?: string;
  action: Action[];
}

// Teardown Interface
export interface TestScriptTeardown {
  action: Action[];
}

// CommonAction Interface für den 'common' Bereich des TestScripts
export interface TestScriptCommon {
  key: string;
  name?: string;
  description?: string;
  parameter?: Parameter[];
  action: Action[];
}

// Hauptinterface für TestScript
export interface TestScript {
  resourceType: string;
  id?: string;
  url?: string;
  identifier?: any[];
  version?: string;
  name: string;
  title?: string;
  status: string;
  experimental?: boolean;
  date?: string;
  publisher?: string;
  contact?: any[];
  description?: string;
  useContext?: any[];
  jurisdiction?: CodeableConcept[];
  purpose?: string;
  copyright?: string;
  copyrightLabel?: string;
  testSystem?: TestSystem[];
  metadata?: TestScriptMetadata;
  scope?: Scope[];
  fixture?: Fixture[];
  profile?: string[]; // canonical references
  variable?: Variable[];
  setup?: TestScriptSetup;
  test?: TestScriptTest[];
  teardown?: TestScriptTeardown;
  common?: TestScriptCommon[];
}
  