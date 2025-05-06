export type TestScriptStatus = 'draft' | 'active' | 'retired' | 'unknown'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type OperatorType = 'equals' | 'notEquals' | 'in' | 'notIn' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains' | 'empty' | 'notEmpty'

export interface TestOperation {
  method: HttpMethod
  url: string
  encodeRequestUrl: boolean
  description?: string
}

export interface TestAssertion {
  path?: string
  value?: string
  operator: OperatorType
  description?: string
  warningOnly: boolean
  stopTestOnFail: boolean
}

export interface TestAction {
  operation?: TestOperation
  assert?: TestAssertion
}

export interface TestCase {
  name: string
  description?: string
  action: TestAction[]
}

export interface Capability {
  required: boolean
  validated: boolean
  capabilities: string
  description?: string
}

export interface FhirTestScript {
  resourceType: 'TestScript'
  id?: string
  url?: string
  name: string
  title?: string
  status: TestScriptStatus
  description?: string
  metadata: {
    capability: Capability[]
  }
  test: TestCase[]
} 