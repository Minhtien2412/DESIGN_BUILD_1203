/**
 * Currency Service - Tích hợp ExchangeRate API
 * Chuyển đổi tiền tệ và hiển thị giá VND
 */

const EXCHANGERATE_API_KEY = process.env.EXPO_PUBLIC_EXCHANGERATE_API_KEY || '9990a4b1154e45dfa3a508a5';
const EXCHANGERATE_BASE_URL = 'https://v6.exchangerate-api.com/v6';

export interface ExchangeRates {
  [currency: string]: number;
}

export interface CurrencyConversionResult {
  success: boolean;
  amount?: number;
  from?: string;
  to?: string;
  rate?: number;
  error?: string;
}

// Cache tỷ giá để giảm API calls
let ratesCache: {
  rates: ExchangeRates;
  base: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 giờ

/**
 * Lấy tỷ giá từ API hoặc cache
 */
async function getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | null> {
  // Check cache
  if (
    ratesCache &&
    ratesCache.base === baseCurrency &&
    Date.now() - ratesCache.timestamp < CACHE_DURATION
  ) {
    return ratesCache.rates;
  }

  try {
    const response = await fetch(
      `${EXCHANGERATE_BASE_URL}/${EXCHANGERATE_API_KEY}/latest/${baseCurrency}`
    );
    const data = await response.json();

    if (data.result === 'success') {
      ratesCache = {
        rates: data.conversion_rates,
        base: baseCurrency,
        timestamp: Date.now(),
      };
      return data.conversion_rates;
    }
    return null;
  } catch (error) {
    console.error('ExchangeRate API error:', error);
    return null;
  }
}

/**
 * Chuyển đổi tiền tệ
 */
export async function convertCurrency(
  amount: number,
  from: string = 'USD',
  to: string = 'VND'
): Promise<CurrencyConversionResult> {
  try {
    const rates = await getRates(from);
    if (!rates || !rates[to]) {
      return { success: false, error: 'Không thể lấy tỷ giá' };
    }

    const rate = rates[to];
    const convertedAmount = amount * rate;

    return {
      success: true,
      amount: convertedAmount,
      from,
      to,
      rate,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Lấy tỷ giá USD/VND hiện tại
 */
export async function getUSDtoVNDRate(): Promise<number | null> {
  const rates = await getRates('USD');
  return rates?.VND || null;
}

/**
 * Format số tiền VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format số tiền USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Chuyển đổi USD sang VND và format
 */
export async function usdToVND(amountUSD: number): Promise<string> {
  const result = await convertCurrency(amountUSD, 'USD', 'VND');
  if (result.success && result.amount) {
    return formatVND(result.amount);
  }
  return formatUSD(amountUSD); // Fallback
}

/**
 * Chuyển đổi VND sang USD và format
 */
export async function vndToUSD(amountVND: number): Promise<string> {
  const result = await convertCurrency(amountVND, 'VND', 'USD');
  if (result.success && result.amount) {
    return formatUSD(result.amount);
  }
  return formatVND(amountVND); // Fallback
}

/**
 * Component helper - Hiển thị giá với cả VND và USD
 */
export async function formatDualCurrency(
  amountVND: number
): Promise<{ vnd: string; usd: string }> {
  const vnd = formatVND(amountVND);
  
  const rate = await getUSDtoVNDRate();
  const usd = rate ? formatUSD(amountVND / rate) : '';
  
  return { vnd, usd };
}

/**
 * Kiểm tra API status
 */
export async function checkCurrencyAPIStatus(): Promise<{
  available: boolean;
  rate?: number;
  error?: string;
}> {
  try {
    const rate = await getUSDtoVNDRate();
    if (rate) {
      return { available: true, rate };
    }
    return { available: false, error: 'Không thể lấy tỷ giá' };
  } catch (error) {
    return { available: false, error: (error as Error).message };
  }
}

/**
 * Lấy danh sách tỷ giá các đồng tiền phổ biến
 */
export async function getPopularRates(): Promise<{
  [key: string]: { rate: number; formatted: string };
} | null> {
  const rates = await getRates('USD');
  if (!rates) return null;

  const popular = ['VND', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'THB', 'SGD'];
  const result: { [key: string]: { rate: number; formatted: string } } = {};

  popular.forEach((currency) => {
    if (rates[currency]) {
      result[currency] = {
        rate: rates[currency],
        formatted: new Intl.NumberFormat('en-US').format(rates[currency]),
      };
    }
  });

  return result;
}

export const CurrencyService = {
  convertCurrency,
  getUSDtoVNDRate,
  formatVND,
  formatUSD,
  usdToVND,
  vndToUSD,
  formatDualCurrency,
  checkCurrencyAPIStatus,
  getPopularRates,
};

export default CurrencyService;
