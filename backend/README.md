# AmicalPay Backend API

Node.js/Express backend for AmicalPay e-commerce platform.

## Features

- 🔐 **Secure API** - Admin token authentication
- 💎 **Free Fire Diamond Sales** - FazerCards integration ready
- 📋 **Order Management** - Create, track, and manage orders
- 🔔 **Webhooks** - Real-time order status updates from FazerCards
- 🌍 **Multi-region Support** - EU, LATAM, BR, MENA
- ⚙️ **Environment Configuration** - Secure secret management

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Set the required variables:
- `FAZER_API_KEY` - FazerCards API key (keep secret!)
- `ADMIN_TOKEN` - Admin authentication token
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Server port (default: 5000)

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Build

```bash
npm run build
```

Output: `dist/` directory

## Production

```bash
npm start
```

## API Endpoints

### Public Endpoints

#### Get Products by Region
```bash
GET /api/products?region=LATAM
```

Response:
```json
{
  "region": "LATAM",
  "count": 2,
  "products": [...]
}
```

#### Get Product Details
```bash
GET /api/products/:id
```

#### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "product_id": "latam-ff-500",
  "player_id": "123456789",
  "email": "player@example.com",
  "whatsapp_number": "+50943882372",
  "region": "LATAM",
  "currency": "HTG"
}
```

Response:
```json
{
  "id": "abc123",
  "order_number": "ORD-20240913-0001",
  "product_id": "latam-ff-500",
  "player_id": "123456789",
  "status": "pending",
  "created_at": "2024-09-13T21:30:00.000Z"
}
```

#### Track Order
```bash
GET /api/orders/:orderNumber
```

#### Health Check
```bash
GET /health
```

### Admin Endpoints (Require Bearer Token)

```bash
Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### Admin Dashboard
```bash
GET /api/admin/dashboard
```

### Webhooks

#### FazerCards Webhook
```bash
POST /api/webhook/fazer
Content-Type: application/json

{
  "event": "order.completed",
  "order_id": "ORD-20240913-0001",
  "status": "completed",
  "data": { ... }
}
```

## Security

⚠️ **IMPORTANT**

1. **Never commit `.env`** - Use `.env.example` only
2. **Secrets on backend only** - `FAZER_API_KEY`, `ADMIN_TOKEN`
3. **CORS enabled** - Restricted to frontend URL
4. **Token validation** - All admin endpoints require authentication
5. **Input validation** - All user inputs are validated

## Deployment (Render)

See `render.yaml` at repository root.

### Required Secrets in Render

1. `FAZER_API_KEY` - FazerCards API key
2. `ADMIN_TOKEN` - Admin authentication token

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Entry point
│   ├── server.ts          # Express app setup
│   ├── config/
│   │   └── env.ts         # Environment configuration
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   └── errorHandler.ts # Error handling middleware
│   └── routes/
│       ├── products.ts    # Product endpoints
│       ├── orders.ts      # Order endpoints
│       ├── admin.ts       # Admin endpoints
│       └── webhook.ts     # Webhook endpoints
├── dist/                  # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Next Steps

1. **FazerCards Integration** - Replace mock endpoints with real API calls
2. **Database** - Connect to persistent storage (MongoDB, PostgreSQL)
3. **Authentication** - Add user login and JWT tokens
4. **Payment Processing** - Integrate MonCash, NatCash, PayPal
5. **Admin Dashboard** - Build admin UI for order management
