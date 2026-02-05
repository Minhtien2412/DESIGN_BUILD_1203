/**
 * File Manager Screen
 * Document management with storage integration
 */

import FileManager from "@/components/FileManager";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function FileManagerScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Quản lý tài liệu",
          headerShown: true,
        }}
      />
      <FileManager
        showUpload={true}
        showSearch={true}
        defaultViewMode="list"
        maxFileSize={100 * 1024 * 1024} // 100MB
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});
