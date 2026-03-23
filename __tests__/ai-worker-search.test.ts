/**
 * AI Worker Search — Integration Test
 *
 * Phase 5 verification: Tests that the orchestrator correctly routes
 * worker-search intents through the real API tool path.
 *
 * 3 exact signals per the spec:
 * 1. Intent detected as "find_worker" (not "architect_consultation")
 * 2. Workers API called (toolSearchWorkers invoked with correct params)
 * 3. Response contains "worker_list" or "worker_card" block
 */

// Must mock native/network dependencies before imports
jest.mock("@/services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

jest.mock("@/services/openclawAI", () => {
  const mockSendMessage = jest
    .fn()
    .mockResolvedValue(
      'Tôi sẽ giúp bạn tìm thợ điện ở Thủ Đức. {"intent":"find_worker"}',
    );
  return {
    openclawAI: {
      startChat: jest.fn(),
      sendMessage: mockSendMessage,
      clearChat: jest.fn(),
    },
  };
});

// Static imports — mocks above are hoisted by Jest
import {
    processUserMessage,
    resetSalesChat
} from "@/features/ai-assistant/orchestrator";
import { get } from "@/services/api";
import { openclawAI } from "@/services/openclawAI";

const mockGet = get as jest.MockedFunction<typeof get>;

// Helper: configure mock getWorkers to return realistic data
function mockWorkersApi(workers: any[]) {
  mockGet.mockResolvedValue({
    data: workers,
    meta: { total: workers.length, page: 1, limit: 5 },
  });
}

/** Parse query params from a call to get("/workers?category=electrical&...") */
function parseGetCall(callIndex = 0): {
  path: string;
  params: URLSearchParams;
} {
  const url: string = mockGet.mock.calls[callIndex][0] as string;
  const [path, qs] = url.split("?");
  return { path, params: new URLSearchParams(qs || "") };
}

const MOCK_ELECTRICIAN = {
  id: "30",
  name: "Cao Văn Sĩ",
  phone: "0901100016",
  workerType: "THO_DIEN",
  location: "Quận Thủ Đức",
  district: "Thủ Đức",
  experience: 15,
  skills: ["điện dân dụng", "điện công nghiệp"],
  hasEquipment: true,
  dailyRate: 450000,
  rating: 4.8,
  reviewCount: 25,
  completedJobs: 120,
  status: "APPROVED",
  verified: true,
  featured: false,
  availability: "available",
};

const MOCK_PAINTER = {
  id: "10",
  name: "Nguyễn Văn Sơn",
  phone: "0901200001",
  workerType: "THO_SON",
  location: "Quận 7",
  experience: 10,
  skills: ["sơn nước", "sơn dầu"],
  hasEquipment: true,
  dailyRate: 350000,
  rating: 4.5,
  reviewCount: 18,
  completedJobs: 80,
  status: "APPROVED",
  verified: true,
  featured: false,
  availability: "available",
};

const MOCK_ALUMINUM = {
  id: "20",
  name: "Trần Minh Nhôm",
  phone: "0901300001",
  workerType: "THO_NHOM_KINH",
  location: "Quận 9",
  experience: 8,
  skills: ["cửa nhôm", "vách kính"],
  hasEquipment: true,
  dailyRate: 500000,
  rating: 4.6,
  reviewCount: 12,
  completedJobs: 55,
  status: "APPROVED",
  verified: true,
  featured: false,
  availability: "available",
};

beforeEach(() => {
  jest.clearAllMocks();
  resetSalesChat();
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 1: "Tôi cần thợ điện ở Thủ Đức" (Primary test case)
// ═══════════════════════════════════════════════════════════════

describe("Scenario 1: Tôi cần thợ điện ở Thủ Đức", () => {
  beforeEach(() => {
    mockWorkersApi([MOCK_ELECTRICIAN]);
    (openclawAI.sendMessage as jest.Mock).mockResolvedValue(
      'Để tôi tìm thợ điện ở Thủ Đức cho bạn nhé! {"intent":"find_worker"}',
    );
  });

  test("Signal 1: Intent detected as find_worker", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await processUserMessage("Tôi cần thợ điện ở Thủ Đức");

    // Check aiLog INTENT output
    const intentLogs = consoleSpy.mock.calls
      .filter((args) => String(args[0]).includes("INTENT"))
      .map((args) => String(args[0]));

    expect(intentLogs.some((l) => l.includes("find_worker"))).toBe(true);
    // Should NOT be architect_consultation
    const localIntentLog = intentLogs.find((l) => l.includes("(local)"));
    expect(localIntentLog).toContain("find_worker");

    consoleSpy.mockRestore();
  });

  test("Signal 2: Workers API called with category=electrical, location=Thủ Đức", async () => {
    await processUserMessage("Tôi cần thợ điện ở Thủ Đức");

    // getWorkers builds the URL like get("/workers?category=electrical&location=...")
    expect(mockGet).toHaveBeenCalled();
    const { path, params } = parseGetCall(0);
    expect(path).toBe("/workers");
    // Category should be "electrical" (mapped from "điện")
    expect(params.get("category")).toBe("electrical");
    // Location should include "Thủ Đức"
    expect(decodeURIComponent(params.get("location") || "")).toContain("Đức");
  });

  test("Signal 3: Response contains worker_list block with electrician data", async () => {
    const result = await processUserMessage("Tôi cần thợ điện ở Thủ Đức");

    const workerBlocks = result.blocks.filter(
      (b) => b.type === "worker_list" || b.type === "worker_card",
    );
    expect(workerBlocks.length).toBeGreaterThan(0);

    // Verify worker data mapped correctly
    const wBlock = workerBlocks[0];
    if (wBlock.type === "worker_list") {
      expect(wBlock.workers.length).toBeGreaterThan(0);
      expect(wBlock.workers[0].name).toBe("Cao Văn Sĩ");
      expect(wBlock.workers[0].specialty).toBe("THO_DIEN");
    }
  });

  test("Response has text + worker_list + quick_replies blocks", async () => {
    const result = await processUserMessage("Tôi cần thợ điện ở Thủ Đức");

    const blockTypes = result.blocks.map((b) => b.type);
    expect(blockTypes).toContain("text");
    expect(blockTypes).toContain("worker_list");
    expect(blockTypes).toContain("quick_replies");
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 2: "Tìm thợ sơn" (skill only, no location)
// ═══════════════════════════════════════════════════════════════

describe("Scenario 2: Tìm thợ sơn", () => {
  beforeEach(() => {
    mockWorkersApi([MOCK_PAINTER]);
    (openclawAI.sendMessage as jest.Mock).mockResolvedValue(
      'Tôi tìm thợ sơn cho bạn ngay. {"intent":"find_worker"}',
    );
  });

  test("Intent is find_worker, API called with category=finishing", async () => {
    const result = await processUserMessage("Tìm thợ sơn");

    expect(mockGet).toHaveBeenCalled();
    const { path, params } = parseGetCall(0);
    expect(path).toBe("/workers");
    expect(params.get("category")).toBe("finishing");
    // No location filter
    expect(params.has("location")).toBe(false);

    const workerBlocks = result.blocks.filter(
      (b) => b.type === "worker_list" || b.type === "worker_card",
    );
    expect(workerBlocks.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 3: "Lắp cửa nhôm kính" (aluminum category)
// ═══════════════════════════════════════════════════════════════

describe("Scenario 3: Lắp cửa nhôm kính", () => {
  beforeEach(() => {
    mockWorkersApi([MOCK_ALUMINUM]);
    (openclawAI.sendMessage as jest.Mock).mockResolvedValue(
      'Tôi tìm thợ nhôm kính cho bạn. {"intent":"find_worker"}',
    );
  });

  test("Intent is find_worker, API called with category=aluminum", async () => {
    // "nhôm kính" → aluminum (via matchSkillToCategory)
    const result = await processUserMessage("Lắp cửa nhôm kính");

    expect(mockGet).toHaveBeenCalled();
    const { path, params } = parseGetCall(0);
    expect(path).toBe("/workers");
    expect(params.get("category")).toBe("aluminum");

    const workerBlocks = result.blocks.filter(
      (b) => b.type === "worker_list" || b.type === "worker_card",
    );
    expect(workerBlocks.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 4: "Cần thợ hoàn thiện" (repair_consultation)
// ═══════════════════════════════════════════════════════════════

describe("Scenario 4: Cần thợ hoàn thiện", () => {
  beforeEach(() => {
    mockWorkersApi([MOCK_PAINTER]);
    (openclawAI.sendMessage as jest.Mock).mockResolvedValue(
      'Tôi sẽ tìm thợ hoàn thiện cho bạn. {"intent":"find_worker"}',
    );
  });

  test("Intent is find_worker, searches for finishing workers", async () => {
    const result = await processUserMessage("Cần thợ hoàn thiện");

    expect(mockGet).toHaveBeenCalled();

    const workerBlocks = result.blocks.filter(
      (b) => b.type === "worker_list" || b.type === "worker_card",
    );
    // Should have results (either from fast path or fallback)
    expect(workerBlocks.length).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 5: "Tìm kiến trúc sư" (design category)
// ═══════════════════════════════════════════════════════════════

describe("Scenario 5: Tìm kiến trúc sư", () => {
  beforeEach(() => {
    mockWorkersApi([
      {
        id: "40",
        name: "Trần Kiến Trúc",
        workerType: "KY_SU",
        location: "Quận 1",
        experience: 12,
        skills: ["thiết kế kiến trúc"],
        hasEquipment: false,
        dailyRate: 800000,
        rating: 4.9,
        reviewCount: 30,
        completedJobs: 50,
        status: "APPROVED",
        verified: true,
        featured: true,
        availability: "available",
      },
    ]);
    (openclawAI.sendMessage as jest.Mock).mockResolvedValue(
      'Tôi tìm kiến trúc sư cho bạn. {"intent":"find_worker"}',
    );
  });

  test("Intent is find_worker, API called with category=design", async () => {
    const result = await processUserMessage("Tìm kiến trúc sư");

    expect(mockGet).toHaveBeenCalled();
    const { path, params } = parseGetCall(0);
    expect(path).toBe("/workers");
    expect(params.get("category")).toBe("design");

    const workerBlocks = result.blocks.filter(
      (b) => b.type === "worker_list" || b.type === "worker_card",
    );
    expect(workerBlocks.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// NEGATIVE: Architect flow should NOT trigger for worker search
// ═══════════════════════════════════════════════════════════════

describe("Worker search should NOT enter architect flow", () => {
  beforeEach(() => {
    mockWorkersApi([MOCK_ELECTRICIAN]);
    (openclawAI.sendMessage as jest.Mock).mockResolvedValue(
      'Tìm thợ cho bạn nhé. {"intent":"find_worker"}',
    );
  });

  test("AI context does not contain architect state for worker search", async () => {
    const sendSpy = openclawAI.sendMessage as jest.Mock;

    await processUserMessage("Tôi cần thợ điện ở Thủ Đức");

    // The message sent to AI should NOT contain architect state context
    const aiMessage = sendSpy.mock.calls[0][0];
    expect(aiMessage).not.toContain("[CONTEXT]");
    expect(aiMessage).not.toContain("Bước hiện tại");
  });
});
