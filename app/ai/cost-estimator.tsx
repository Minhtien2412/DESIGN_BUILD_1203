/**
 * AI Cost Estimator Screen
 * Estimate construction costs using AI
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { aiService, CostEstimation } from '@/services/aiApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const projectTypes = [
  { value: 'residential', label: 'Residential', icon: 'home-outline' },
  { value: 'commercial', label: 'Commercial', icon: 'business-outline' },
  { value: 'industrial', label: 'Industrial', icon: 'construct-outline' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'git-network-outline' },
];

export default function CostEstimatorScreen() {
  const [loading, setLoading] = useState(false);
  const [projectType, setProjectType] = useState('residential');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [estimation, setEstimation] = useState<CostEstimation | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#0D9488';

  const handleEstimate = async () => {
    if (!area || !location) return;

    try {
      setLoading(true);
      const result = await aiService.estimateCost({
        projectType,
        area: parseFloat(area),
        location,
      });
      setEstimation(result);
    } catch (error: any) {
      console.error('Estimation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M VND`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Cost Estimator
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Project Type */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Project Type</Text>
          <View style={styles.typeGrid}>
            {projectTypes.map((type) => (
              <Pressable
                key={type.value}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor:
                      projectType === type.value ? `${primaryColor}20` : cardColor,
                    borderColor: projectType === type.value ? primaryColor : '#E5E5E5',
                  },
                ]}
                onPress={() => setProjectType(type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={28}
                  color={projectType === type.value ? primaryColor : textColor}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: projectType === type.value ? primaryColor : textColor,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Area */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Area (m²)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="Enter area in square meters"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={area}
            onChangeText={setArea}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Location</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="Enter city or province"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Estimate Button */}
        <Pressable
          style={[
            styles.estimateButton,
            {
              backgroundColor: area && location && !loading ? primaryColor : '#E5E5E5',
            },
          ]}
          onPress={handleEstimate}
          disabled={!area || !location || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="calculator-outline" size={20} color={area && location ? '#fff' : '#999'} />
              <Text style={[styles.estimateButtonText, { color: area && location ? '#fff' : '#999' }]}>
                Calculate Estimate
              </Text>
            </>
          )}
        </Pressable>

        {/* Results */}
        {estimation && (
          <Animated.View entering={FadeInUp.springify()} style={styles.resultsContainer}>
            <View style={[styles.resultCard, { backgroundColor: cardColor }]}>
              <View style={[styles.resultHeader, { backgroundColor: `${primaryColor}10` }]}>
                <Ionicons name="trending-up" size={32} color={primaryColor} />
                <View style={styles.resultHeaderText}>
                  <Text style={[styles.resultLabel, { color: '#999' }]}>
                    Estimated Cost
                  </Text>
                  <Text style={[styles.resultValue, { color: primaryColor }]}>
                    {formatCurrency(estimation.estimatedCost)}
                  </Text>
                  <Text style={[styles.resultConfidence, { color: '#999' }]}>
                    {Math.round(estimation.confidence * 100)}% confidence
                  </Text>
                </View>
              </View>

              <View style={styles.breakdownContainer}>
                <Text style={[styles.breakdownTitle, { color: textColor }]}>
                  Cost Breakdown
                </Text>
                {Object.entries(estimation.breakdown).map(([key, value]) => (
                  <View key={key} style={styles.breakdownItem}>
                    <Text style={[styles.breakdownLabel, { color: textColor }]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={[styles.breakdownValue, { color: primaryColor }]}>
                      {formatCurrency(value)}
                    </Text>
                  </View>
                ))}
              </View>

              {estimation.alternatives && estimation.alternatives.length > 0 && (
                <View style={styles.alternativesContainer}>
                  <Text style={[styles.alternativesTitle, { color: textColor }]}>
                    Cost-Saving Alternatives
                  </Text>
                  {estimation.alternatives.map((alt, index) => (
                    <View
                      key={index}
                      style={[
                        styles.alternativeCard,
                        { backgroundColor: '#34C75910', borderColor: '#34C759' },
                      ]}
                    >
                      <Text style={[styles.alternativeDesc, { color: textColor }]}>
                        {alt.description}
                      </Text>
                      <View style={styles.alternativeFooter}>
                        <Text style={[styles.alternativeCost, { color: '#34C759' }]}>
                          {formatCurrency(alt.cost)}
                        </Text>
                        <Text style={[styles.alternativeSavings, { color: '#34C759' }]}>
                          Save {formatCurrency(alt.savings)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  estimateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  estimateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 4,
  },
  resultConfidence: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownContainer: {
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  alternativesContainer: {
    marginTop: 20,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  alternativeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  alternativeDesc: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  alternativeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alternativeCost: {
    fontSize: 16,
    fontWeight: '700',
  },
  alternativeSavings: {
    fontSize: 13,
    fontWeight: '600',
  },
});
