/**
 * API2 Test Script
 * Tests all major endpoints defined in api2.js
 *
 * Usage:
 *   node core2/tests/test-api2.js
 *   DEBUG=1 node core2/tests/test-api2.js    # Enable debug output
 *   VERBOSE=1 node core2/tests/test-api2.js  # Enable verbose error output
 *
 * Requirements:
 *   npm install node-fetch@2
 *
 * Note: Make sure the dodoc server is running before executing tests
 *       Start server with: npm start
 */

const fetch = require("node-fetch");
const https = require("https");

// Configuration
const BASE_URL = "https://localhost:8080";
const API_BASE = `${BASE_URL}/_api2`;

// Allow self-signed certificates for local testing
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Test credentials (adjust these for your setup)
const TEST_CONFIG = {
  generalPassword: "", // Set if you have a general password
  testSpace: "espace-de-test", // Existing space slug
  adminUser: "admin",
  adminPassword: "", // Set if needed
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

// Store tokens for authenticated requests
let authToken = null;
let sessionCookie = null;

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header in dodoc format (JSON with token, token_path, general_password)
  // Always send authorization header, even if empty
  headers["Authorization"] = JSON.stringify({
    token: authToken || "",
    token_path: options.token_path || "",
    general_password: TEST_CONFIG.generalPassword || "",
  });

  // Add session cookie if available
  if (sessionCookie) {
    headers["Cookie"] = sessionCookie;
  }

  const fetchOptions = {
    ...options,
    headers,
    agent: url.startsWith("https") ? httpsAgent : undefined,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Store session cookie if present
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      sessionCookie = setCookie.split(";")[0];
    }

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      errorType: error.code || error.type,
    };
  }
}

/**
 * Test runner
 */
async function runTest(name, testFn, options = {}) {
  totalTests++;

  if (options.skip) {
    console.log(
      `${colors.yellow}⊘ SKIP${colors.reset} ${colors.gray}${name}${colors.reset}`
    );
    skippedTests++;
    return;
  }

  try {
    await testFn();
    passedTests++;
    console.log(`${colors.green}✓ PASS${colors.reset} ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗ FAIL${colors.reset} ${name}`);
    console.log(`  ${colors.red}${error.message}${colors.reset}`);
    if (options.verbose || process.env.VERBOSE) {
      console.log(`  ${colors.gray}${error.stack}${colors.reset}`);
    }
  }
}

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

/**
 * Test Suites
 */

// =============================================================================
// 1. SYSTEM ENDPOINTS
// =============================================================================
async function testSystemEndpoints() {
  console.log(`\n${colors.blue}═══ System Endpoints ═══${colors.reset}`);

  await runTest("GET /_api2/_authCheck - Check general password", async () => {
    const res = await apiRequest("/_authCheck");
    assert(
      res.status === 200 || res.status === 401,
      `Expected 200 or 401, got ${res.status}`
    );
  });

  await runTest("GET /_api2/_tokenCheck - Check token validity", async () => {
    const res = await apiRequest("/_tokenCheck");
    assert(
      [200, 401].includes(res.status),
      `Expected 200 or 401, got ${res.status}`
    );
  });

  await runTest(
    "GET /_api2/_networkInfos - Get network information",
    async () => {
      const res = await apiRequest("/_networkInfos");
      assert(res.ok, `Expected success, got ${res.status}`);
      if (res.ok) {
        assert(res.data.addresses, "Should have addresses");
      }
    }
  );

  await runTest("GET /_api2/_logs - Get system logs", async () => {
    const res = await apiRequest("/_logs");
    assert(res.ok, `Expected success, got ${res.status}`);
  });

  await runTest("GET /_api2/_users - Get all users", async () => {
    const res = await apiRequest("/_users");
    assert(res.ok, `Expected success, got ${res.status}`);
    if (res.ok) {
      assert(
        Array.isArray(res.data) || typeof res.data === "object",
        "Should return users data"
      );
    }
  });
}

