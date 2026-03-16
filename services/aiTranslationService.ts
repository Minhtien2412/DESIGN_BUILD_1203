/**
 * AI Translation Service
 * Auto-translate app content using backend AI endpoint
 * with local caching for offline support
 *
 * @author ThietKeResort Team
 * @date 2026-01-24
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { post } from "./api";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  type Translations,
} from "./i18nService";

// ==================== TYPES ====================

interface TranslationRequest {
  texts: string[];
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
}

interface TranslationResponse {
  translations: string[];
  sourceLang: string;
  targetLang: string;
}

interface CachedTranslation {
  text: string;
  translatedAt: number;
}

type TranslationCache = Record<string, CachedTranslation>;

// ==================== CONSTANTS ====================

const CACHE_KEY_PREFIX = "@ai_translation_cache_";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_BATCH_SIZE = 50;
const API_ENDPOINT = "/ai/translate";

// ==================== CACHE MANAGEMENT ====================

function getCacheKey(targetLang: SupportedLanguage): string {
  return `${CACHE_KEY_PREFIX}${targetLang}`;
}

async function loadCache(
  targetLang: SupportedLanguage,
): Promise<TranslationCache> {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(targetLang));
    if (raw) {
      const cache: TranslationCache = JSON.parse(raw);
      // Clean expired entries
      const now = Date.now();
      const cleaned: TranslationCache = {};
      for (const [key, entry] of Object.entries(cache)) {
        if (now - entry.translatedAt < CACHE_EXPIRY_MS) {
          cleaned[key] = entry;
        }
      }
      return cleaned;
    }
  } catch {
    // Silent fail
  }
  return {};
}

async function saveCache(
  targetLang: SupportedLanguage,
  cache: TranslationCache,
): Promise<void> {
  try {
    await AsyncStorage.setItem(getCacheKey(targetLang), JSON.stringify(cache));
  } catch {
    // Silent fail
  }
}

// ==================== TRANSLATION ENGINE ====================

/**
 * Translate an array of texts using the backend AI service
 * Falls back to returning original texts on failure
 */
async function translateBatch(
  texts: string[],
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
): Promise<string[]> {
  if (texts.length === 0) return [];
  if (sourceLang === targetLang) return [...texts];

  try {
    const payload: TranslationRequest = {
      texts,
      sourceLang,
      targetLang,
    };

    const response = await post<TranslationResponse>(API_ENDPOINT, payload);

    if (
      response?.translations &&
      response.translations.length === texts.length
    ) {
      return response.translations;
    }
  } catch {
    // API failed — return originals as fallback
  }

  return [...texts];
}

/**
 * Translate texts with caching support
 * Checks cache first, only sends untranslated texts to API
 */
export async function translateTexts(
  texts: string[],
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
): Promise<string[]> {
  if (sourceLang === targetLang) return [...texts];

  const cache = await loadCache(targetLang);
  const results: string[] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check cache
  for (let i = 0; i < texts.length; i++) {
    const cacheKey = `${sourceLang}:${texts[i]}`;
    const cached = cache[cacheKey];
    if (cached) {
      results[i] = cached.text;
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(texts[i]);
    }
  }

  // Translate uncached texts in batches
  if (uncachedTexts.length > 0) {
    let allTranslated: string[] = [];

    for (let i = 0; i < uncachedTexts.length; i += MAX_BATCH_SIZE) {
      const batch = uncachedTexts.slice(i, i + MAX_BATCH_SIZE);
      const translated = await translateBatch(batch, sourceLang, targetLang);
      allTranslated = allTranslated.concat(translated);
    }

    // Fill results and update cache
    const now = Date.now();
    for (let i = 0; i < uncachedIndices.length; i++) {
      const originalIndex = uncachedIndices[i];
      const translated = allTranslated[i] ?? texts[originalIndex];
      results[originalIndex] = translated;

      // Cache the translation
      const cacheKey = `${sourceLang}:${texts[originalIndex]}`;
      cache[cacheKey] = { text: translated, translatedAt: now };
    }

    await saveCache(targetLang, cache);
  }

  return results;
}

/**
 * Translate a single text string
 */
export async function translateText(
  text: string,
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
): Promise<string> {
  const results = await translateTexts([text], sourceLang, targetLang);
  return results[0];
}

// ==================== NAMESPACE TRANSLATION ====================

/**
 * Flatten a translations object into key-value pairs
 */
