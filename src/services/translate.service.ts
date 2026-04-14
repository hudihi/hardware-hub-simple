/**
 * Dynamic translation service using the MyMemory free API.
 * Results are cached in localStorage so the API is only called once per text.
 * In-flight requests are deduplicated so switching languages on a product grid
 * doesn't fire hundreds of identical API calls.
 */

const CACHE_KEY = 'pahala-trans-cache';
const CACHE_VERSION = 1;
const SOURCE_LANG = 'en'; // Admin posts content in English

interface TransCache {
  version: number;
  entries: Record<string, string>;
}

// HTML entities that MyMemory sometimes returns
const HTML_ENTITIES: [RegExp, string][] = [
  [/&amp;/g, '&'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
];

class TranslateService {
  private cache: Record<string, string> = {};
  private pending = new Map<string, Promise<string>>();

  constructor() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed: TransCache = JSON.parse(raw);
        if (parsed.version === CACHE_VERSION) {
          this.cache = parsed.entries;
        }
      }
    } catch {
      // Corrupt cache — start fresh
    }
  }

  private persist() {
    try {
      const data: TransCache = { version: CACHE_VERSION, entries: this.cache };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // localStorage full — skip persistence, in-memory cache still works
    }
  }

  /** Stable cache key that avoids storing long strings as keys */
  private cacheKey(text: string, targetLang: string): string {
    return `${targetLang}:${text.substring(0, 160)}:${text.length}`;
  }

  /**
   * Translate `text` from English to `targetLang`.
   * - Returns the original text immediately if targetLang === 'en'.
   * - Returns cached result instantly if available.
   * - Deduplicates in-flight requests for the same text.
   * - Falls back to original text on API error.
   */
  async translate(text: string, targetLang: string): Promise<string> {
    if (!text?.trim() || targetLang === SOURCE_LANG) return text;

    const key = this.cacheKey(text, targetLang);

    if (this.cache[key]) return this.cache[key];
    if (this.pending.has(key)) return this.pending.get(key)!;

    const promise = (async (): Promise<string> => {
      try {
        const url =
          `https://api.mymemory.translated.net/get` +
          `?q=${encodeURIComponent(text)}` +
          `&langpair=${SOURCE_LANG}|${targetLang}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          let translated: string = data.responseData.translatedText;
          HTML_ENTITIES.forEach(([re, ch]) => { translated = translated.replace(re, ch); });
          this.cache[key] = translated;
          this.persist();
          return translated;
        }
      } catch {
        // Network error — silent fallback
      }
      return text;
    })();

    this.pending.set(key, promise);
    promise.finally(() => this.pending.delete(key));
    return promise;
  }

  /** Clear the translation cache (useful for testing) */
  clearCache() {
    this.cache = {};
    localStorage.removeItem(CACHE_KEY);
  }
}

export const translateService = new TranslateService();
