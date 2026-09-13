import { Order } from '@/types';
import { mockOrders, generateOrderNumber, getOrderByNumber, getOrdersByPlayerId } from '@/data/orders';

// Mock orders service - can be replaced with real API calls later
export const ordersService = {
  // Create a new order (mock - just stores in memory)
  createOrder: async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder: Order = {
          ...orderData,
          id: Math.random().toString(36).substr(2, 9),
          orderNumber: generateOrderNumber(),
          createdAt: new Date(),
        };
        mockOrders.push(newOrder);
        resolve(newOrder);
      }, 500);
    });
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber: string): Promise<Order | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getOrderByNumber(orderNumber)), 300);
    });
  },

  // Get orders by player ID
  getOrdersByPlayerId: async (playerId: string): Promise<Order[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getOrdersByPlayerId(playerId)), 300);
    });
  },

  // Get all orders (admin only)
  getAllOrders: async (): Promise<Order[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockOrders]), 300);
    });
  },

  // Update order status (mock)
  updateOrderStatus: async (
    orderNumber: string,
    status: Order['status']
  ): Promise<Order | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = getOrderByNumber(orderNumber);
        if (order) {
          order.status = status;
          if (status === 'completed') {
            order.completedAt = new Date();
          }
        }
        resolve(order);
      }, 300);
    });
  },
};
