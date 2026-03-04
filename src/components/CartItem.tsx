import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { CartItem as CartItemType } from '../types';
import { formatPrice } from '../utils/format';
import ImageWithFallback from './ImageWithFallback';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { t } = useLanguage();

  return (
    <div className="cart-item">
      <div className="d-flex gap-3">
        <ImageWithFallback
          src={item.product.image}
          alt={item.product.name}
          className="item-image"
          width={80}
          height={80}
          style={{ borderRadius: '0.375rem', flexShrink: 0 }}
        />
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold">{item.product.name}</h6>
          <p className="mb-2 text-brown fw-bold">
            {formatPrice(item.product.price)}/{item.product.unit}
          </p>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="qty-control">
              <button
                className="btn btn-outline-secondary"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              >
                <i className="bi bi-dash"></i>
              </button>
              <span className="qty-value">{item.quantity}</span>
              <button
                className="btn btn-outline-secondary"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
            
            <button
              className="btn btn-link text-danger p-0"
              onClick={() => removeItem(item.product.id)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-top d-flex justify-content-between">
        <span className="text-muted">{t('cart_item_subtotal')}</span>
        <span className="fw-bold text-brown">
          {formatPrice(item.product.price * item.quantity)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
