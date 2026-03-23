/**
 * AI Photo Analysis Screen
 * Upload construction photos and analyze with GPT-4 Vision
 */

import { PhotoAnalysisCard } from "@/components/ai/PhotoAnalysisCard";
import { ProgressEstimator } from "@/components/ai/ProgressEstimator";
import { useProgressAnalysis } from "@/hooks/useAI";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PhotoAnalysisScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const { colors, spacing, radius } = useDS();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [context, setContext] = useState("");

  const { result, loading, error, analyze, reset } = useProgressAnalysis();

  const handleImagePick = async () => {
    // TODO: Integrate with ImagePicker when file upload is implemented (Task #43-44)
    Alert.alert(
      "Upload ảnh",
      "Tính năng upload ảnh sẽ được tích hợp trong Task #43-45. Hiện tại đang dùng ảnh mẫu.",
      [
        {
          text: "OK",
          onPress: () => {
            // Mock image URLs for demo
            setSelectedImages([
              "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
              "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
            ]);
          },
        },
      ],
    );
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!params.projectId) {
      Alert.alert("Lỗi", "Vui lòng chọn dự án");
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 1 ảnh");
      return;
    }

    const success = await analyze(
      params.projectId,
      selectedImages,
      context || "Phân tích tiến độ thi công dự án",
    );

    if (!success && error) {
      Alert.alert("Lỗi phân tích", error);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedImages([]);
    setContext("");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Phân tích ảnh AI",
          headerRight: () =>
            result ? (
              <TouchableOpacity
                onPress={handleReset}
                style={{ marginRight: 16 }}
              >
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : null,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Result View */}
        {result ? (
          <View>
            {/* Progress Overview */}
            <View style={styles.section}>
              <ProgressEstimator
                percentage={
                  result.progressPercentage || result.completionPercentage
                }
                completedTasks={result.completedTasks || 0}
                totalTasks={result.totalTasks || result.tasks.length}
              />
            </View>

            {/* Detailed Analysis */}
            <PhotoAnalysisCard result={result} />
          </View>
        ) : (
          /* Upload & Analyze View */
          <View>
            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Ionicons
                name="information-circle"
                size={48}
                color={colors.primary}
              />
              <Text style={styles.instructionsTitle}>
                Phân tích tiến độ với AI
              </Text>
              <Text style={styles.instructionsText}>
                Upload ảnh công trình để GPT-4 Vision phân tích tiến độ, phát
                hiện vấn đề và đưa ra khuyến nghị
              </Text>
            </View>

            {/* Image Upload Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Ảnh công trình
              </Text>

              {selectedImages.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageScroll}
                >
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={28}
                          color={colors.textInverse}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={[styles.uploadButton, { borderColor: colors.primary }]}
                onPress={handleImagePick}
              >
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color={colors.primary}
                />
                <Text style={[styles.uploadText, { color: colors.primary }]}>
                  Chọn ảnh từ thư viện
                </Text>
              </TouchableOpacity>
            </View>

            {/* Analyze Button */}
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                {
                  backgroundColor:
                    selectedImages.length > 0 && !loading
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={handleAnalyze}
              disabled={selectedImages.length === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <>
                  <Ionicons
                    name="sparkles"
                    size={24}
                    color={colors.textInverse}
                  />
                  <Text style={styles.analyzeButtonText}>Phân tích với AI</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Error Message */}
            {error && !loading && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Features List */}
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>AI sẽ phân tích:</Text>
              <FeatureItem
                icon="checkmark-circle"
                text="Tỷ lệ % hoàn thành công trình"
              />
              <FeatureItem
                icon="alert-circle"
                text="Phát hiện các vấn đề thi công"
              />
              <FeatureItem icon="bulb" text="Khuyến nghị cải thiện" />
              <FeatureItem
                icon="bar-chart"
                text="Đánh giá chất lượng thi công"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  const { colors } = useDS();
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  instructionsCard: {
    alignItems: "center" as const,
    padding: 32,
    margin: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 8,
    color: "#374151",
  },
  instructionsText: {
    fontSize: 15,
    textAlign: "center" as const,
    color: "#6B7280",
    lineHeight: 22,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  imageScroll: {
    marginBottom: 16,
  },
  imageWrapper: {
    marginRight: 12,
    position: "relative" as const,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute" as const,
    top: -10,
    right: -10,
    backgroundColor: "#111827",
    borderRadius: 14,
  },
  uploadButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 12,
    padding: 20,
    borderWidth: 2,
    borderStyle: "dashed" as const,
    borderRadius: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  analyzeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 12,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  errorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: 12,
    margin: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  featuresList: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 16,
    color: "#374151",
  },
  featureItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#6B7280",
  },
};
