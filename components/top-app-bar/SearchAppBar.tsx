import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { TopAppBar } from "./TopAppBar";

interface SearchAppBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export function SearchAppBar({
  searchQuery,
  onSearchChange,
  placeholder = "Tìm kiếm...",
  onBack,
  rightComponent,
}: SearchAppBarProps) {
  
  const renderSearchBar = (): React.ReactNode => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color="#94A3B8" />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={onSearchChange}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#94A3B8" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <TopAppBar
      showBack={true}
      onBack={onBack}
      centerComponent={renderSearchBar()}
      rightComponent={rightComponent}
    />
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    width: "100%", 
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },
});