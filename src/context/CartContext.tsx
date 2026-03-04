import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CartItemResponse, cartService } from '../services/cart.service';
import { productService } from '../services/product.service';
import { CartItem, Product } from '../types';
import { getProductImageUrl } from '../utils/imageUrlUtils';
import imageOptimizer from '../utils/imageUtils';

interface CartContextType {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: (createNewCart?: boolean) => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  cartId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = 'pahala_cart_id';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);

  // Fetch product details for cart items
  const fetchProductDetails = async (cartItems: CartItemResponse[]): Promise<Product[]> => {
    const productIds = [...new Set(cartItems.map(item => item.product_id))];
    const productPromises = productIds.map(id => productService.getProductById(id));
    
    try {
      const products = await Promise.all(productPromises);
      
      const mappedProducts = products.filter(Boolean).map(product => {
        // Use centralized utility to get the best image URL
        const imageUrl = getProductImageUrl(product);
        
        // Preload the image for faster display
        if (imageUrl && imageUrl !== '/placeholder.svg') {
          imageOptimizer.preloadImage(imageUrl).catch(() => {
            // Silently fail - the image will show placeholder on error
          });
        }
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          unit: (product as any).unit_of_measure || 'pcs',
          image: imageUrl,
          category: (product as any).category_id || '',
          stock: (product as any).stock_quantity || 0
        };
      });
      
      return mappedProducts;
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      return [];
    }
  };

  // Convert API cart items to frontend CartItem format
  const convertToCartItems = async (cartItems: CartItemResponse[]): Promise<CartItem[]> => {
    if (cartItems.length === 0) return [];
    
    const products = await fetchProductDetails(cartItems);
    
    return cartItems.map(item => {
      const product = products.find(p => p.id === item.product_id) || {
        id: item.product_id,
        name: 'Product',
        description: '',
        price: item.unit_price,
        unit: 'pcs',
        image: '/placeholder.svg',
        category: '',
        stock: 0
      };
      
      return {
        product,
        quantity: item.quantity
      };
    });
  };

  // Get or create cart
  const getOrCreateCart = async (): Promise<string> => {
    let currentCartId = localStorage.getItem(CART_ID_KEY);
    
    if (!currentCartId) {
      try {
        console.log('No cart ID found, creating new cart...');
        const newCart = await cartService.createCart();
        currentCartId = newCart.id;
        localStorage.setItem(CART_ID_KEY, currentCartId);
        console.log('New cart created:', currentCartId);
      } catch (error) {
        console.error('Failed to create cart:', error);
        throw new Error('Failed to create cart');
      }
    } else {
      // Validate existing cart by trying to get it
      try {
        console.log('Validating existing cart:', currentCartId);
        await cartService.getCart(currentCartId);
        console.log('Existing cart is valid');
      } catch (error: any) {
        console.log('Existing cart is invalid, creating new one...');
        // Cart is invalid, create a new one
        try {
          const newCart = await cartService.createCart();
          currentCartId = newCart.id;
          localStorage.setItem(CART_ID_KEY, currentCartId);
          console.log('Replacement cart created:', currentCartId);
        } catch (createError) {
          console.error('Failed to create replacement cart:', createError);
          throw new Error('Failed to create cart');
        }
      }
    }
    
    return currentCartId;
  };

  // Load cart from API
  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentCartId = await getOrCreateCart();
      setCartId(currentCartId);
      
      const cart = await cartService.getCart(currentCartId);
      const cartItems = await convertToCartItems(cart.items);
      
      setItems(cartItems);
      setTotal(cart.total);
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      setError(error.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const addItem = async (product: Product) => {
    if (!cartId) return;
    
    try {
      setError(null);
      console.log('Adding item to cart:', { cartId, productId: product.id });
      await cartService.addItem(cartId, product.id, 1);
      await refreshCart();
    } catch (error: any) {
      console.error('Failed to add item:', error);
      
      // If cart is invalid (400 error), try to recreate it and retry
      if (error.message?.includes('Invalid cart') || error.message?.includes('not found') || error.response?.status === 400) {
        console.log('Cart appears invalid, attempting to recreate and retry...');
        try {
          // Clear the invalid cart ID
          localStorage.removeItem(CART_ID_KEY);
          
          // Get a new cart
          const newCartId = await getOrCreateCart();
          console.log('New cart obtained for retry:', newCartId);
          
          // Update the cart ID state
          setCartId(newCartId);
          
          // Retry adding the item
          await cartService.addItem(newCartId, product.id, 1);
          await refreshCart();
          console.log('Item added successfully with new cart');
        } catch (retryError: any) {
          console.error('Retry failed:', retryError);
          setError(retryError.message || 'Failed to add item to cart after retry');
        }
      } else {
        setError(error.message || 'Failed to add item to cart');
      }
    }
  };

  const removeItem = async (productId: string) => {
    if (!cartId) return;
    
    try {
      setError(null);
      // Find the cart item ID
      const cart = await cartService.getCart(cartId);
      const cartItem = cart.items.find(item => item.product_id === productId);
      
      if (cartItem) {
        await cartService.removeItem(cartId, cartItem.id);
        await refreshCart();
      }
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      setError(error.message || 'Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cartId) return;
    
    try {
      setError(null);
      
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }
      
      // Find the cart item ID
      const cart = await cartService.getCart(cartId);
      const cartItem = cart.items.find(item => item.product_id === productId);
      
      if (cartItem) {
        await cartService.updateItem(cartId, cartItem.id, quantity);
        await refreshCart();
      }
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      setError(error.message || 'Failed to update item quantity');
    }
  };

  const clearCart = async (createNewCart: boolean = true) => {
    try {
      setError(null);
      
      // Clear local state immediately for instant UI feedback
      setItems([]);
      setTotal(0);
      
      // Clear cart ID from localStorage immediately
      localStorage.removeItem(CART_ID_KEY);
      setCartId(null);
      
      // Don't clear items from server - preserve cart for user
      console.log('Cart cleared locally (server cart preserved for user)');
      
      // Create a new cart for future use if requested
      if (createNewCart) {
        try {
          const newCart = await cartService.createCart();
          const newCartId = newCart.id;
          localStorage.setItem(CART_ID_KEY, newCartId);
          setCartId(newCartId);
          console.log('Created new cart for future shopping:', newCartId);
        } catch (createError) {
          console.error('Failed to create new cart:', createError);
          // Don't throw error - cart is still cleared locally
        }
      }
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      setError(error.message || 'Failed to clear cart');
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        loading,
        error,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        itemCount,
        cartId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
