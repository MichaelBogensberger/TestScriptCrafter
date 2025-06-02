/**
 * TypeScript types for the FHIR TestScript resource
 * These types are simplified for the purpose of this application
 * and focus on the required elements first
 */

export interface Link {
    url: string
    description?: string
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
  
  export interface TestScriptMetadata {
    link?: Link[]
    capability: Capability[]
  }
  
  export interface Operation {
    type?: {
      system?: string
      code?: string
    }
    resource?: string
    label?: string
    description?: string
    accept?: string
    contentType?: string
    destination?: number
    encodeRequestUrl: boolean
    method?: string
    origin?: number
    params?: string
    requestHeader?: Array<{
      field: string
      value: string
    }>
    requestId?: string
    responseId?: string
    sourceId?: string
    targetId?: string
    url?: string
  }
  
  export interface Assertion {
    label?: string
    description?: string
    direction?: string
    compareToSourceId?: string
    compareToSourceExpression?: string
    compareToSourcePath?: string
    contentType?: string
    expression?: string
    headerField?: string
    minimumId?: string
    navigationLinks?: boolean
    operator?: string
    path?: string
    requestMethod?: string
    requestURL?: string
    resource?: string
    response?: string
    responseCode?: string
    sourceId?: string
    stopTestOnFail: boolean
    validateProfileId?: string
    value?: string
    warningOnly: boolean
  }
  
  export interface Action {
    operation?: Operation
    assert?: Assertion
  }
  
  export interface TestScriptSetup {
    action?: Action[]
  }
  
  export interface TestScriptTest {
    name?: string
    description?: string
    action?: Action[]
  }
  
  export interface TestScriptTeardown {
    action?: Action[]
  }
  
  export interface TestScript {
    resourceType: string
    id?: string
    url?: string
    identifier?: any[]
    version?: string
    name: string // Required
    title?: string
    status: string // Required
    experimental?: boolean
    date?: string
    publisher?: string
    contact?: any[]
    description?: string
    useContext?: any[]
    jurisdiction?: any[]
    purpose?: string
    copyright?: string
    metadata: TestScriptMetadata
    fixture?: any[]
    profile?: any[]
    variable?: any[]
    setup?: TestScriptSetup
    test: TestScriptTest[]
    teardown?: TestScriptTeardown
  }
  