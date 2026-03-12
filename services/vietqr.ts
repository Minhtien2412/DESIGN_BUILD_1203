/**
 * VietQR Service
 * ==============
 * Generate VietQR payment strings compatible with Napas 247.
 * Spec: https://www.vietqr.io/danh-sach-api/link-tao-ma-nhanh
 *
 * Supported banks: ACB, Vietcombank, BIDV, Techcombank, MB, VPBank, etc.
 * Uses VietQR Quick-Link API (no secret key needed — public).
 *
 * @author APP_DESIGN_BUILD
 */

// ============================================
// Types
// ============================================

export interface BankAccount {
  /** NAPAS BIN / Swift code, e.g. "970416" for ACB */
  bankBin: string;
  /** Human-readable bank name */
  bankName: string;
  /** Short bank code for VietQR quick-link (e.g. "ACB") */
  bankCode: string;
  /** Account number */
  accountNumber: string;
  /** Account holder name (UPPERCASE, no diacritics) */
  accountName: string;
}

export interface VietQRParams {
  bank: BankAccount;
  /** Amount in VND (integer) */
  amount: number;
  /** Transfer description / memo (max 25 chars, no special chars) */
  memo: string;
  /** Template: "compact" | "compact2" | "qr_only" | "print" */
  template?: "compact" | "compact2" | "qr_only" | "print";
}

export interface TopUpRequest {
  /** Amount user wants to top up */
  amount: number;
  /** Unique transaction code for tracking */
  transactionCode: string;
  /** User ID or order ID */
  referenceId?: string;
}

// ============================================
// Bank Registry (popular Vietnamese banks)
// ============================================

export const BANKS: Record<string, BankAccount> = {
  ACB: {
    bankBin: "970416",
    bankName: "Ngân hàng TMCP Á Châu",
    bankCode: "ACB",
    accountNumber: "956",
    accountName: "NGUYEN THANH TRI",
  },
  VCB: {
    bankBin: "970436",
    bankName: "Ngân hàng TMCP Ngoại thương Việt Nam",
    bankCode: "VCB",
    accountNumber: "",
    accountName: "",
  },
  BIDV: {
    bankBin: "970418",
    bankName: "Ngân hàng TMCP Đầu tư và Phát triển",
    bankCode: "BIDV",
    accountNumber: "",
    accountName: "",
  },
  TCB: {
    bankBin: "970407",
    bankName: "Ngân hàng TMCP Kỹ thương Việt Nam",
    bankCode: "TCB",
    accountNumber: "",
    accountName: "",
  },
  MB: {
    bankBin: "970422",
    bankName: "Ngân hàng TMCP Quân đội",
    bankCode: "MB",
    accountNumber: "",
    accountName: "",
  },
  VPB: {
    bankBin: "970432",
    bankName: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
    bankCode: "VPB",
    accountNumber: "",
    accountName: "",
  },
  TPB: {
    bankBin: "970423",
    bankName: "Ngân hàng TMCP Tiên Phong",
    bankCode: "TPB",
    accountNumber: "",
    accountName: "",
  },
};

/** Default receiving bank account */
export const DEFAULT_BANK = BANKS.ACB;

// ============================================
// VietQR Quick-Link URL Builder
// ============================================

/**
 * Build VietQR quick-link image URL.
 * This URL returns a PNG image of the QR code from VietQR's free API.
 *
 * Format: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NO>-<TEMPLATE>.png
 *         ?amount=<AMOUNT>&addInfo=<MEMO>&accountName=<NAME>
 */
export function buildVietQRImageUrl(params: VietQRParams): string {
  const { bank, amount, memo, template = "compact2" } = params;
  const base = `https://img.vietqr.io/image/${bank.bankBin}-${bank.accountNumber}-${template}.png`;
  const queryParams = new URLSearchParams({
    amount: String(amount),
    addInfo: sanitizeMemo(memo),
    accountName: bank.accountName,
  });
  return `${base}?${queryParams.toString()}`;
}

/**
 * Build the raw EMVCo QR payload string for local QR generation.
 * Follows VietQR / Napas 247 EMVCo standard.
 */
export function buildEMVCoPayload(params: VietQRParams): string {
  const { bank, amount, memo } = params;

  // EMVCo TLV structure for VietQR
  const merchantAccountInfo = [
    tlv("00", "A000000727"), // VietQR GUID
    tlv("01", bank.bankBin), // BIN
    tlv("02", bank.accountNumber), // Account number
  ].join("");

  const payload = [
    tlv("00", "01"), // Payload Format Indicator
    tlv("01", "12"), // Point of Initiation (dynamic QR)
    tlv("38", merchantAccountInfo), // Merchant Account Info (ID 38 = VietQR)
    tlv("52", "0000"), // Merchant Category Code
    tlv("53", "704"), // Transaction Currency (VND = 704)
    tlv("54", String(amount)), // Transaction Amount
    tlv("58", "VN"), // Country Code
    tlv("59", bank.accountName.substring(0, 25)), // Merchant Name
    tlv("60", "HANOI"), // Merchant City
    tlv("62", tlv("08", sanitizeMemo(memo))), // Additional Data (Purpose)
  ].join("");

  // CRC placeholder — calculate over payload + "6304"
  const crcInput = payload + "6304";
  const crc = crc16CCITT(crcInput);
  return crcInput.replace("6304", `6304${crc}`);
}

// ============================================
// Transaction Code Generator
// ============================================

/**
 * Generate a unique transaction code for bank transfer tracking.
 * Format: TTRXXXXX (7-char alphanumeric, same style as the screenshot)
 */
export function generateTransactionCode(prefix = "TTR"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = prefix;
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================
// Amount Formatting
// ============================================

/** Format number as VND currency string */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

/** Predefined top-up amounts */
export const TOP_UP_AMOUNTS = [
  50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000,
  10_000_000,
];

// ============================================
// Helpers
// ============================================

/** EMVCo TLV (Tag-Length-Value) encoding */
function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${tag}${len}${value}`;
}

/** Sanitize memo: no diacritics, uppercase, max 25 chars */
function sanitizeMemo(memo: string): string {
  return memo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .substring(0, 25);
}

/** CRC-16/CCITT-FALSE used by EMVCo QR */
function crc16CCITT(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export default {
  buildVietQRImageUrl,
  buildEMVCoPayload,
  generateTransactionCode,
  formatVND,
  BANKS,
  DEFAULT_BANK,
  TOP_UP_AMOUNTS,
};
