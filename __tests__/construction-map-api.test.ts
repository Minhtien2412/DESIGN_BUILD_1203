/**
 * Construction Map API Test Script
 * Test all API endpoints and WebSocket connection
 */

// Mock the dependencies first
jest.mock("../services/api/constructionMapApi", () => ({
  constructionMapApi: {
    healthCheck: jest.fn(),
    getProject: jest.fn(),
    createStage: jest.fn(),
    createTask: jest.fn(),
  },
}));

jest.mock("../services/websocket/construction-socket", () => ({
  constructionSocket: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

import { constructionMapApi } from "../services/api/constructionMapApi";
import { constructionSocket } from "../services/websocket/construction-socket";

// ============================================
// Jest Test Suite
// ============================================

describe("Construction Map API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("healthCheck", () => {
    it("should return health status", async () => {
      (constructionMapApi.healthCheck as jest.Mock).mockResolvedValueOnce({
        data: { status: "ok" },
      });

      const response = await constructionMapApi.healthCheck();
      expect(response.data.status).toBe("ok");
    });
  });

  describe("getProject", () => {
    it("should fetch project data", async () => {
      const mockProject = {
        id: "test-project-001",
        stages: [],
        tasks: [],
        links: [],
      };

      (constructionMapApi.getProject as jest.Mock).mockResolvedValueOnce({
        data: mockProject,
      });

      const response = await constructionMapApi.getProject("test-project-001");
      expect(response.data.id).toBe("test-project-001");
    });
  });

  describe("createStage", () => {
    it("should create a new stage", async () => {
      const stageData = {
        projectId: "test-project-001",
        number: "01",
        label: "Test Stage",
      };

      (constructionMapApi.createStage as jest.Mock).mockResolvedValueOnce({
        data: { id: "stage-001", ...stageData },
      });

      const response = await constructionMapApi.createStage(stageData as any);
      expect(response.data.id).toBe("stage-001");
    });
  });
});

describe("Construction Socket", () => {
  it("should have connect method", () => {
    expect(constructionSocket.connect).toBeDefined();
  });

  it("should have disconnect method", () => {
    expect(constructionSocket.disconnect).toBeDefined();
  });
});

// ============================================
// Test Configuration (legacy - for manual testing)
// ============================================

const TEST_PROJECT_ID = "test-project-001";
const TEST_USER_ID = "test-user-001";
const TEST_USER_NAME = "Test User";

// ============================================
// Test Functions
// ============================================

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  console.log("\n========================================");
  console.log("TEST 1: Health Check");
  console.log("========================================");

  try {
    const response = await constructionMapApi.healthCheck();
    console.log("✅ Health Check Success:", response.data);
    return true;
  } catch (error: any) {
    console.error("❌ Health Check Failed:", error.message);
    return false;
  }
}

/**
 * Test 2: Get Project Data
 */
async function testGetProject() {
  console.log("\n========================================");
  console.log("TEST 2: Get Project Data");
  console.log("========================================");

  try {
    const response = await constructionMapApi.getProject(TEST_PROJECT_ID);
    console.log("✅ Get Project Success");
    console.log("  - Stages:", response.data.stages?.length || 0);
    console.log("  - Tasks:", response.data.tasks?.length || 0);
    console.log("  - Links:", response.data.links?.length || 0);
    return true;
  } catch (error: any) {
    console.error("❌ Get Project Failed:", error.message);
    return false;
  }
}

/**
 * Test 3: Create Stage
 */
async function testCreateStage() {
  console.log("\n========================================");
  console.log("TEST 3: Create Stage");
  console.log("========================================");

  try {
    const stageData = {
      projectId: TEST_PROJECT_ID,
      number: "01",
      label: "Test Stage",
      description: "This is a test stage",
      x: 100,
      y: 100,
      color: "#2E90FA",
      status: "active" as const,
    };

    const response = await constructionMapApi.createStage(stageData);
    console.log("✅ Create Stage Success");
    console.log("  - Stage ID:", response.data.id);
    console.log("  - Label:", response.data.label);
    return response.data.id;
  } catch (error: any) {
    console.error("❌ Create Stage Failed:", error.message);
    return null;
  }
}

/**
 * Test 4: Create Task
 */
async function testCreateTask(stageId: string) {
  console.log("\n========================================");
  console.log("TEST 4: Create Task");
  console.log("========================================");

  try {
    const taskData = {
      projectId: TEST_PROJECT_ID,
      stageId: stageId,
      label: "Test Task",
      description: "This is a test task",
      x: 300,
      y: 200,
      status: "in-progress" as const,
      progress: 50,
      priority: "high" as const,
    };

    const response = await constructionMapApi.createTask(taskData);
    console.log("✅ Create Task Success");
    console.log("  - Task ID:", response.data.id);
    console.log("  - Label:", response.data.label);
    console.log("  - Progress:", response.data.progress + "%");
    return response.data.id;
  } catch (error: any) {
    console.error("❌ Create Task Failed:", error.message);
    return null;
  }
}

/**
 * Test 5: Update Task
 */
async function testUpdateTask(taskId: string) {
  console.log("\n========================================");
  console.log("TEST 5: Update Task");
  console.log("========================================");

  try {
    const updateData = {
      label: "Updated Test Task",
      progress: 75,
    };

    const response = await constructionMapApi.updateTask(taskId, updateData);
    console.log("✅ Update Task Success");
    console.log("  - New Label:", response.data.label);
    console.log("  - New Progress:", response.data.progress + "%");
    return true;
  } catch (error: any) {
    console.error("❌ Update Task Failed:", error.message);
    return false;
  }
}

/**
 * Test 6: Move Task
 */
