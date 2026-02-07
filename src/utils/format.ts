// Format price in Tanzanian Shillings
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('sw-TZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

// Get status display text (Swahili)
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Inasubiri',
    confirmed: 'Imethibitishwa',
    processing: 'Inashughulikiwa',
    ready: 'Tayari Kuchukuliwa',
    completed: 'Imekamilika',
    cancelled: 'Imeghairiwa',
  };
  return statusMap[status] || status;
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
