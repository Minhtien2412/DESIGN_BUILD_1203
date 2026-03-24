import { QueryClientProvider } from "@tanstack/react-query";
import { makeRedirectUri } from "expo-auth-session";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { queryClient } from "./services/queryClient";
import socketService from "./services/socket";
import { useAuthStore } from "./store/auth";

const App = () => {
  const { user, hydrate } = useAuthStore();

  const redirectUri = makeRedirectUri({
    scheme: "appdesignbuild",
  });

  useEffect(() => {
    console.log("REDIRECT_URI =", redirectUri);
  }, [redirectUri]);

  useEffect(() => {
    // Hydrate auth state on app start
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Connect to WebSocket when user is authenticated
    if (user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={{ padding: 16 }}>
          <Text selectable>{redirectUri}</Text>
        </View>
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;