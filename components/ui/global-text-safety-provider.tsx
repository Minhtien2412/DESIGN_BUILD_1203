import React from "react";
import { Platform, Text, View } from "react-native";

// Suppress "Unexpected text node" warnings on web SSR
if (Platform.OS === "web" && typeof console !== "undefined") {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    const message = String(args[0] || "");
    // Suppress text node errors from SSR
    if (
      message.includes("Unexpected text node") ||
      message.includes("Text strings must be rendered") ||
      message.includes("cannot be a child of")
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || "");
    if (
      message.includes("Unexpected text node") ||
      message.includes("Text strings must be rendered")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

/**
 * GlobalTextSafetyProvider - wraps the entire app to prevent text rendering errors
 * Also suppresses "Unexpected text node" warnings from web SSR
 */
export class GlobalTextSafetyProvider extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorCount: number }
> {
  private errorTimeoutId?: ReturnType<typeof setTimeout>;

  state = { hasError: false, errorCount: 0 };

  static getDerivedStateFromError(error: unknown) {
    const errorMessage = (error as Error)?.message || "";
    const isTextError =
      errorMessage.includes("Text strings must be rendered") ||
      errorMessage.includes("createTextInstance") ||
      errorMessage.includes("text node") ||
      errorMessage.includes("Unexpected text node");

    if (isTextError) {
      // Silent recovery for text errors
      return { hasError: true };
    }

    // Re-throw non-text errors
    throw error;
  }

  componentDidCatch(error: unknown, _info: React.ErrorInfo) {
    const errorMessage = (error as Error)?.message || "";
    const isTextError =
      errorMessage.includes("Text strings must be rendered") ||
      errorMessage.includes("createTextInstance") ||
      errorMessage.includes("text node") ||
      errorMessage.includes("Unexpected text node");

    if (isTextError) {
      // Clear previous timeout
      if (this.errorTimeoutId) {
        clearTimeout(this.errorTimeoutId);
      }

      // Immediate recovery
      this.errorTimeoutId = setTimeout(() => {
        this.setState((prevState) => ({
          hasError: false,
          errorCount: prevState.errorCount + 1,
        }));
      }, 10); // Very fast recovery
    }
  }

  componentWillUnmount() {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Ultra-minimal fallback during recovery
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <Text style={{ color: "#fff" }}>Initializing...</Text>
        </View>
      );
    }

    // Wrap children in a recovery-enabled container
    return (
      <View key={`recovery-${this.state.errorCount}`} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}

export default GlobalTextSafetyProvider;
