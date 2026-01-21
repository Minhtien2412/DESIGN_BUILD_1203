/**
 * External APIs Service
 * Tích hợp tất cả external APIs đã hoạt động
 * Last updated: 12/01/2026
 */

// API Keys từ .env
const API_KEYS = {
  gemini: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCBWfOBoxVeMFLM_-fNi1nN4W6cn-hC56U',
  openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  exchangeRate: process.env.EXPO_PUBLIC_EXCHANGERATE_API_KEY || '9990a4b1154e45dfa3a508a5',
  pinecone: process.env.EXPO_PUBLIC_PINECONE_API_KEY || '',
  pineconeHost: process.env.EXPO_PUBLIC_PINECONE_HOST || 'https://designbuild-eh2iv5m.svc.aped-4627-b74a.pinecone.io',
  getOtp: process.env.EXPO_PUBLIC_GETOTP_API_KEY || 'b2c885626ab1e17735372aa843edb431',
};

// =============================================
// 1. EXCHANGE RATE SERVICE (Tỷ giá)
// =============================================
export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

class ExchangeRateService {
  private baseUrl = 'https://v6.exchangerate-api.com/v6';
  private apiKey = API_KEYS.exchangeRate;
  private cache: { rates: Record<string, number>; timestamp: number } | null = null;
  private cacheExpiry = 30 * 60 * 1000; // 30 phút

  /**
   * Lấy tỷ giá mới nhất
   */
  async getLatestRates(baseCurrency = 'USD'): Promise<ExchangeRates> {
    try {
      // Check cache
      if (this.cache && Date.now() - this.cache.timestamp < this.cacheExpiry) {
        return {
          base: baseCurrency,
          date: new Date().toISOString().split('T')[0],
          rates: this.cache.rates,
        };
      }

      const response = await fetch(
        `${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`
      );
      const data = await response.json();

      if (data.result === 'success') {
        this.cache = {
          rates: data.conversion_rates,
          timestamp: Date.now(),
        };

        return {
          base: data.base_code,
          date: data.time_last_update_utc,
          rates: data.conversion_rates,
        };
      }

      throw new Error(data['error-type'] || 'Failed to fetch rates');
    } catch (error) {
      console.error('ExchangeRate error:', error);
      throw error;
    }
  }

  /**
   * Chuyển đổi tiền tệ
   */
  async convert(
    amount: number,
    from: string,
    to: string
  ): Promise<ConversionResult> {
    const rates = await this.getLatestRates(from);
    const rate = rates.rates[to];

    if (!rate) {
      throw new Error(`Rate not found for ${to}`);
    }

    return {
      from,
      to,
      amount,
      result: amount * rate,
      rate,
    };
  }

  /**
   * Lấy tỷ giá VND
   */
  async getVNDRate(): Promise<number> {
    const rates = await this.getLatestRates('USD');
    return rates.rates.VND || 0;
  }

  /**
   * Chuyển USD sang VND
   */
  async usdToVnd(amount: number): Promise<number> {
    const result = await this.convert(amount, 'USD', 'VND');
    return result.result;
  }

  /**
   * Chuyển VND sang USD
   */
  async vndToUsd(amount: number): Promise<number> {
    const result = await this.convert(amount, 'VND', 'USD');
    return result.result;
  }

  /**
   * Format tiền VND
   */
  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Format tiền USD
   */
  formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

export const exchangeRateService = new ExchangeRateService();

// =============================================
// 2. PINECONE VECTOR DB SERVICE
// =============================================
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

class PineconeService {
  private host = API_KEYS.pineconeHost;
  private apiKey = API_KEYS.pinecone;

