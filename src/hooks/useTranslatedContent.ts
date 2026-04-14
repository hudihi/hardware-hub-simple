import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateService } from '../services/translate.service';

/**
 * Translates admin-posted dynamic content (product names, descriptions, category
 * names) to the active language.
 *
 * - When language is 'en': returns the original text immediately (no API call).
 * - When language is 'sw' and the translation is cached: returns it instantly.
 * - When language is 'sw' and not yet cached: shows original text first, then
 *   swaps to the translation once the API responds (~200-400 ms).
 *
 * Usage:
 *   const name = useTranslatedContent(product.name);
 *   const desc = useTranslatedContent(product.description);
 */
export function useTranslatedContent(originalText: string): string {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(originalText);

  useEffect(() => {
    if (!originalText) return;

    // English: always show original
    if (language === 'en') {
      setTranslated(originalText);
      return;
    }

    // Reset to original immediately so there's no stale text from a previous product
    setTranslated(originalText);

    let cancelled = false;
    translateService.translate(originalText, language).then(result => {
      if (!cancelled) setTranslated(result);
    });

    return () => { cancelled = true; };
  }, [originalText, language]);

  return translated;
}
