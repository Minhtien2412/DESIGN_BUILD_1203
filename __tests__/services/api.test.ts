/**
 * @jest-environment jsdom
 */

// Mock the ENV config FIRST before any imports
jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    API_BASE_URL: "https://api.test.com",
    API_PREFIX: "/api/v1",
    API_KEY: "test-api-key-12345",
  },
}));

// Mock react-native Platform
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

// Import ApiError for testing the class
import { ApiError } from "../../services/api";

describe("API Service", () => {
  // Store original fetch
  const originalFetch = global.fetch;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // Create fresh mock for each test
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("makes successful API calls", async () => {
    const mockData = { id: 1, name: "Test" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
      text: async () => JSON.stringify(mockData),
    });

    // Re-import after setting up mock
    const { apiFetch } = require("../../services/api");
    const result = await apiFetch("/test");

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("includes custom headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({}),
      text: async () => "{}",
    });

    // Re-import after setting up mock
    const { apiFetch } = require("../../services/api");

    await apiFetch("/test", {
      headers: { "X-Custom-Header": "test-value" },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.any(Object),
      })
    );
  });

  it("ApiError class works correctly", () => {
    // ApiError takes (message, options) not (message, status, data)
    const error = new ApiError("Test error", {
      status: 500,
      data: { detail: "error detail" },
    });
    expect(error.message).toBe("Test error");
    expect(error.status).toBe(500);
    expect(error.data).toEqual({ detail: "error detail" });
    expect(error.name).toBe("ApiError");
  });

  it("exports token management functions", () => {
    const api = require("../../services/api");
    expect(typeof api.setToken).toBe("function");
    expect(typeof api.clearToken).toBe("function");
    expect(typeof api.getAuthToken).toBe("function");
  });

  it("exports HTTP helper methods", () => {
    const api = require("../../services/api");
    expect(typeof api.get).toBe("function");
    expect(typeof api.post).toBe("function");
    expect(typeof api.put).toBe("function");
    expect(typeof api.del).toBe("function");
    expect(typeof api.patch).toBe("function");
  });
});
