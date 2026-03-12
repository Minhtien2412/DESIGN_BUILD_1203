/**
 * API Health Check Test Script
 * Run: npx ts-node scripts/test-api-health.ts
 */

const API_BASE = "https://baotienweb.cloud/api/v1";
const API_KEY = "thietke-resort-api-key-2024";

interface EndpointTest {
  name: string;
  endpoint: string;
  expectedFields?: string[];
}

const ENDPOINTS: EndpointTest[] = [
  {
    name: "Workers Stats",
    endpoint: "/workers/stats",
    expectedFields: ["stats", "totalWorkers"],
  },
  {
    name: "Home Data",
    endpoint: "/home/data",
    expectedFields: ["success", "data"],
  },
  {
    name: "Home Banners",
    endpoint: "/banners/home",
    expectedFields: [],
  },
  {
    name: "Featured Categories",
    endpoint: "/categories/featured",
    expectedFields: [],
  },
  {
    name: "Featured Videos",
    endpoint: "/videos/featured",
    expectedFields: [],
  },
  {
    name: "Active Livestreams",
    endpoint: "/livestreams/active",
    expectedFields: [],
  },
  {
    name: "Featured Services",
    endpoint: "/home/services/featured",
    expectedFields: [],
  },
  {
    name: "Equipment Products",
    endpoint: "/home/products/equipment",
    expectedFields: [],
  },
];

async function testEndpoint(test: EndpointTest): Promise<{
  name: string;
  status: "pass" | "fail";
  message: string;
  responseTime: number;
}> {
  const start = Date.now();

  try {
    const response = await fetch(`${API_BASE}${test.endpoint}`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        name: test.name,
        status: "fail",
        message: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
      };
    }

    const data = await response.json();

    // Check expected fields if specified
    if (test.expectedFields && test.expectedFields.length > 0) {
      const missingFields = test.expectedFields.filter(
        (field) => !(field in data),
      );

      if (missingFields.length > 0) {
        return {
          name: test.name,
          status: "fail",
          message: `Missing fields: ${missingFields.join(", ")}`,
          responseTime,
        };
      }
    }

    return {
      name: test.name,
      status: "pass",
      message: "OK",
      responseTime,
    };
  } catch (error) {
    return {
      name: test.name,
      status: "fail",
      message: error instanceof Error ? error.message : "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}

async function runTests() {
  console.log("🔍 Testing API Endpoints...\n");
  console.log(`Base URL: ${API_BASE}`);
  console.log("─".repeat(60));

  const results = await Promise.all(ENDPOINTS.map(testEndpoint));

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const icon = result.status === "pass" ? "✅" : "❌";
    const time = `${result.responseTime}ms`;
    console.log(
      `${icon} ${result.name.padEnd(25)} ${time.padStart(8)} - ${result.message}`,
    );

    if (result.status === "pass") passed++;
    else failed++;
  }

  console.log("─".repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("\n🎉 All endpoints are healthy!");
  } else {
    console.log("\n⚠️  Some endpoints need attention.");
  }
}

// Run if executed directly
runTests().catch(console.error);
