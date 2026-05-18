# Shirt Print Backend API

Custom t-shirt design and ordering platform backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🛍️ Product management (pre-made t-shirts)
- 🎨 Custom design uploads via base64
- 📦 Order management with custom prints
- 🔐 Authentication with Better Auth
- ☁️ Cloudinary integration for image storage
- ✅ Server-side price validation
- 🎯 Zod validation for all inputs

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URL` - MongoDB connection string
- `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` - Cloudinary credentials
- `BETTER_AUTH_SECRET` - Secret for authentication (min 32 characters)
- `FRONTEND_URL` - Your frontend URL for CORS

### 3. Run Development Server

```bash
pnpm dev
```

## API Endpoints

### Products

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin)
```http
POST /api/products
Content-Type: application/json

{
  "name": "Classic T-Shirt",
  "description": "100% cotton comfort",
  "price": 150,
  "imageUrl": "https://...",
  "availableSizes": ["S", "M", "L", "XL"],
  "availableColors": ["White", "Black", "Blue"],
  "printAreas": [
    {
      "area": "Front",
      "width": 12,
      "height": 14,
      "fromTop": 2,
      "fromLeft": 4
    }
  ]
}
```

### Image Upload

#### Upload Custom Design (Base64)
```http
POST /api/upload/design
Content-Type: application/json

{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}
```

Or use `base64` field:
```json
{
  "base64": "iVBORw0KGgoAAAANSUhEUgA..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "custom-designs/abc123",
    "width": 800,
    "height": 600,
    "format": "png"
  }
}
```

### Orders

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id_here",
      "size": "M",
      "color": "White",
      "quantity": 2,
      "customPrints": [
        {
          "area": "Front",
          "imageUrl": "https://res.cloudinary.com/..."
        }
      ]
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "city": "New York",
    "phoneNumber": "+1234567890"
  }
}
```

**Note:** Prices are calculated server-side. The backend validates:
- Product existence
- Size and color availability
- Custom print areas validity
- Calculates total automatically (GHS 150/200/220 based on customization)

#### Get All Orders
```http
GET /api/orders
```

#### Get Order by ID
```http
GET /api/orders/:id
```

#### Get Order by Order Number
```http
GET /api/orders/number/:orderNumber
```

#### Update Order Status
```http
PATCH /api/orders/:id/status

{
  "orderStatus": "processing"
}
```

Available statuses: `pending`, `processing`, `printing`, `shipped`, `delivered`, `cancelled`

#### Update Payment Status
```http
PATCH /api/orders/:id/payment

{
  "paymentStatus": "paid"
}
```

#### Cancel Order
```http
POST /api/orders/:id/cancel

{
  "cancellationReason": "Customer requested cancellation"
}
```

## Data Models

### Product
- `name` - Product name
- `description` - Product description
- `price` - Base price (number)
- `imageUrl` - Product image URL
- `availableSizes` - Array of sizes: S, M, L, XL, XXL
- `availableColors` - Array of colors
- `printAreas` - Array of printable areas with dimensions

### Order
- `orderNumber` - Auto-generated unique order number
- `items` - Array of order items with custom prints
- `shippingAddress` - Customer shipping info
- `orderStatus` - Current order status
- `paymentStatus` - Payment status
- `total` - Total price (calculated server-side)

## Pricing Logic

Tiered pricing based on customization:
- **Pre-made shirt (no customization)**: GHS 150 per unit
- **Custom shirt (Front OR Back only)**: GHS 200 per unit
- **Custom shirt (Front AND Back)**: GHS 220 per unit

Examples:
- Standard t-shirt × 1 = **GHS 150**
- Custom t-shirt (Front only) × 1 = **GHS 200**
- Custom t-shirt (Back only) × 1 = **GHS 200**
- Custom t-shirt (Front + Back) × 1 = **GHS 220**
- Custom t-shirt (Front + Back) × 3 = **GHS 660**

## Authentication

Authentication is handled via Better Auth. Routes will be protected in future updates.

## Development

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Format code
pnpm format
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Validation:** Zod
- **Auth:** Better Auth
- **Image Storage:** Cloudinary
- **Package Manager:** pnpm