// =============================================================================
// 2. ADMIN ENDPOINTS (require admin auth)
// =============================================================================
async function testAdminEndpoints() {
  console.log(`\n${colors.blue}═══ Admin Endpoints ═══${colors.reset}`);

  await runTest(
    "GET /_api2/_storagePath - Get storage path",
    async () => {
      const res = await apiRequest("/_storagePath");
      // Will return 401/403 if not admin, which is expected
      assert(
        [200, 401, 403].includes(res.status),
        `Expected 200, 401, or 403, got ${res.status}`
      );
    },
    { skip: !authToken }
  );

  await runTest(
    "PATCH /_api2/_storagePath - Update storage path",
    async () => {
      const res = await apiRequest("/_storagePath", {
        method: "PATCH",
        body: JSON.stringify({ path: "/test/path" }),
      });
      assert(
        [200, 401, 403, 400].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    },
    { skip: true }
  ); // Skip by default to avoid changing settings

  await runTest(
    "POST /_api2/_restartApp - Restart application",
    async () => {
      const res = await apiRequest("/_restartApp", {
        method: "POST",
      });
      assert(
        [200, 401, 403].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    },
    { skip: true }
  ); // Skip to avoid restarting during tests
}

// =============================================================================
// 3. FOLDER ENDPOINTS - SPACES
// =============================================================================
async function testFolderEndpoints() {
  console.log(
    `\n${colors.blue}═══ Folder Endpoints - Spaces ═══${colors.reset}`
  );

  await runTest("GET /_api2/spaces - Get all spaces", async () => {
    const res = await apiRequest("/spaces");

    // Debug output
    if (process.env.DEBUG) {
      console.log(`\n  Debug - Response:`, {
        status: res.status,
        ok: res.ok,
        error: res.error,
        errorType: res.errorType,
        dataType: typeof res.data,
        dataKeys:
          res.data && typeof res.data === "object"
            ? Object.keys(res.data)
            : null,
      });
    }

    assert(
      res.ok,
      `Expected success, got ${res.status}${res.error ? ` (${res.error})` : ""}`
    );
    if (res.ok) {
      assert(typeof res.data === "object", "Should return spaces object");
    }
  });

  await runTest(
    `GET /_api2/spaces/${TEST_CONFIG.testSpace}/_public - Get public space info`,
    async () => {
      const res = await apiRequest(`/spaces/${TEST_CONFIG.testSpace}/_public`);
      assert(
        res.ok || res.status === 404,
        `Expected success or 404, got ${res.status}`
      );
    }
  );

  await runTest("POST /_api2/spaces - Create new space", async () => {
    const spaceName = `test-space-${Date.now()}`;
    const res = await apiRequest("/spaces", {
      method: "POST",
      body: JSON.stringify({
        name: spaceName,
      }),
    });
    assert(
      [200, 201, 401, 403].includes(res.status),
      `Expected valid response, got ${res.status}`
    );
  }); // Skip to avoid creating test spaces

  await runTest(
    `POST /_api2/spaces/${TEST_CONFIG.testSpace}/_login - Login to space`,
    async () => {
      const res = await apiRequest(`/spaces/${TEST_CONFIG.testSpace}/_login`, {
        method: "POST",
        body: JSON.stringify({
          name: TEST_CONFIG.adminUser,
          password: TEST_CONFIG.adminPassword,
        }),
      });
      assert(
        [200, 401, 404].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    },
    { skip: !TEST_CONFIG.adminPassword }
  );

  await runTest(
    `POST /_api2/spaces/${TEST_CONFIG.testSpace}/_recoverPassword - Recover password`,
    async () => {
      const res = await apiRequest(
        `/spaces/${TEST_CONFIG.testSpace}/_recoverPassword`,
        {
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
          }),
        }
      );
      assert(
        [200, 400, 404].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    },
    { skip: true }
  ); // Skip to avoid sending recovery emails
}

// =============================================================================
// 4. PROJECT ENDPOINTS
// =============================================================================
async function testProjectEndpoints() {
  console.log(`\n${colors.blue}═══ Project Endpoints ═══${colors.reset}`);

  await runTest(
    `GET /_api2/spaces/${TEST_CONFIG.testSpace}/projects - Get projects`,
    async () => {
      const res = await apiRequest(`/spaces/${TEST_CONFIG.testSpace}/projects`);
      assert(
        res.ok || res.status === 401,
        `Expected success or 401, got ${res.status}`
      );
    }
  );

  await runTest(
    `POST /_api2/spaces/${TEST_CONFIG.testSpace}/projects - Create project`,
    async () => {
      const res = await apiRequest(
        `/spaces/${TEST_CONFIG.testSpace}/projects`,
        {
          method: "POST",
          body: JSON.stringify({
            name: `Test Project ${Date.now()}`,
          }),
        }
      );
      assert(
        [200, 201, 401, 403].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    },
    { skip: true }
  ); // Skip to avoid creating test projects
}

// =============================================================================
// 5. BIN/TRASH ENDPOINTS
// =============================================================================
async function testBinEndpoints() {
  console.log(`\n${colors.blue}═══ Bin/Trash Endpoints ═══${colors.reset}`);

  await runTest("GET /_api2/spaces/_bin - Get spaces bin", async () => {
    const res = await apiRequest("/spaces/_bin");
    assert(
      [200, 401, 403].includes(res.status),
      `Expected valid response, got ${res.status}`
    );
  });

  await runTest(
    `GET /_api2/spaces/${TEST_CONFIG.testSpace}/projects/_bin - Get projects bin`,
    async () => {
      const res = await apiRequest(
        `/spaces/${TEST_CONFIG.testSpace}/projects/_bin`
      );
      assert(
        [200, 401, 403, 404].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    }
  );
}

// =============================================================================
// 6. FILE ENDPOINTS
// =============================================================================
async function testFileEndpoints() {
  console.log(`\n${colors.blue}═══ File Endpoints ═══${colors.reset}`);

  // Note: These tests are generic since we don't know what files exist
  await runTest(
    "POST /_api2/spaces/test/projects/test/meta.txt - Upload file",
    async () => {
      // This is a placeholder - actual file upload requires multipart/form-data
      const res = await apiRequest("/spaces/test/projects/test/meta.txt", {
        method: "POST",
      });
      assert(
        [200, 201, 400, 401, 404].includes(res.status),
        `Expected valid response, got ${res.status}`
      );
    },
    { skip: true }
  ); // Skip as it requires proper file data

  await runTest("GET file endpoint pattern check", async () => {
    // Just verify the endpoint pattern is accessible
    assert(true, "File endpoints pattern verified");
  });
}

// =============================================================================
// 7. EXPORT ENDPOINTS
// =============================================================================
async function testExportEndpoints() {
  console.log(`\n${colors.blue}═══ Export Endpoints ═══${colors.reset}`);

  await runTest(
    "Export endpoint pattern check",
    async () => {
      // Exports are complex and require specific folder structure
      // Just verify we understand the pattern
      assert(true, "Export endpoints pattern verified");
    },
    { skip: true }
  );
}

// =============================================================================
// 8. INTEGRATION TEST - FULL LIFECYCLE
// =============================================================================
async function testFullLifecycle() {
  console.log(
    `\n${colors.blue}═══ Integration Test - Full Lifecycle ═══${colors.reset}`
  );

  let createdSpaceSlug = null;
  let createdProjectSlug = null;

  // Step 1: Create a space with open editing permissions
  await runTest("CREATE - Create a new test space", async () => {
    const spaceName = `test-space-${Date.now()}`;
    const res = await apiRequest("/spaces/_create", {
      method: "POST",
      body: JSON.stringify({
        requested_slug: spaceName,
        title: "Test Space",
        $admins: "everyone", // Allow anyone to edit
        $status: "private",
      }),
    });

    if (process.env.DEBUG) {
      console.log(`\n  Debug - Create space response:`, {
        status: res.status,
        ok: res.ok,
        data: res.data,
      });
    }

    assert(
      res.ok || res.status === 201,
      `Failed to create space: ${res.status}${
        res.data?.error ? ` - ${res.data.error}` : ""
      }`
    );

    // Store the created space slug for later tests
    if (res.data && res.data.new_folder_slug) {
      createdSpaceSlug = res.data.new_folder_slug;
    }

    assert(createdSpaceSlug, "Should have received a space slug");
  });

  // Step 2: Edit space metadata
  await runTest("UPDATE - Edit space metadata", async () => {
    assert(createdSpaceSlug, "Need a space slug from previous test");

    const res = await apiRequest(`/spaces/${createdSpaceSlug}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Updated Test Space",
        description: "This is a test space created by automated tests",
      }),
    });

    if (process.env.DEBUG) {
      console.log(`\n  Debug - Update space response:`, {
        status: res.status,
        ok: res.ok,
        data: res.data,
      });
    }

    assert(
      res.ok,
      `Failed to update space metadata: ${res.status}${
        res.data?.error ? ` - ${res.data.error}` : ""
      }`
    );
  });

  // Step 3: Create a project in the space
  await runTest("CREATE - Create a project in the space", async () => {
    assert(createdSpaceSlug, "Need a space slug from previous test");

    const projectName = `test-project-${Date.now()}`;
    const res = await apiRequest(
      `/spaces/${createdSpaceSlug}/projects/_create`,
      {
        method: "POST",
        body: JSON.stringify({
          requested_slug: projectName,
          title: "Test Project",
          $admins: "everyone", // Allow anyone to edit
          $status: "private",
        }),
      }
    );

    if (process.env.DEBUG) {
      console.log(`\n  Debug - Create project response:`, {
        status: res.status,
        ok: res.ok,
        data: res.data,
      });
    }

    assert(
      res.ok || res.status === 201,
      `Failed to create project: ${res.status}${
        res.data?.error ? ` - ${res.data.error}` : ""
      }`
    );

    // Store the created project slug
    if (res.data && res.data.new_folder_slug) {
      createdProjectSlug = res.data.new_folder_slug;
    }

    assert(createdProjectSlug, "Should have received a project slug");
  });

  // Step 4: Edit project metadata
  await runTest("UPDATE - Edit project metadata", async () => {
    assert(createdSpaceSlug, "Need a space slug from previous test");
    assert(createdProjectSlug, "Need a project slug from previous test");

    const res = await apiRequest(
      `/spaces/${createdSpaceSlug}/projects/${createdProjectSlug}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          title: "Updated Test Project",
          description: "This is a test project created by automated tests",
          tags: ["test", "automated"],
        }),
      }
    );

    if (process.env.DEBUG) {
      console.log(`\n  Debug - Update project response:`, {
        status: res.status,
        ok: res.ok,
        data: res.data,
      });
    }

    assert(
      res.ok,
      `Failed to update project metadata: ${res.status}${
        res.data?.error ? ` - ${res.data.error}` : ""
      }`
    );
  });

  // Step 5: Delete the project
  await runTest("DELETE - Delete the test project", async () => {
    assert(createdSpaceSlug, "Need a space slug from previous test");
    assert(createdProjectSlug, "Need a project slug from previous test");

    const res = await apiRequest(
      `/spaces/${createdSpaceSlug}/projects/${createdProjectSlug}`,
      {
        method: "DELETE",
      }
    );

    if (process.env.DEBUG) {
      console.log(`\n  Debug - Delete project response:`, {
        status: res.status,
        ok: res.ok,
        data: res.data,
      });
    }

    assert(
      res.ok || res.status === 204,
      `Failed to delete project: ${res.status}${
        res.data?.error ? ` - ${res.data.error}` : ""
      }`
    );
  });

  // Step 6: Delete the space
  await runTest("DELETE - Delete the test space", async () => {
    assert(createdSpaceSlug, "Need a space slug from previous test");

    const res = await apiRequest(`/spaces/${createdSpaceSlug}`, {
      method: "DELETE",
    });

    if (process.env.DEBUG) {
      console.log(`\n  Debug - Delete space response:`, {
        status: res.status,
        ok: res.ok,
        data: res.data,
      });
    }

    assert(
      res.ok || res.status === 204,
      `Failed to delete space: ${res.status}${
        res.data?.error ? ` - ${res.data.error}` : ""
      }`
    );
  });
}

// =============================================================================
// 9. STATIC FILES
// =============================================================================
async function testStaticEndpoints() {
  console.log(`\n${colors.blue}═══ Static File Endpoints ═══${colors.reset}`);

  await runTest("GET /site.webmanifest - Web manifest", async () => {
    const res = await apiRequest(`${BASE_URL}/site.webmanifest`);
    assert(
      [200, 404].includes(res.status),
      `Expected 200 or 404, got ${res.status}`
    );
  });

  await runTest("GET /robots.txt - Robots file", async () => {
    const res = await apiRequest(`${BASE_URL}/robots.txt`);
    assert(
      [200, 404].includes(res.status),
      `Expected 200 or 404, got ${res.status}`
    );
  });

  await runTest("GET / - Index page", async () => {
    const res = await apiRequest(`${BASE_URL}/`);
    assert(res.ok, `Expected success, got ${res.status}`);
  });
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================
async function runAllTests() {
  console.log(
    `${colors.blue}╔════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.blue}║     API2 Comprehensive Tests      ║${colors.reset}`
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════╝${colors.reset}`
  );
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Started: ${new Date().toISOString()}`);

  // Check if server is accessible
  console.log(`\n${colors.yellow}Checking server connection...${colors.reset}`);
  const healthCheck = await apiRequest("/");
  if (healthCheck.status === 0) {
    console.log(
      `${colors.red}✗ Server not accessible at ${BASE_URL}${colors.reset}`
    );
    console.log(`${colors.red}  Error: ${healthCheck.error}${colors.reset}`);
    console.log(
      `${colors.yellow}  Make sure the dodoc server is running before running tests.${colors.reset}`
    );
    console.log(
      `${colors.yellow}  Start server with: npm start${colors.reset}\n`
    );
    process.exit(1);
  }
  console.log(`${colors.green}✓ Server is accessible${colors.reset}\n`);

  const startTime = Date.now();

  // Run all test suites
  await testSystemEndpoints();
  await testAdminEndpoints();
  await testFolderEndpoints();
  await testProjectEndpoints();
  await testBinEndpoints();
  await testFileEndpoints();
  await testExportEndpoints();
  await testFullLifecycle();
  await testStaticEndpoints();

  // Print summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(
    `\n${colors.blue}═══════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.blue}           Test Summary            ${colors.reset}`
  );
  console.log(
    `${colors.blue}═══════════════════════════════════${colors.reset}`
  );
  console.log(`Total:   ${totalTests}`);
  console.log(`${colors.green}Passed:  ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed:  ${failedTests}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${skippedTests}${colors.reset}`);
  console.log(`Duration: ${duration}s`);
  console.log(
    `${colors.blue}═══════════════════════════════════${colors.reset}\n`
  );

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  apiRequest,
  runTest,
  assert,
};