  /**
   * Search vectors
   */
  async search(
    vector: number[],
    topK = 10,
    filter?: Record<string, unknown>
  ): Promise<VectorSearchResult[]> {
    try {
      const response = await fetch(`${this.host}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector,
          topK,
          includeMetadata: true,
          filter,
        }),
      });

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Pinecone search error:', error);
      return [];
    }
  }

  /**
   * Upsert vectors
   */
  async upsert(
    vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, unknown>;
    }>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.host}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vectors }),
      });

      return response.ok;
    } catch (error) {
      console.error('Pinecone upsert error:', error);
      return false;
    }
  }

  /**
   * Delete vectors
   */
  async delete(ids: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.host}/vectors/delete`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      return response.ok;
    } catch (error) {
      console.error('Pinecone delete error:', error);
      return false;
    }
  }

  /**
   * Get index stats
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
  } | null> {
    try {
      const response = await fetch(`${this.host}/describe_index_stats`, {
        headers: { 'Api-Key': this.apiKey },
      });

      const data = await response.json();
      return {
        totalVectors: data.totalVectorCount || 0,
        dimension: data.dimension || 0,
      };
    } catch (error) {
      console.error('Pinecone stats error:', error);
      return null;
    }
  }
}

export const pineconeService = new PineconeService();

// =============================================
// 3. GETOTP SMS SERVICE
// =============================================
export interface OTPRequest {
  phone: string;
  channel?: 'sms' | 'viber' | 'voice' | 'telegram';
}

export interface OTPVerifyRequest {
  phone: string;
  code: string;
  requestId?: string;
}

export interface OTPResponse {
  success: boolean;
  requestId?: string;
  message?: string;
  error?: string;
}

class GetOTPService {
  private baseUrl = 'https://otp.dev/api/verify';
  private apiKey = API_KEYS.getOtp;

  /**
   * Gửi OTP
   */
  async sendOTP(request: OTPRequest): Promise<OTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OTP-Key': this.apiKey,
        },
        body: JSON.stringify({
          phone: request.phone,
          channel: request.channel || 'sms',
          brand: 'ThietKe',
          code_length: 6,
        }),
      });

      const data = await response.json();
      
      return {
        success: data.success,
        requestId: data.request_id,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error('GetOTP send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Xác thực OTP
   */
  async verifyOTP(request: OTPVerifyRequest): Promise<OTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OTP-Key': this.apiKey,
        },
        body: JSON.stringify({
          phone: request.phone,
          code: request.code,
          request_id: request.requestId,
        }),
      });

      const data = await response.json();
      
      return {
        success: data.valid === true,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error('GetOTP verify error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const otpService = new GetOTPService();

// =============================================
// 4. UNIFIED API STATUS CHECK
// =============================================
export interface APIStatus {
  name: string;
  status: 'working' | 'error' | 'unconfigured';
  message?: string;
  latency?: number;
}

class APIStatusChecker {
  /**
   * Kiểm tra tất cả API
   */
  async checkAll(): Promise<APIStatus[]> {
    const results: APIStatus[] = [];

    // 1. Gemini AI
    results.push(await this.checkGemini());

    // 2. Backend API
    results.push(await this.checkBackend());

    // 3. ExchangeRate
    results.push(await this.checkExchangeRate());

    // 4. Pinecone
    results.push(await this.checkPinecone());

    // 5. GetOTP (chỉ check cấu hình)
    results.push({
      name: 'GetOTP SMS',
      status: API_KEYS.getOtp ? 'working' : 'unconfigured',
      message: API_KEYS.getOtp ? 'Configured' : 'Missing API key',
    });

    return results;
  }

  private async checkGemini(): Promise<APIStatus> {
    const start = Date.now();
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEYS.gemini}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }],
          }),
        }
      );

      const latency = Date.now() - start;

      if (response.ok) {
        return {
          name: 'Gemini AI',
          status: 'working',
          message: 'Connected',
          latency,
        };
      }

      const data = await response.json();
      return {
        name: 'Gemini AI',
        status: 'error',
        message: data.error?.message || 'Unknown error',
      };
    } catch (error) {
      return {
        name: 'Gemini AI',
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  private async checkBackend(): Promise<APIStatus> {
    const start = Date.now();
    try {
      const response = await fetch('https://baotienweb.cloud/api/v1/health');
      const latency = Date.now() - start;

      return {
        name: 'Backend API',
        status: response.ok ? 'working' : 'error',
        message: response.ok ? 'Connected' : `Status ${response.status}`,
        latency,
      };
    } catch (error) {
      return {
        name: 'Backend API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  private async checkExchangeRate(): Promise<APIStatus> {
    const start = Date.now();
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEYS.exchangeRate}/latest/USD`
      );
      const data = await response.json();
      const latency = Date.now() - start;

      return {
        name: 'ExchangeRate API',
        status: data.result === 'success' ? 'working' : 'error',
        message: data.result === 'success' ? `1 USD = ${data.conversion_rates.VND} VND` : data['error-type'],
        latency,
      };
    } catch (error) {
      return {
        name: 'ExchangeRate API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  private async checkPinecone(): Promise<APIStatus> {
    if (!API_KEYS.pinecone) {
      return {
        name: 'Pinecone Vector DB',
        status: 'unconfigured',
        message: 'Missing API key',
      };
    }

    const start = Date.now();
    try {
      const response = await fetch(
        `${API_KEYS.pineconeHost}/describe_index_stats`,
        { headers: { 'Api-Key': API_KEYS.pinecone } }
      );
      const latency = Date.now() - start;

      return {
        name: 'Pinecone Vector DB',
        status: response.ok ? 'working' : 'error',
        message: response.ok ? 'Connected' : `Status ${response.status}`,
        latency,
      };
    } catch (error) {
      return {
        name: 'Pinecone Vector DB',
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

export const apiStatusChecker = new APIStatusChecker();

// =============================================
// 5. EXPORT ALL
// =============================================
export const externalAPIs = {
  exchangeRate: exchangeRateService,
  pinecone: pineconeService,
  otp: otpService,
  status: apiStatusChecker,
};

export default externalAPIs;
