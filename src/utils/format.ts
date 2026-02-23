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
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    processing: 'status-confirmed',
    ready: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'bg-danger text-white',
  };
  return classMap[status] || '';
};
