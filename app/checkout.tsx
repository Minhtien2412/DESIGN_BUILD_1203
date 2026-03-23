/**
 * Checkout Screen - EU/VN Standards Multi-step Wizard
 * Redesigned: 06/06/2025
 *
 * EU/VN Payment Compliance:
 * - Clear price breakdown with VAT (10%) displayed per Vietnamese tax law
 * - PCI DSS security indicators (SSL 256-bit badge)
 * - Return & refund policy visible before order confirmation (EU Consumer Rights Directive)
 * - Explicit consent checkbox for Terms & Conditions (GDPR + VN Cybersecurity Law)
 * - Shipping cost shown before payment step (EU Price Transparency Directive)
 * - Order summary always visible in review (EU E-Commerce Directive 2011/83/EU)
 *
 * Steps: Address → Payment → Review & Confirm → Success
 * Uses reusable CheckoutStepTemplate component
 */

import CheckoutStepTemplate, {
    CheckoutDivider,
    CheckoutSection,
    RadioCard,
    SummaryRow,
} from "@/components/checkout/CheckoutStepTemplate";
import ModernButton from "@/components/ui/modern-button";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/cart-context";
import AddressService, {
    Address,
    MOCK_ADDRESSES as FALLBACK_ADDRESSES,
} from "@/services/addressService";
import {
    createOrder,
    type CreateOrderDto,
    type PaymentMethod as OrderPaymentMethod,
} from "@/services/api/orders.service";
import {
    estimateShipping,
    formatEstimatedDelivery,
    ShippingEstimate,
} from "@/services/api/shipping.service";
import { useI18n } from "@/services/i18nService";
import {
    createPayment,
    createPaymentViaAPI,
    PaymentOrder,
    PaymentProvider,
} from "@/services/paymentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Linking,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ── Types ─────────────────────────────────────────────────
type CheckoutStep = "address" | "payment" | "review" | "success";

interface PaymentMethodOption {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  badge?: string;
  promoBadge?: string;
  popular?: boolean;
  recommended?: boolean;
  brandColor: string;
  brandEmoji?: string;
  /** EU/VN: must show if payment has extra fees */
  extraFee?: number;
}

// ── Constants ─────────────────────────────────────────────
const STEP_LABEL_KEYS = [
  "checkout.stepAddress",
  "checkout.stepPayment",
  "checkout.stepConfirm",
];
const MOCK_ADDRESSES: Address[] = FALLBACK_ADDRESSES;
const VAT_RATE = 0.1; // 10% VAT per Vietnamese tax standard

// ── Shopee-style Payment Method Groups ────────────────
interface PaymentMethodDef {
  id: string;
  nameKey?: string;
  fallbackName?: string;
  icon: keyof typeof Ionicons.glyphMap;
  descKey: string;
  badgeKey?: string;
  promoBadge?: string; // e.g. "Giảm 50K"
  popular?: boolean;
  recommended?: boolean;
  brandColor: string;
  brandEmoji?: string;
  extraFee?: number;
}

interface PaymentGroup {
  titleKey: string;
  fallbackTitle: string;
  methods: PaymentMethodDef[];
}

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    titleKey: "checkout.groupRecommended",
    fallbackTitle: "Được đề xuất",
    methods: [
      {
        id: "cod",
        nameKey: "checkout.codName",
        icon: "cash-outline",
        descKey: "checkout.codDesc",
        popular: true,
        badgeKey: "checkout.codBadge",
        brandColor: "#0D9488",
        brandEmoji: "💵",
      },
      {
        id: "vnpay",
        fallbackName: "VNPay QR",
        icon: "qr-code-outline",
        descKey: "checkout.vnpayDesc",
        badgeKey: "checkout.vnpayBadge",
        recommended: true,
        brandColor: "#1A1F71",
        brandEmoji: "🔵",
      },
    ],
  },
  {
    titleKey: "checkout.groupEWallet",
    fallbackTitle: "Ví điện tử",
    methods: [
      {
        id: "momo",
        fallbackName: "MoMo",
        icon: "wallet-outline",
        descKey: "checkout.momoDesc",
        promoBadge: "Giảm 50K",
        brandColor: "#A50064",
        brandEmoji: "💜",
      },
      {
        id: "zalopay",
        fallbackName: "ZaloPay",
        icon: "wallet-outline",
        descKey: "checkout.zalopayDesc",
        promoBadge: "Hoàn 5%",
        brandColor: "#0068FF",
        brandEmoji: "💙",
      },
    ],
  },
  {
    titleKey: "checkout.groupCard",
    fallbackTitle: "Thẻ tín dụng / ghi nợ",
    methods: [
      {
        id: "card",
        nameKey: "checkout.cardName",
        icon: "card-outline",
        descKey: "checkout.cardDesc",
        brandColor: "#1A1F71",
        brandEmoji: "💳",
      },
    ],
  },
  {
    titleKey: "checkout.groupBanking",
    fallbackTitle: "Ngân hàng",
    methods: [
      {
        id: "banking",
        nameKey: "checkout.bankingName",
        icon: "business-outline",
        descKey: "checkout.bankingDesc",
        brandColor: "#00843D",
        brandEmoji: "🏦",
      },
      {
        id: "acb",
        fallbackName: "ACB ONE Connect",
        icon: "business-outline",
        descKey: "checkout.acbDesc",
        badgeKey: "checkout.acbBadge",
        brandColor: "#1A2980",
        brandEmoji: "🏦",
      },
    ],
  },
];

