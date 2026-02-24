/**
 * News Screen
 * Màn hình tin tức xây dựng và bất động sản
 */

import { NewsFeed } from "@/components/news";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack } from "expo-router";
import { Platform, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewsScreen() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: "Tin tức",
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <NewsFeed />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
