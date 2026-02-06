import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, Customer, OrderStatus } from '../types';

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], customer: Customer, notes: string) => Order;
  getOrdersByCustomer: (customerId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getAllOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_STORAGE_KEY = 'pahala_orders';

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load orders from localStorage on mount
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Failed to parse orders:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save orders to localStorage on changes
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const createOrder = (items: CartItem[], customer: Customer, notes: string): Order => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    const newOrder: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items,
      customer,
      status: 'pending',
      total,
      notes,
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrdersByCustomer = (customerId: string): Order[] => {
    return orders.filter(order => order.customer.id === customerId);
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const getAllOrders = (): Order[] => {
    return orders;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getOrdersByCustomer,
        getOrderById,
        updateOrderStatus,
        getAllOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
