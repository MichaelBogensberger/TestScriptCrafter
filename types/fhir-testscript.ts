export type TestScriptStatus = 'draft' | 'active' | 'retired' | 'unknown'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
export type OperatorType = 'equals' | 'notEquals' | 'in' | 'notIn' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains' | 'empty' | 'notEmpty' | 'eval' | 'manualEval'
export type AssertionDirectionType = 'response' | 'request'
export type AssertionResponseType = 
  'continue' | 'switchingProtocols' | 'okay' | 'created' | 'accepted' | 
  'nonAuthoritativeInformation' | 'noContent' | 'resetContent' | 'partialContent' |
  'multipleChoices' | 'movedPermanently' | 'found' | 'seeOther' | 'notModified' |
  'useProxy' | 'temporaryRedirect' | 'permanentRedirect' | 'badRequest' | 'unauthorized' |
  'paymentRequired' | 'forbidden' | 'notFound' | 'methodNotAllowed' | 'notAcceptable' |
  'proxyAuthenticationRequired' | 'requestTimeout' | 'conflict' | 'gone' | 'lengthRequired' |
  'preconditionFailed' | 'contentTooLarge' | 'uriTooLong' | 'unsupportedMediaType' |
  'rangeNotSatisfiable' | 'expectationFailed' | 'misdirectedRequest' | 'unprocessableContent' |
  'upgradeRequired' | 'internalServerError' | 'notImplemented' | 'badGateway' |
  'serviceUnavailable' | 'gatewayTimeout' | 'httpVersionNotSupported'

export interface TestOperation {
  method: HttpMethod
  url: string
  encodeRequestUrl: boolean
  description?: string
  type?: {
    system?: string
    code?: string
    display?: string
  }
  resource?: string
  label?: string
  accept?: string
  contentType?: string
  destination?: number
  origin?: number
  params?: string
  requestHeader?: {
    field: string
    value: string
  }[]
  requestId?: string
  responseId?: string
  sourceId?: string
  targetId?: string
}

export interface TestAssertion {
  path?: string
  value?: string
  operator: OperatorType
  description?: string
  warningOnly: boolean
  stopTestOnFail: boolean
  label?: string
  direction?: AssertionDirectionType
  compareToSourceId?: string
  compareToSourceExpression?: string
  compareToSourcePath?: string
  contentType?: string
  expression?: string
  headerField?: string
  minimumId?: string
  navigationLinks?: boolean
  requestMethod?: HttpMethod
  requestURL?: string
  resource?: string
  response?: AssertionResponseType
  responseCode?: string
  sourceId?: string
  validateProfileId?: string
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
  origin?: number[]
  destination?: number
  link?: string[]
}

export interface Link {
  url: string
  description?: string
}

export interface TestSystem {
  index: number
  title: string
  actor?: string[]
  description?: string
  url?: string
}

export interface Variable {
  name: string
  defaultValue?: string
  description?: string
  expression?: string
  headerField?: string
  hint?: string
  path?: string
  sourceId?: string
}

export interface Fixture {
  autocreate: boolean
  autodelete: boolean
  resource?: any
}

export interface Scope {
  artifact: string
  conformance?: string
  phase?: string
}

export interface FhirTestScript {
  resourceType: 'TestScript'
  id?: string
  url?: string
  identifier?: any[]
  version?: string
  versionAlgorithm?: string | { system?: string, code?: string, display?: string }
  name: string
  title?: string
  status: TestScriptStatus
  experimental?: boolean
  date?: string
  publisher?: string
  contact?: any[]
  description?: string
  useContext?: any[]
  jurisdiction?: any[]
  purpose?: string
  copyright?: string
  copyrightLabel?: string
  testSystem?: TestSystem[]
  metadata: {
    link?: Link[]
    capability: Capability[]
  }
  scope?: Scope[]
  fixture?: Fixture[]
  profile?: string[]
  variable?: Variable[]
  setup?: {
    action: TestAction[]
  }
  test: TestCase[]
  teardown?: {
    action: TestAction[]
  }
} 