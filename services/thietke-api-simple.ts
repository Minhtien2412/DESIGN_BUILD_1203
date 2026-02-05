// ThietKe Resort API Integration Examples
// Matches the style from your specification

import ENV from "@/config/env";

// Use centralized ENV configuration
const BASE = ENV.API_BASE_URL;

// Health Check
export async function checkHealth() {
  const r = await fetch(`${BASE}/health`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Videos
export async function getVideos(limit = 20) {
  const r = await fetch(`${BASE}/videos?limit=${limit}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Payments
export async function createPayment(payload: any) {
  const r = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function getPaymentsByOrder(orderCode: string) {
  const r = await fetch(`${BASE}/payments?order_code=${orderCode}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function getPaymentDetails(id: string) {
  const r = await fetch(`${BASE}/payments/${id}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function confirmPayment(
  id: string,
  status = "paid",
  meta: any = {},
) {
  const r = await fetch(`${BASE}/payments/${id}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, meta }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Metrics
export async function logAppEvent(e: any) {
  const r = await fetch(`${BASE}/metrics/app-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e),
  });
  return r.ok;
}

export async function getAppEvents(limit = 100) {
  const r = await fetch(`${BASE}/metrics/app-events?limit=${limit}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Usage Examples:

// Create and confirm payment
async function examplePaymentFlow() {
  try {
    // 1. Create payment
    const payment = await createPayment({
      order_code: "DH1001",
      amount: 1000000,
      currency: "VND",
      provider: "momo",
      meta: {
        customer_name: "Nguyen Van A",
        description: "Thiết kế nhà 3 tầng",
      },
    });

    console.log("Payment created:", payment);

    // 2. Log the event
    await logAppEvent({
      event_type: "user_action",
      level: "info",
      message: "Payment created successfully",
      data: {
        payment_id: payment.payment.id,
        order_code: payment.payment.order_code,
        amount: payment.payment.amount,
      },
    });

    // 3. Confirm payment (manual)
    const confirmed = await confirmPayment(payment.payment.id, "paid", {
      confirmed_by: "admin_user",
      confirmation_method: "manual",
    });

    console.log("Payment confirmed:", confirmed);

    return confirmed;
  } catch (error) {
    console.error("Payment flow error:", error);

    // Log error
    await logAppEvent({
      event_type: "payment_error",
      level: "error",
      message: "Payment flow failed",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
        step: "payment_creation",
      },
    });

    throw error;
  }
}

// Check API health
async function exampleHealthCheck() {
  try {
    const health = await checkHealth();
    console.log("API Health:", health);
    return health;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
}

// Get videos
async function exampleVideosList() {
  try {
    const videos = await getVideos(10);
    console.log("Videos:", videos);

    await logAppEvent({
      event_type: "user_action",
      level: "info",
      message: "Videos fetched",
      data: {
        count: videos.videos?.length || 0,
      },
    });

    return videos;
  } catch (error) {
    console.error("Videos fetch failed:", error);
    await logAppEvent({
      event_type: "api_error",
      level: "error",
      message: "Failed to fetch videos",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    return null;
  }
}

// Export for use in React Native app
export const ThietKeAPI = {
  // Health
  checkHealth,

  // Videos
  getVideos,

  // Payments
  createPayment,
  getPaymentsByOrder,
  getPaymentDetails,
  confirmPayment,

  // Metrics
  logAppEvent,
  getAppEvents,

  // Examples
  examplePaymentFlow,
  exampleHealthCheck,
  exampleVideosList,
};
