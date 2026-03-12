/**
 * NetworkStatusBar Component Tests
 */

// Mock vector icons
import {
    NetworkStatusBar,
    OfflineIndicator,
} from "@/components/NetworkStatusBar";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

// Mock the hook
jest.mock("@/hooks/useOfflineSync", () => ({
  useOfflineSync: jest.fn(() => ({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
  })),
}));

describe("NetworkStatusBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when online with no pending items", () => {
    const { toJSON } = render(<NetworkStatusBar />);

    // Component should render nothing or empty when online and no pending
    // toJSON() returns null when nothing is rendered
    expect(toJSON()).toBeNull();
  });

  it("should render when offline", () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      isOnline: false,
      isSyncing: false,
      pendingCount: 0,
      failedCount: 0,
    });

    render(<NetworkStatusBar />);

    expect(screen.getByText("Không có kết nối mạng")).toBeTruthy();
  });

  it("should render when syncing", () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: true,
      pendingCount: 3,
      failedCount: 0,
    });

    render(<NetworkStatusBar />);

    expect(screen.getByText(/Đang đồng bộ/)).toBeTruthy();
  });

  it("should show pending count when showWhenOnline is true", () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingCount: 5,
      failedCount: 0,
    });

    render(<NetworkStatusBar showWhenOnline />);

    expect(screen.getByText(/5 mục đang chờ đồng bộ/)).toBeTruthy();
  });
});

describe("OfflineIndicator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when online with no pending items", () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingCount: 0,
      failedCount: 0,
    });

    const { toJSON } = render(<OfflineIndicator />);

    expect(toJSON()).toBeNull();
  });

  it("should render when offline", () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      isOnline: false,
      isSyncing: false,
      pendingCount: 0,
      failedCount: 0,
    });

    const { root } = render(<OfflineIndicator />);

    expect(root.children.length).toBeGreaterThan(0);
  });

  it("should show pending count badge", () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingCount: 3,
      failedCount: 0,
    });

    render(<OfflineIndicator />);

    expect(screen.getByText("3")).toBeTruthy();
  });
});