// Flat list for lookups
const ALL_PAYMENT_METHOD_DEFS = PAYMENT_GROUPS.flatMap((g) => g.methods);

// ── Payment & Provider Mappings ───────────────────────────
const PAYMENT_METHOD_MAP: Record<string, OrderPaymentMethod> = {
  cod: "COD",
  vnpay: "VNPAY",
  momo: "MOMO",
  zalopay: "ZALOPAY",
  card: "VNPAY",
  banking: "BANK_TRANSFER",
  acb: "ACB" as OrderPaymentMethod,
};

const PAYMENT_PROVIDER_MAP: Record<string, PaymentProvider> = {
  vnpay: "vnpay",
  momo: "momo",
  zalopay: "zalopay",
  card: "stripe",
  banking: "bank_transfer",
  acb: "acb",
};

// ── Component ─────────────────────────────────────────────
export default function CheckoutScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  // Translated payment methods (flat list for state management)
  const PAYMENT_METHODS: PaymentMethodOption[] = ALL_PAYMENT_METHOD_DEFS.map(
    (m) => ({
      id: m.id,
      name: m.nameKey ? t(m.nameKey) : m.fallbackName || m.id,
      icon: m.icon,
      description: t(m.descKey),
      badge: m.badgeKey ? t(m.badgeKey) : undefined,
      promoBadge: m.promoBadge,
      popular: m.popular,
      recommended: m.recommended,
      brandColor: m.brandColor,
      brandEmoji: m.brandEmoji,
      extraFee: m.extraFee,
    }),
  );

  // Translated groups for Shopee-style rendering
  const TRANSLATED_GROUPS = PAYMENT_GROUPS.map((g) => ({
    title: t(g.titleKey) !== g.titleKey ? t(g.titleKey) : g.fallbackTitle,
    methodIds: g.methods.map((m) => m.id),
  }));

  const STEP_LABELS = STEP_LABEL_KEYS.map((k) => t(k));

  // Steps
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");

  // Address
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<Address>(
    MOCK_ADDRESSES[0],
  );
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");

  // Payment
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodOption>(
    PAYMENT_METHODS[0],
  );

  // Review
  const [note, setNote] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Order
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Shipping
  const [shippingEstimate, setShippingEstimate] =
    useState<ShippingEstimate | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Success animation
  const [successAnim] = useState(new Animated.Value(0));

  // ── Derived Values ────────────────────────────────────
  const shippingFee = useMemo(
    () =>
      shippingEstimate && !shippingEstimate.freeShipping
        ? shippingEstimate.fee
        : 0,
    [shippingEstimate],
  );
  const vatAmount = useMemo(
    () => Math.round(totalPrice * VAT_RATE),
    [totalPrice],
  );
  const orderTotal = useMemo(
    () => totalPrice + shippingFee,
    [totalPrice, shippingFee],
  );

  const stepIndex = useMemo(() => {
    const map: Record<CheckoutStep, number> = {
      address: 1,
      payment: 2,
      review: 3,
      success: 4,
    };
    return map[currentStep];
  }, [currentStep]);

  // ── Data Fetching ─────────────────────────────────────
  const fetchAddresses = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await AddressService.getAddresses();
      if (result.ok && result.data?.addresses?.length) {
        setAddresses(result.data.addresses);
        const defaultAddr =
          result.data.addresses.find((a: Address) => a.isDefault) ||
          result.data.addresses[0];
        setSelectedAddress(defaultAddr);
        setDataSource("api");
      } else {
        setAddresses(MOCK_ADDRESSES);
        setSelectedAddress(MOCK_ADDRESSES[0]);
        setDataSource("mock");
      }
    } catch {
      setAddresses(MOCK_ADDRESSES);
      setSelectedAddress(MOCK_ADDRESSES[0]);
      setDataSource("mock");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Calculate shipping when address changes
  useEffect(() => {
    if (!selectedAddress) return;
    const calcShipping = async () => {
      setLoadingShipping(true);
      try {
        const totalWeight = items.reduce(
          (sum, item) =>
            sum + ((item.product as any).weight || 0.5) * item.quantity,
          0,
        );
        const result = await estimateShipping({
          city: selectedAddress.city || "",
          district: selectedAddress.district || "",
          totalWeight,
          itemCount: totalItems,
          subtotal: totalPrice,
        });
        if (result?.data) {
          setShippingEstimate(result.data);
        }
      } catch {
        setShippingEstimate(null);
      } finally {
        setLoadingShipping(false);
      }
    };
    calcShipping();
  }, [selectedAddress, totalPrice, totalItems, items]);

  // ── Helpers ───────────────────────────────────────────
  const fmt = (price: number) => price.toLocaleString("vi-VN");

  const goStep = (step: CheckoutStep) => setCurrentStep(step);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAddresses(false);
  }, [fetchAddresses]);

  const animateSuccess = () => {
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  // ── Place Order ───────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để đặt hàng và thanh toán.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => router.push("/(auth)/login") },
        ],
      );
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(t("checkout.termsRequired"), t("checkout.termsRequiredMsg"));
      return;
    }

    const apiPaymentMethod = PAYMENT_METHOD_MAP[selectedPayment.id] || "COD";
    const apiProvider = PAYMENT_PROVIDER_MAP[selectedPayment.id];

    try {
      setProcessing(true);

      // ===== Step 1: Create order in backend =====
      const orderDto: CreateOrderDto = {
        items: items.map((item) => ({
          productId: item.product.id?.toString() || item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city || "",
          ward: selectedAddress.ward,
          district: selectedAddress.district,
          note: note || undefined,
        },
        paymentMethod: apiPaymentMethod,
        note: note || undefined,
      };

      let orderId = `ORD-${Date.now()}`;
      try {
        const order = await createOrder(orderDto);
        orderId = order.orderNumber || order.id;
        setOrderNumber(orderId);
      } catch (orderError: any) {
        console.warn(
          "[Checkout] Order API failed, using local ID:",
          orderError.message,
        );
        setOrderNumber(orderId);
      }

      // ===== Step 2: Handle payment =====
      if (selectedPayment.id === "cod") {
        clearCart();
        goStep("success");
        animateSuccess();
        return;
      }

      if (apiProvider) {
        const paymentOrder: PaymentOrder = {
          id: orderId,
          amount: orderTotal,
          currency: "VND",
          description: t("checkout.orderPaymentDesc", { id: orderId }),
          customerName: selectedAddress.name,
          customerPhone: selectedAddress.phone,
          customerEmail: "customer@example.com",
        };

        // Use backend API for VNPay, ACB, Stripe, MoMo; client-side only for ZaloPay
        const useBackendAPI = ["vnpay", "acb", "stripe", "momo"].includes(
          apiProvider,
        );
        const result = useBackendAPI
          ? await createPaymentViaAPI(apiProvider, paymentOrder)
          : await createPayment(apiProvider, paymentOrder);

        if (result.success) {
          if (result.status === "processing") {
            clearCart();
            goStep("success");
            animateSuccess();
          } else if (
            result.status === "pending" &&
            apiProvider === "bank_transfer"
          ) {
            Alert.alert(
              t("checkout.bankTransferInfo"),
              `Ngân hàng: Vietcombank\nSố TK: 1234567890\nChủ TK: CONG TY BAO TIEN\nNội dung: ${orderId}\nSố tiền: ${fmt(orderTotal)}đ`,
              [
                {
                  text: t("checkout.bankTransferDone"),
                  onPress: () => {
                    clearCart();
                    goStep("success");
                    animateSuccess();
                  },
                },
              ],
            );
          }
        } else {
          Alert.alert(
            t("checkout.paymentError"),
            result.message || t("checkout.paymentErrorMsg"),
          );
        }
      } else {
        clearCart();
        goStep("success");
        animateSuccess();
      }
    } catch (error) {
      console.error("[Checkout] Payment error:", error);
      Alert.alert(t("common.error"), t("checkout.generalError"));
    } finally {
      setProcessing(false);
    }
  };

  // ════════════════════════════════════════════════════════
  // STEP 1: SHIPPING ADDRESS
  // ════════════════════════════════════════════════════════
  const renderAddressStep = () => (
    <CheckoutStepTemplate
      currentStep={1}
      totalSteps={3}
      stepLabels={STEP_LABELS}
      title={t("checkout.shippingAddress")}
      subtitle={t("checkout.selectAddress")}
      onBack={() => router.back()}
      refreshing={refreshing}
      onRefresh={onRefresh}
      infoBanner={
        dataSource === "mock" ? (
          <View style={s.infoBanner}>
            <Ionicons name="information-circle" size={16} color="#92400E" />
            <Text style={s.infoBannerText}>
              {t("checkout.mockAddressNote")}
            </Text>
          </View>
        ) : undefined
      }
      footer={
        <ModernButton
          variant="primary"
          size="large"
          onPress={() => goStep("payment")}
          icon="arrow-forward"
          iconPosition="right"
          fullWidth
        >
          {t("checkout.continuePayment")}
        </ModernButton>
      }
    >
      {addresses.map((address) => (
        <RadioCard
          key={address.id}
          selected={selectedAddress.id === address.id}
          onPress={() => setSelectedAddress(address)}
        >
          <View style={s.addressContent}>
            <View style={s.addressTopRow}>
              <Ionicons
                name="location"
                size={18}
                color={MODERN_COLORS.primary}
              />
              <Text style={s.addressName}>{address.name}</Text>
              {address.isDefault && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{t("checkout.defaultBadge")}</Text>
                </View>
              )}
            </View>
            <Text style={s.addressPhone}>{address.phone}</Text>
            <Text style={s.addressDetail}>
              {address.address}, {address.district}, {address.city}
            </Text>
          </View>
        </RadioCard>
      ))}

      {/* Add new address */}
      <TouchableOpacity
        style={s.addAddressBtn}
        onPress={() =>
          Alert.alert(t("checkout.addAddress"), t("checkout.addAddressAlert"))
        }
        activeOpacity={0.7}
      >
        <Ionicons
          name="add-circle-outline"
          size={22}
          color={MODERN_COLORS.primary}
        />
        <Text style={s.addAddressText}>{t("checkout.addAddress")}</Text>
      </TouchableOpacity>

      {/* EU: Show estimated shipping cost upfront (Price Transparency) */}
      <CheckoutSection title={t("checkout.estShipping")}>
        {loadingShipping ? (
          <View style={s.estimateRow}>
            <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
            <Text style={s.estimateText}>{t("checkout.calcShipping")}</Text>
          </View>
        ) : shippingEstimate?.freeShipping || !shippingEstimate ? (
          <View style={s.estimateRow}>
            <Ionicons
              name="gift-outline"
              size={18}
              color={MODERN_COLORS.success}
            />
            <Text style={[s.estimateText, { color: MODERN_COLORS.success }]}>
              {t("checkout.freeShipping")}
            </Text>
          </View>
        ) : (
          <>
            <SummaryRow
              label={t("checkout.deliveryFee")}
              value={`₫${fmt(shippingEstimate.fee)}`}
            />
            {shippingEstimate.freeShippingThreshold && (
              <Text style={s.shippingHint}>
                {t("checkout.freeShipThreshold", {
                  amount: fmt(shippingEstimate.freeShippingThreshold),
                })}
              </Text>
            )}
            <Text style={s.shippingHint}>
              {formatEstimatedDelivery(shippingEstimate.estimatedDays)}
            </Text>
          </>
        )}
      </CheckoutSection>
    </CheckoutStepTemplate>
  );

  // ════════════════════════════════════════════════════════
  // STEP 2: PAYMENT METHOD
  // ════════════════════════════════════════════════════════
  const renderPaymentStep = () => (
    <CheckoutStepTemplate
      currentStep={2}
      totalSteps={3}
      stepLabels={STEP_LABELS}
      title={t("checkout.paymentMethod")}
      subtitle={t("checkout.paymentSubtitle")}
      onBack={() => goStep("address")}
      footer={
        <ModernButton
          variant="primary"
          size="large"
          onPress={() => goStep("review")}
          icon="arrow-forward"
          iconPosition="right"
          fullWidth
        >
          {t("checkout.reviewOrder")}
        </ModernButton>
      }
    >
      {TRANSLATED_GROUPS.map((group, gi) => {
        const groupMethods = group.methodIds
          .map((id) => PAYMENT_METHODS.find((m) => m.id === id))
          .filter(Boolean) as PaymentMethodOption[];
        if (groupMethods.length === 0) return null;
        return (
          <View key={gi} style={s.paymentGroup}>
            <Text style={s.paymentGroupTitle}>{group.title}</Text>
            {groupMethods.map((method) => {
              const isSelected = selectedPayment.id === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    s.shopeePaymentCard,
                    isSelected && s.shopeePaymentCardSelected,
                  ]}
                  onPress={() => setSelectedPayment(method)}
                  activeOpacity={0.7}
                >
                  {/* Radio indicator */}
                  <View
                    style={[s.shopeeRadio, isSelected && s.shopeeRadioSelected]}
                  >
                    {isSelected && <View style={s.shopeeRadioDot} />}
                  </View>

                  {/* Brand icon with color */}
                  <View
                    style={[
                      s.shopeeBrandIcon,
                      { backgroundColor: `${method.brandColor}15` },
                    ]}
                  >
                    {method.brandEmoji ? (
                      <Text style={s.shopeeBrandEmoji}>
                        {method.brandEmoji}
                      </Text>
                    ) : (
                      <Ionicons
                        name={method.icon}
                        size={22}
                        color={method.brandColor}
                      />
                    )}
                  </View>

                  {/* Text content */}
                  <View style={s.shopeePaymentInfo}>
                    <View style={s.shopeeNameRow}>
                      <Text
                        style={[
                          s.shopeePaymentName,
                          isSelected && { color: MODERN_COLORS.primary },
                        ]}
                      >
                        {method.name}
                      </Text>
                      {method.recommended && (
                        <View style={s.shopeeRecommendedBadge}>
                          <Text style={s.shopeeRecommendedText}>
                            {method.badge || "★"}
                          </Text>
                        </View>
                      )}
                      {method.popular && !method.recommended && (
                        <View style={s.shopeePopularBadge}>
                          <Text style={s.shopeePopularText}>
                            {method.badge || "Hot"}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.shopeePaymentDesc}>
                      {method.description}
                    </Text>
                    {method.promoBadge && (
                      <View style={s.shopeePromoBadge}>
                        <Ionicons name="pricetag" size={10} color="#EE4D2D" />
                        <Text style={s.shopeePromoText}>
                          {method.promoBadge}
                        </Text>
                      </View>
                    )}
                    {method.extraFee ? (
                      <Text style={s.paymentFee}>
                        {t("checkout.processingFee", {
                          amount: fmt(method.extraFee),
                        })}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      {/* Security badges */}
      <View style={s.trustBadges}>
        <View style={s.trustItem}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={MODERN_COLORS.success}
          />
          <Text style={s.trustText}>PCI DSS</Text>
        </View>
        <View style={s.trustItem}>
          <Ionicons
            name="lock-closed"
            size={20}
            color={MODERN_COLORS.success}
          />
          <Text style={s.trustText}>SSL 256-bit</Text>
        </View>
        <View style={s.trustItem}>
          <Ionicons name="eye-off" size={20} color={MODERN_COLORS.success} />
          <Text style={s.trustText}>{t("checkout.securityText")}</Text>
        </View>
      </View>
    </CheckoutStepTemplate>
  );

  // ════════════════════════════════════════════════════════
  // STEP 3: REVIEW & CONFIRM (EU/VN Compliant)
  // ════════════════════════════════════════════════════════
  const renderReviewStep = () => (
    <CheckoutStepTemplate
      currentStep={3}
      totalSteps={3}
      stepLabels={STEP_LABELS}
      title={t("checkout.confirmOrder")}
      subtitle={t("checkout.reviewSubtitle")}
      onBack={() => goStep("payment")}
      footer={
        <View>
          {/* Sticky total bar */}
          <View style={s.footerTotal}>
            <View>
              <Text style={s.footerTotalLabel}>
                {t("checkout.totalPayment")}
              </Text>
              <Text style={s.footerVatNote}>{t("checkout.vatIncluded")}</Text>
            </View>
            <Text style={s.footerTotalValue}>₫{fmt(orderTotal)}</Text>
          </View>
          <ModernButton
            variant="primary"
            size="large"
            onPress={handlePlaceOrder}
            icon="checkmark-circle"
            iconPosition="right"
            fullWidth
            loading={processing}
            disabled={!agreedToTerms || processing}
          >
            {t("checkout.placeOrder")}
          </ModernButton>
        </View>
      }
    >
      {/* ── Shipping Address ── */}
      <CheckoutSection
        title={t("checkout.shippingAddress")}
        onEdit={() => goStep("address")}
      >
        <View style={s.reviewAddressRow}>
          <Ionicons name="location" size={18} color={MODERN_COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.reviewLabel}>{selectedAddress.name}</Text>
            <Text style={s.reviewDetail}>{selectedAddress.phone}</Text>
            <Text style={s.reviewDetail}>
              {selectedAddress.address}, {selectedAddress.district},{" "}
              {selectedAddress.city}
            </Text>
          </View>
        </View>
      </CheckoutSection>

      {/* ── Payment Method ── */}
      <CheckoutSection
        title={t("checkout.paymentMethod")}
        onEdit={() => goStep("payment")}
      >
        <View style={s.reviewPaymentRow}>
          <View style={s.paymentIconBoxSm}>
            <Ionicons
              name={selectedPayment.icon}
              size={20}
              color={MODERN_COLORS.primary}
            />
          </View>
          <Text style={s.reviewLabel}>{selectedPayment.name}</Text>
        </View>
      </CheckoutSection>

      {/* ── Order Items ── */}
      <CheckoutSection
        title={t("checkout.products", { count: String(totalItems) })}
      >
        {items.map((item, idx) => (
          <View key={item.id}>
            <View style={s.itemRow}>
              <Image
                source={
                  typeof item.product.image === "string"
                    ? { uri: item.product.image }
                    : item.product.image
                }
                style={s.itemImage}
              />
              <View style={s.itemInfo}>
                <Text style={s.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={s.itemQty}>
                  {t("checkout.quantity", { qty: String(item.quantity) })}
                </Text>
              </View>
              <Text style={s.itemPrice}>
                ₫{fmt(item.product.price * item.quantity)}
              </Text>
            </View>
            {idx < items.length - 1 && <CheckoutDivider />}
          </View>
        ))}
      </CheckoutSection>

      {/* ── Note ── */}
      <CheckoutSection title={t("checkout.noteForSeller")}>
        <TextInput
          style={s.noteInput}
          placeholder={t("checkout.notePlaceholder")}
          placeholderTextColor={MODERN_COLORS.textTertiary}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </CheckoutSection>

      {/* ── Order Summary (EU: Price Transparency) ── */}
      <CheckoutSection title={t("checkout.paymentDetails")}>
        <SummaryRow
          label={t("checkout.subtotal")}
          value={`₫${fmt(totalPrice)}`}
        />
        <SummaryRow
          label={t("cart.shipping")}
          value={shippingFee ? `₫${fmt(shippingFee)}` : t("cart.freeShipping")}
          accent={!shippingFee}
        />
        <SummaryRow
          label={t("checkout.vatLabel")}
          value={`₫${fmt(vatAmount)}`}
        />
        {shippingEstimate?.freeShippingThreshold && shippingFee > 0 && (
          <Text style={s.shippingHint}>
            {t("checkout.freeShipOrder", {
              amount: fmt(shippingEstimate.freeShippingThreshold),
            })}
          </Text>
        )}
        {shippingEstimate && (
          <Text style={s.deliveryEst}>
            {formatEstimatedDelivery(shippingEstimate.estimatedDays)}
          </Text>
        )}
        <CheckoutDivider />
        <SummaryRow
          label={t("checkout.totalPayment")}
          value={`₫${fmt(orderTotal)}`}
          bold
        />
      </CheckoutSection>

      {/* ── EU: Return Policy (Consumer Rights Directive) ── */}
      <View style={s.policyCard}>
        <View style={s.policyRow}>
          <Ionicons
            name="refresh-circle"
            size={20}
            color={MODERN_COLORS.primary}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.policyTitle}>{t("checkout.returnPolicy")}</Text>
            <Text style={s.policyText}>{t("checkout.returnPolicyDesc")}</Text>
          </View>
        </View>
        <View style={[s.policyRow, { marginTop: 8 }]}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={MODERN_COLORS.primary}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.policyTitle}>{t("checkout.warranty")}</Text>
            <Text style={s.policyText}>{t("checkout.warrantyDesc")}</Text>
          </View>
        </View>
      </View>

      {/* ── EU/VN: Terms & Conditions Consent ── */}
      <TouchableOpacity
        style={s.termsRow}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
        activeOpacity={0.7}
      >
        <View style={[s.checkbox, agreedToTerms && s.checkboxChecked]}>
          {agreedToTerms && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
        <Text style={s.termsText}>
          {t("checkout.agreeTerms")}{" "}
          <Text
            style={s.termsLink}
            onPress={() => router.push("/terms" as any)}
          >
            {t("checkout.termsOfService")}
          </Text>{" "}
          {t("checkout.and")}{" "}
          <Text
            style={s.termsLink}
            onPress={() => Linking.openURL("https://baotienweb.cloud/privacy")}
          >
            {t("checkout.privacyPolicy")}
          </Text>
        </Text>
      </TouchableOpacity>
    </CheckoutStepTemplate>
  );

  // ════════════════════════════════════════════════════════
  // STEP 4: ORDER SUCCESS
  // ════════════════════════════════════════════════════════
  const renderSuccessStep = () => {
    const scale = successAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });
    const opacity = successAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={s.successContainer}>
        <StatusBar barStyle="dark-content" />
        <Animated.View
          style={[s.successIconWrap, { transform: [{ scale }], opacity }]}
        >
          <LinearGradient
            colors={[MODERN_COLORS.success, MODERN_COLORS.primary]}
            style={s.successGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark" size={56} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={s.successTitle}>{t("checkout.orderSuccess")}</Text>
          <Text style={s.successSubtitle}>{t("checkout.orderSuccessMsg")}</Text>

          <View style={s.successCard}>
            <View style={s.successRow}>
              <Text style={s.successLabel}>{t("checkout.orderNumber")}</Text>
              <Text style={s.successValue}>
                #{orderNumber || `DH${Date.now().toString().slice(-6)}`}
              </Text>
            </View>
            <CheckoutDivider />
            <View style={s.successRow}>
              <Text style={s.successLabel}>{t("checkout.totalPayment")}</Text>
              <Text style={[s.successValue, { color: MODERN_COLORS.primary }]}>
                ₫{fmt(orderTotal)}
              </Text>
            </View>
            <CheckoutDivider />
            <View style={s.successRow}>
              <Text style={s.successLabel}>{t("checkout.payment")}</Text>
              <Text style={s.successValue}>{selectedPayment.name}</Text>
            </View>
            {shippingEstimate && (
              <>
                <CheckoutDivider />
                <View style={s.successRow}>
                  <Text style={s.successLabel}>
                    {t("checkout.estDelivery")}
                  </Text>
                  <Text style={s.successValue}>
                    {formatEstimatedDelivery(shippingEstimate.estimatedDays)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Action buttons */}
          <View style={s.successActions}>
            <ModernButton
              variant="primary"
              size="large"
              onPress={() => router.replace("/(tabs)")}
              icon="home"
              iconPosition="left"
              fullWidth
            >
              {t("checkout.goHome")}
            </ModernButton>
            <View style={{ height: MODERN_SPACING.sm }} />
            <ModernButton
              variant="outline"
              size="medium"
              onPress={() =>
                router.push(`/delivery-tracking?order=${orderNumber}` as any)
              }
              icon="locate"
              iconPosition="left"
              fullWidth
            >
              {t("checkout.trackOrder")}
            </ModernButton>
          </View>
        </Animated.View>
      </View>
    );
  };

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {currentStep === "address" && renderAddressStep()}
      {currentStep === "payment" && renderPaymentStep()}
      {currentStep === "review" && renderReviewStep()}
      {currentStep === "success" && renderSuccessStep()}
    </>
  );
}

// ════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  // ── Info Banner ──
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  infoBannerText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#92400E",
  },

  // ── Address Step ──
  addressContent: { flex: 1 },
  addressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
    marginBottom: 4,
  },
  addressName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  badge: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.xs,
  },
  badgeText: {
    fontSize: 10,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
  addressPhone: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 2,
  },
  addressDetail: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.md,
    borderWidth: 1.5,
    borderColor: MODERN_COLORS.primary,
    borderRadius: MODERN_RADIUS.lg,
    borderStyle: "dashed",
    marginBottom: MODERN_SPACING.lg,
    gap: MODERN_SPACING.xs,
  },
  addAddressText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },
  estimateText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
  },
  shippingHint: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: 4,
  },
  deliveryEst: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.primary,
    marginTop: 2,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },

  // ── Payment Step (Shopee-style) ──
  paymentGroup: {
    marginBottom: MODERN_SPACING.md,
  },
  paymentGroupTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: MODERN_SPACING.xs,
    paddingHorizontal: 4,
  },
  shopeePaymentCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: MODERN_COLORS.gray200 || "#E5E7EB",
    gap: MODERN_SPACING.sm,
  },
  shopeePaymentCardSelected: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: `${MODERN_COLORS.primary}05`,
    ...MODERN_SHADOWS.sm,
  },
  shopeeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: MODERN_COLORS.gray300 || "#D1D5DB",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  shopeeRadioSelected: {
    borderColor: MODERN_COLORS.primary,
  },
  shopeeRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: MODERN_COLORS.primary,
  },
  shopeeBrandIcon: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  shopeeBrandEmoji: {
    fontSize: 22,
  },
  shopeePaymentInfo: {
    flex: 1,
  },
  shopeeNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    flexWrap: "wrap" as const,
  },
  shopeePaymentName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  shopeeRecommendedBadge: {
    backgroundColor: "#EE4D2D",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  shopeeRecommendedText: {
    fontSize: 9,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: "#FFFFFF",
  },
  shopeePopularBadge: {
    backgroundColor: `${MODERN_COLORS.warning}20`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  shopeePopularText: {
    fontSize: 9,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#B45309",
  },
  shopeePaymentDesc: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  shopeePromoBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    marginTop: 4,
    backgroundColor: "#FFF0ED",
    alignSelf: "flex-start" as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  shopeePromoText: {
    fontSize: 10,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: "#EE4D2D",
  },
  paymentContent: { flex: 1 },
  paymentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: MODERN_SPACING.sm,
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: `${MODERN_COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIconBoxSm: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: `${MODERN_COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentTextCol: { flex: 1 },
  paymentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  paymentName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  paymentBadge: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  paymentBadgePopular: {
    backgroundColor: `${MODERN_COLORS.warning}20`,
  },
  paymentBadgeText: {
    fontSize: 9,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.primary,
  },
  paymentBadgeTextPopular: {
    color: "#B45309",
  },
  paymentDesc: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  paymentFee: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.warning,
    marginTop: 4,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
  },
  trustItem: {
    alignItems: "center",
    gap: 4,
  },
  trustText: {
    fontSize: 10,
    color: MODERN_COLORS.textTertiary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },

  // ── Review Step ──
  reviewAddressRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    alignItems: "flex-start",
  },
  reviewPaymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  reviewLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  reviewDetail: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 1,
  },

  // Items
  itemRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: MODERN_COLORS.gray100,
  },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  itemQty: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
    alignSelf: "center",
  },

  // Note
  noteInput: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    minHeight: 72,
    textAlignVertical: "top",
  },

  // Policy
  policyCard: {
    backgroundColor: `${MODERN_COLORS.primary}06`,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: `${MODERN_COLORS.primary}15`,
  },
  policyRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    alignItems: "flex-start",
  },
  policyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  policyText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },

  // Terms
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: MODERN_COLORS.gray300,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  termsLink: {
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    textDecorationLine: "underline",
  },

  // Footer total
  footerTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  footerTotalLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  footerVatNote: {
    fontSize: 10,
    color: MODERN_COLORS.textTertiary,
    marginTop: 1,
  },
  footerTotalValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },

  // ── Success Step ──
  successContainer: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xl,
  },
  successIconWrap: {
    marginBottom: MODERN_SPACING.xl,
  },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xxxl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    textAlign: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  successSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: MODERN_SPACING.xl,
  },
  successCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.lg,
    width: "100%",
    ...MODERN_SHADOWS.sm,
    marginBottom: MODERN_SPACING.xl,
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  successLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  successValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  successActions: {
    width: "100%",
  },
});
