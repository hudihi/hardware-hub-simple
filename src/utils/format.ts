import { Language } from '../i18n/translations';

// Format price in Tanzanian Shillings
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date based on language
export const formatDate = (dateString: string, language: Language = 'en'): string => {
  const locale = language === 'sw' ? 'sw-TZ' : 'en-TZ';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

// Get status display text based on language
const statusMap: Record<string, { en: string; sw: string }> = {
  pending: { en: 'Pending', sw: 'Inasubiri' },
  confirmed: { en: 'Confirmed', sw: 'Imethibitishwa' },
  processing: { en: 'Processing', sw: 'Inashughulikiwa' },
  ready: { en: 'Ready for Pickup', sw: 'Tayari Kuchukuliwa' },
  completed: { en: 'Completed', sw: 'Imekamilika' },
  cancelled: { en: 'Cancelled', sw: 'Imeghairiwa' },
};

export const getStatusText = (status: string, language: Language = 'en'): string => {
  return statusMap[status]?.[language] || status;
};

// Get status badge class
export const getStatusClass = (status: string): string => {
  const classMap: Record<string, string> = {
    pending: 'bg-warning text-dark',           // Yellow bg, dark text
    confirmed: 'bg-info text-white',            // Blue bg, white text
    processing: 'bg-primary text-white',          // Primary bg, white text
    ready: 'bg-success text-white',             // Green bg, white text
    completed: 'bg-success text-white',           // Green bg, white text
    cancelled: 'bg-danger text-white',            // Red bg, white text
  };
  return classMap[status] || 'bg-secondary text-white'; // Default: gray bg, white text
};
