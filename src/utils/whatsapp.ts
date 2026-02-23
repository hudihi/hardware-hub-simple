import { CartItem, Order } from '../types';
import { formatPrice } from './format';
import { Language } from '../i18n/translations';

// WhatsApp number for the store (replace with actual number)
const WHATSAPP_NUMBER = '6281234567890';

// Generate WhatsApp link with message
export const generateWhatsAppLink = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

// Generate product share message
export const generateProductShareMessage = (
  productName: string,
  productPrice: number,
  productUrl: string,
  language: Language = 'en'
): string => {
  const labels = {
    en: { check: 'Check out this product from PAHALA.COM!', price: 'Price' },
    sw: { check: 'Angalia bidhaa hii kutoka PAHALA.COM!', price: 'Bei' },
  };
  const l = labels[language];
  return `${l.check}\n\n*${productName}*\n${l.price}: ${formatPrice(productPrice)}\n\n${productUrl}`;
};

// Generate order summary message for WhatsApp
export const generateOrderMessage = (order: Order, language: Language = 'en'): string => {
  const labels = {
    en: {
      header: '🛒 *ORDER SUMMARY - PAHALA.COM*',
      orderNum: 'Order Number',
      items: '📦 *Items:*',
      total: '💰 *Total',
      payment: '💳 Payment: Pay on Delivery',
      address: '📍 *Delivery Address:*',
      notes: '📝 *Notes:*',
    },
    sw: {
      header: '🛒 *MUHTASARI WA AGIZO - PAHALA.COM*',
      orderNum: 'Nambari ya Agizo',
      items: '📦 *Bidhaa:*',
      total: '💰 *Jumla',
      payment: '💳 Malipo: Lipa Unapopokea',
      address: '📍 *Anwani ya Uwasilishaji:*',
      notes: '📝 *Maelezo:*',
    },
  };
  const l = labels[language];

  let message = `${l.header}\n`;
  message += `${l.orderNum}: ${order.id}\n\n`;
  message += `${l.items}\n`;

  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   ${item.quantity} x ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}\n`;
  });

  message += `\n${l.total}: ${formatPrice(order.total)}*\n`;
  message += `${l.payment}\n\n`;
  message += `${l.address}\n`;
  message += `${order.customer.name}\n`;
  message += `${order.customer.address.street}\n`;
  message += `${order.customer.address.city}, ${order.customer.address.province} ${order.customer.address.postalCode}\n`;
  message += `📞 ${order.customer.phone}\n`;

  if (order.notes) {
    message += `\n${l.notes} ${order.notes}\n`;
  }

  return message;
};

// Generate cart share message
export const generateCartMessage = (items: CartItem[], total: number, language: Language = 'en'): string => {
  const labels = {
    en: {
      header: '🛒 *My Cart - PAHALA.COM*',
      items: '📦 *Items:*',
      total: '💰 *Total',
      cta: 'I would like to order these items.',
    },
    sw: {
      header: '🛒 *Kikapu Changu - PAHALA.COM*',
      items: '📦 *Bidhaa:*',
      total: '💰 *Jumla',
      cta: 'Ningependa kuagiza bidhaa hizi.',
    },
  };
  const l = labels[language];

  let message = `${l.header}\n\n`;
  message += `${l.items}\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name} (${item.quantity} ${item.product.unit})\n`;
    message += `   ${formatPrice(item.product.price * item.quantity)}\n`;
  });

  message += `\n${l.total}: ${formatPrice(total)}*\n`;
  message += `\n${l.cta}`;

  return message;
};

// Open WhatsApp with message
export const openWhatsApp = (message: string): void => {
  const link = generateWhatsAppLink(message);
  window.open(link, '_blank');
};

// Share product via WhatsApp
export const shareProduct = (
  productName: string,
  productPrice: number,
  productUrl: string,
  language: Language = 'en'
): void => {
  const message = generateProductShareMessage(productName, productPrice, productUrl, language);
  openWhatsApp(message);
};

// Share order via WhatsApp
export const shareOrder = (order: Order, language: Language = 'en'): void => {
  const message = generateOrderMessage(order, language);
  openWhatsApp(message);
};