function flattenTranslations(
  obj: Record<string, any>,
  prefix = "",
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      map.set(fullKey, value);
    } else if (typeof value === "object" && value !== null) {
      const nested = flattenTranslations(value, fullKey);
      nested.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
}

/**
 * Unflatten key-value pairs back into a nested object
 */
function unflattenTranslations(map: Map<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of map) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Auto-translate an entire translation namespace from source language
 * Returns a Translations object for the target language
 */
export async function autoTranslateNamespace(
  sourceTranslations: Translations,
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
  onProgress?: (completed: number, total: number) => void,
): Promise<Translations> {
  if (sourceLang === targetLang) return { ...sourceTranslations };

  const flat = flattenTranslations(sourceTranslations);
  const keys = Array.from(flat.keys());
  const values = Array.from(flat.values());

  // Filter out template markers like {count}, {version} etc.
  // We'll translate the text and preserve the markers
  const total = values.length;
  const translated: string[] = [];

  for (let i = 0; i < values.length; i += MAX_BATCH_SIZE) {
    const batch = values.slice(i, i + MAX_BATCH_SIZE);
    const result = await translateTexts(batch, sourceLang, targetLang);
    translated.push(...result);
    onProgress?.(Math.min(i + MAX_BATCH_SIZE, total), total);
  }

  // Rebuild map with translated values
  const translatedMap = new Map<string, string>();
  for (let i = 0; i < keys.length; i++) {
    translatedMap.set(keys[i], translated[i]);
  }

  return unflattenTranslations(translatedMap) as Translations;
}

// ==================== LANGUAGE COMPLETENESS ====================

/**
 * Get translation completeness percentage for a language
 * Compares against the default language (Vietnamese)
 */
export function getTranslationCompleteness(
  sourceTranslations: Translations,
  targetTranslations: Translations,
): number {
  const sourceFlat = flattenTranslations(sourceTranslations);
  const targetFlat = flattenTranslations(targetTranslations);

  if (sourceFlat.size === 0) return 100;

  let filled = 0;
  for (const key of sourceFlat.keys()) {
    const targetValue = targetFlat.get(key);
    if (targetValue && targetValue.trim().length > 0) {
      filled++;
    }
  }

  return Math.round((filled / sourceFlat.size) * 100);
}

// ==================== CLEAR CACHE ====================

/**
 * Clear translation cache for a specific language or all languages
 */
export async function clearTranslationCache(
  targetLang?: SupportedLanguage,
): Promise<void> {
  try {
    if (targetLang) {
      await AsyncStorage.removeItem(getCacheKey(targetLang));
    } else {
      const keys = SUPPORTED_LANGUAGES.map((l) => getCacheKey(l.code));
      await AsyncStorage.multiRemove(keys);
    }
  } catch {
    // Silent fail
  }
}

// ==================== AUTO-DETECT LANGUAGE ====================

/**
 * Simple language detection based on character ranges
 * Returns best guess of the text's language
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text || text.trim().length === 0) return DEFAULT_LANGUAGE;

  const sample = text.slice(0, 200);

  // Check for CJK characters
  if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
  if (/[\u3040-\u30ff]/.test(sample)) return "ja";
  if (/[\uac00-\ud7af]/.test(sample)) return "ko";
  // Thai
  if (/[\u0e00-\u0e7f]/.test(sample)) return "th";
  // Arabic
  if (/[\u0600-\u06ff]/.test(sample)) return "ar";
  // Devanagari (Hindi)
  if (/[\u0900-\u097f]/.test(sample)) return "hi";
  // Cyrillic (Russian)
  if (/[\u0400-\u04ff]/.test(sample)) return "ru";
  // Vietnamese diacritics
  if (
    /[àáạảãăắằẳẵặâấầẩẫậèéẹẻẽêếềểễệìíịỉĩòóọỏõôốồổỗộơớờởỡợùúụủũưứừửữựỳýỵỷỹđ]/i.test(
      sample,
    )
  )
    return "vi";

  // Latin-based detection: check for language-specific patterns
  if (/[àâçéèêëïîôùûüÿœæ]/i.test(sample)) return "fr";
  if (/[ñ¿¡áéíóú]/i.test(sample)) return "es";
  if (/[äöüß]/i.test(sample)) return "de";
  if (/[ãõçáàâéêíóôú]/i.test(sample)) return "pt";

  return "en";
}

// ==================== EXPORTS ====================

export default {
  translateText,
  translateTexts,
  autoTranslateNamespace,
  getTranslationCompleteness,
  clearTranslationCache,
  detectLanguage,
};
