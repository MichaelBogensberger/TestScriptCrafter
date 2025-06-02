import type { TestScript } from "@/types/test-script"

/**
 * Initial TestScript data structure
 * This provides a starting point for the TestScript builder
 * with the required elements already populated
 */
export const initialTestScript: TestScript = {
  resourceType: "TestScript",
  name: "ExampleTestScript", // Required
  status: "draft", // Required
  metadata: {
    capability: [
      {
        required: true, // Required
        validated: true, // Required
        capabilities: "CapabilityStatement/example", // Required
        description: "FHIR REST support",
      },
    ],
  },
  test: [
    {
      name: "Test Case 1",
      description: "Initial test case",
      action: [],
    },
  ],
  setup: {
    action: [],
  },
  teardown: {
    action: [],
  },
}