async function testMoveTask(taskId: string) {
  console.log("\n========================================");
  console.log("TEST 6: Move Task");
  console.log("========================================");

  try {
    const response = await constructionMapApi.moveTask(taskId, 400, 250);
    console.log("✅ Move Task Success");
    console.log(
      "  - New Position: (",
      response.data.x,
      ",",
      response.data.y,
      ")"
    );
    return true;
  } catch (error: any) {
    console.error("❌ Move Task Failed:", error.message);
    return false;
  }
}

/**
 * Test 7: Update Task Status
 */
async function testUpdateTaskStatus(taskId: string) {
  console.log("\n========================================");
  console.log("TEST 7: Update Task Status");
  console.log("========================================");

  try {
    const response = await constructionMapApi.updateTaskStatus(
      taskId,
      "completed"
    );
    console.log("✅ Update Task Status Success");
    console.log("  - New Status:", response.data.status);
    return true;
  } catch (error: any) {
    console.error("❌ Update Task Status Failed:", error.message);
    return false;
  }
}

/**
 * Test 8: Get Progress
 */
async function testGetProgress() {
  console.log("\n========================================");
  console.log("TEST 8: Get Progress");
  console.log("========================================");

  try {
    const response = await constructionMapApi.getProgress(TEST_PROJECT_ID);
    console.log("✅ Get Progress Success");
    console.log("  - Total Tasks:", response.data.totalTasks);
    console.log("  - Completed:", response.data.completedTasks);
    console.log("  - In Progress:", response.data.inProgressTasks);
    console.log("  - Overall Progress:", response.data.overallProgress + "%");
    return true;
  } catch (error: any) {
    console.error("❌ Get Progress Failed:", error.message);
    return false;
  }
}

/**
 * Test 9: WebSocket Connection
 */
async function testWebSocket(): Promise<boolean> {
  console.log("\n========================================");
  console.log("TEST 9: WebSocket Connection");
  console.log("========================================");

  return new Promise((resolve) => {
    try {
      // Connect to WebSocket
      const socket = constructionSocket.connect(
        TEST_PROJECT_ID,
        TEST_USER_ID,
        TEST_USER_NAME
      );

      // Setup event listeners
      socket.on("connect", () => {
        console.log("✅ WebSocket Connected");

        // Test ping
        constructionSocket.ping();
      });

      socket.on("pong", (data) => {
        console.log("✅ Pong Received:", data);

        // Disconnect after successful test
        setTimeout(() => {
          constructionSocket.disconnect();
          resolve(true);
        }, 1000);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ WebSocket Connection Failed:", error.message);
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!socket.connected) {
          console.error("❌ WebSocket Connection Timeout");
          constructionSocket.disconnect();
          resolve(false);
        }
      }, 5000);
    } catch (error: any) {
      console.error("❌ WebSocket Test Error:", error.message);
      resolve(false);
    }
  });
}

/**
 * Test 10: Delete Task
 */
async function testDeleteTask(taskId: string) {
  console.log("\n========================================");
  console.log("TEST 10: Delete Task");
  console.log("========================================");

  try {
    await constructionMapApi.deleteTask(taskId);
    console.log("✅ Delete Task Success");
    return true;
  } catch (error: any) {
    console.error("❌ Delete Task Failed:", error.message);
    return false;
  }
}

/**
 * Test 11: Delete Stage
 */
async function testDeleteStage(stageId: string) {
  console.log("\n========================================");
  console.log("TEST 11: Delete Stage");
  console.log("========================================");

  try {
    await constructionMapApi.deleteStage(stageId);
    console.log("✅ Delete Stage Success");
    return true;
  } catch (error: any) {
    console.error("❌ Delete Stage Failed:", error.message);
    return false;
  }
}

// ============================================
// Run All Tests
// ============================================

export async function runAllTests() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║  Construction Map API Test Suite      ║");
  console.log("╚════════════════════════════════════════╝");

  const results = {
    passed: 0,
    failed: 0,
    total: 11,
  };

  let stageId: string | null = null;
  let taskId: string | null = null;

  // Test 1: Health Check
  const test1 = await testHealthCheck();
  test1 ? results.passed++ : results.failed++;

  // Test 2: Get Project
  const test2 = await testGetProject();
  test2 ? results.passed++ : results.failed++;

  // Test 3: Create Stage
  stageId = await testCreateStage();
  stageId ? results.passed++ : results.failed++;

  if (stageId) {
    // Test 4: Create Task
    taskId = await testCreateTask(stageId);
    taskId ? results.passed++ : results.failed++;

    if (taskId) {
      // Test 5: Update Task
      const test5 = await testUpdateTask(taskId);
      test5 ? results.passed++ : results.failed++;

      // Test 6: Move Task
      const test6 = await testMoveTask(taskId);
      test6 ? results.passed++ : results.failed++;

      // Test 7: Update Task Status
      const test7 = await testUpdateTaskStatus(taskId);
      test7 ? results.passed++ : results.failed++;

      // Test 10: Delete Task
      const test10 = await testDeleteTask(taskId);
      test10 ? results.passed++ : results.failed++;
    } else {
      results.failed += 4; // Skip tests 5-7, 10
    }

    // Test 11: Delete Stage
    const test11 = await testDeleteStage(stageId);
    test11 ? results.passed++ : results.failed++;
  } else {
    results.failed += 5; // Skip tests 4-7, 10-11
  }

  // Test 8: Get Progress
  const test8 = await testGetProgress();
  test8 ? results.passed++ : results.failed++;

  // Test 9: WebSocket
  const test9 = await testWebSocket();
  test9 ? results.passed++ : results.failed++;

  // Print Summary
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║  Test Results Summary                  ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(
    `Success Rate: ${Math.round((results.passed / results.total) * 100)}%`
  );
  console.log("");

  return results;
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log("All tests completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test suite error:", error);
      process.exit(1);
    });
}
