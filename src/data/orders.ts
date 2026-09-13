import { Order } from '@/types';
import { allProducts } from './products';

// Mock orders for demonstration
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-20240913-001',
    product: allProducts[3], // 1000 Diamonds EU
    playerId: 'ABC123456789',
    whatsappNumber: '+50943882372',
    email: 'player@example.com',
    region: 'EU',
    currency: 'USD',
    totalPrice: 19.99,
    status: 'completed',
    paymentMethod: 'paypal',
    createdAt: new Date('2024-09-10'),
    completedAt: new Date('2024-09-10'),
  },
  {
    id: '2',
    orderNumber: 'ORD-20240913-002',
    product: allProducts[1], // 250 Diamonds EU
    playerId: 'XYZ987654321',
    whatsappNumber: '+50943882372',
    email: 'gamer@example.com',
    region: 'LATAM',
    currency: 'HTG',
    totalPrice: 249.5,
    status: 'processing',
    paymentMethod: 'moncash',
    createdAt: new Date('2024-09-12'),
  },
  {
    id: '3',
    orderNumber: 'ORD-20240913-003',
    product: allProducts[10], // 500 Diamonds LATAM
    playerId: 'DEF456789012',
    whatsappNumber: '+50943882372',
    email: 'freefireuser@example.com',
    region: 'BR',
    currency: 'USD',
    totalPrice: 9.99,
    status: 'payment_verification',
    paymentMethod: 'natcash',
    createdAt: new Date('2024-09-13'),
  },
  {
    id: '4',
    orderNumber: 'ORD-20240913-004',
    product: allProducts[20], // 1000 Diamonds BR
    playerId: 'GHI123456789',
    whatsappNumber: '+50943882372',
    email: 'br.player@example.com',
    region: 'BR',
    currency: 'HTG',
    totalPrice: 999.5,
    status: 'pending',
    paymentMethod: 'paypal',
    createdAt: new Date('2024-09-13'),
  },
];

export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  return mockOrders.find(o => o.orderNumber === orderNumber);
};

export const getOrdersByPlayerId = (playerId: string): Order[] => {
  return mockOrders.filter(o => o.playerId === playerId);
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
};
