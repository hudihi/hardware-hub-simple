import { Language } from '../i18n/translations';
import communicationService from '../services/communication.service';
import { CartItem, Order } from '../types';
import { formatPrice } from './format';

// WhatsApp number for the store (replace with actual number)
const WHATSAPP_NUMBER = '+255694352388';

// Generate WhatsApp link with message (for customer service)
export const generateWhatsAppLink = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

// Generate native WhatsApp share link (for sharing content with contacts)
export const generateWhatsAppShareLink = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
};

// Generate enhanced product share message with image
export const generateProductShareMessage = (
  productName: string,
  productPrice: number,
  productUrl: string,
  productImage?: string,
  productDescription?: string,
  language: Language = 'en'
): string => {
  const labels = {
    en: { 
      check: '🛍️ Check out this product from Pahala Store!',
      price: '💰 Price',
      link: '🔗 View Product',
      description: '📝 Description'
    },
    sw: { 
      check: '🛍️ Angalia bidhaa hii kutoka Pahala Store!',
      price: '💰 Bei',
      link: '🔗 Ona Bidhaa',
      description: '📝 Maelezo'
    },
  };
  const l = labels[language];
  
  let message = `${l.check}\n\n`;
  message += `*${productName}*\n\n`;
  
  if (productDescription && productDescription.trim()) {
    message += `${l.description}: ${productDescription}\n\n`;
  }
  
  message += `${l.price}: ${formatPrice(productPrice)}\n\n`;
  message += `${l.link}: ${productUrl}`;
  
  return message;
};

// Generate order summary message for WhatsApp
export const generateOrderMessage = (order: Order, language: Language = 'en'): string => {
  const labels = {
    en: {
      header: '🛒 *ORDER SUMMARY - Pahala Store*',
      orderNum: 'Order Number',
      items: '📦 *Items:*',
      total: '💰 *Total',
      payment: '💳 Payment: Pay on Delivery',
      address: '📍 *Delivery Address:*',
      notes: '📝 *Notes:*',
    },
    sw: {
      header: '🛒 *MUHTASARI WA AGIZO - Pahala Store*',
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
  message += `${order.customer.location}\n`;
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
      header: '🛒 *My Cart - Pahala Store*',
      items: '📦 *Items:*',
      total: '💰 *Total',
      cta: 'I would like to order these items.',
    },
    sw: {
      header: '🛒 *Kikapu Changu - Pahala Store*',
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

// Open WhatsApp with message (for customer service)
export const openWhatsApp = (message: string): void => {
  const link = generateWhatsAppLink(message);
  window.open(link, '_blank');
};

// Open WhatsApp native share interface (for sharing content)
export const openWhatsAppShare = (message: string): void => {
  const link = generateWhatsAppShareLink(message);
  window.open(link, '_blank');
};

// Share product via WhatsApp using native share interface
export const shareProduct = async (
  productId: string,
  productName?: string,
  productPrice?: number,
  productUrl?: string,
  productImage?: string,
  productDescription?: string,
  language: Language = 'en'
): Promise<void> => {
  try {
    // Use API to get share data
    const shareData = await communicationService.shareProduct(productId);
    
    // Open WhatsApp with the API-provided URL and message
    window.open(shareData.whatsapp_url, '_blank');
  } catch (error) {
    console.error('Failed to share product via API, falling back to local generation:', error);
    
    // Fallback to local generation if API fails
    if (productName && productPrice && productUrl) {
      const message = generateProductShareMessage(
        productName, 
        productPrice, 
        productUrl, 
        productImage, 
        productDescription, 
        language
      );
      openWhatsAppShare(message);
    } else {
      throw error;
    }
  }
};

// Share order via WhatsApp using API
export const shareOrder = async (
  orderId: string,
  order?: Order,
  language: Language = 'en'
): Promise<void> => {
  try {
    // Use API to get share data
    const shareData = await communicationService.shareOrder(orderId);
    
    // Open WhatsApp with the API-provided URL and message
    window.open(shareData.whatsapp_url, '_blank');
  } catch (error) {
    console.error('Failed to share order via API, falling back to local generation:', error);
    
    // Fallback to local generation if API fails
    if (order) {
      const message = generateOrderMessage(order, language);
      openWhatsApp(message);
    } else {
      throw error;
    }
  }
};
