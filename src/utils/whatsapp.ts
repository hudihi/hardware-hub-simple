import { CartItem, Order } from '../types';
import { formatPrice } from './format';

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
  productUrl: string
): string => {
  return `Check out this product from PAHALA.COM!\n\n*${productName}*\nPrice: ${formatPrice(productPrice)}\n\n${productUrl}`;
};

// Generate order summary message for WhatsApp
export const generateOrderMessage = (order: Order): string => {
  let message = `🛒 *Order Summary - PAHALA.COM*\n`;
  message += `Order ID: ${order.id}\n\n`;
  message += `📦 *Items:*\n`;

  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   ${item.quantity} x ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}\n`;
  });

  message += `\n💰 *Total: ${formatPrice(order.total)}*\n`;
  message += `💳 Payment: Pay on Delivery\n\n`;
  message += `📍 *Delivery Address:*\n`;
  message += `${order.customer.name}\n`;
  message += `${order.customer.address.street}\n`;
  message += `${order.customer.address.city}, ${order.customer.address.province} ${order.customer.address.postalCode}\n`;
  message += `📞 ${order.customer.phone}\n`;

  if (order.notes) {
    message += `\n📝 *Notes:* ${order.notes}\n`;
  }

  return message;
};

// Generate cart share message
export const generateCartMessage = (items: CartItem[], total: number): string => {
  let message = `🛒 *My Cart - PAHALA.COM*\n\n`;
  message += `📦 *Items:*\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name} (${item.quantity} ${item.product.unit})\n`;
    message += `   ${formatPrice(item.product.price * item.quantity)}\n`;
  });

  message += `\n💰 *Total: ${formatPrice(total)}*\n`;
  message += `\nI would like to place this order.`;

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
  productUrl: string
): void => {
  const message = generateProductShareMessage(productName, productPrice, productUrl);
  openWhatsApp(message);
};

// Share order via WhatsApp
export const shareOrder = (order: Order): void => {
  const message = generateOrderMessage(order);
  openWhatsApp(message);
};
