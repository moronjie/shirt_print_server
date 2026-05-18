# Quick Start Guide

## What's Been Implemented

Your backend now supports:

### ✅ Custom T-Shirt Design Flow
1. **Upload designs as base64 strings** (no file uploads needed!)
2. **Server-side price calculation** (prevents client manipulation)
3. **Design validation** (checks if design fits product's print areas)
4. **Order creation with custom prints**

### ✅ Pre-Made Products
1. List all products
2. Buy without customization
3. Product management (CRUD operations)

## How to Use from Frontend

### 1. Upload a Custom Design (Base64)

From your design canvas:

```javascript
// In your React/Next.js component
const uploadDesign = async (canvas) => {
  // Convert canvas to base64
  const base64Image = canvas.toDataURL('image/png');
  
  const response = await fetch('http://localhost:5000/api/upload/design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });
  
  const { data } = await response.json();
  return data.url; // Cloudinary URL
};
```

### 2. Create Order with Custom Design

```javascript
const createOrder = async (designUrl) => {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        product: "PRODUCT_ID_HERE",
        size: "M",
        color: "White",
        quantity: 1,
        customPrints: [{
          area: "Front",
          imageUrl: designUrl
        }]
      }],
      shippingAddress: {
        name: "John Doe",
        city: "New York",
        phoneNumber: "+1234567890"
      }
    })
  });
  
  const { data } = await response.json();
  console.log('Order Number:', data.orderNumber);
};
```

### 3. Buy Pre-Made Product (No Customization)

```javascript
const buyStandardShirt = async () => {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        product: "PRODUCT_ID_HERE",
        size: "L",
        color: "Black",
        quantity: 2,
        customPrints: [] // Empty = no custom design
      }],
      shippingAddress: {
        name: "Jane Smith",
        city: "Los Angeles",
        phoneNumber: "+0987654321"
      }
    })
  });
  
  return await response.json();
};
```

## Testing the API

### 1. Start the Server

```bash
pnpm dev
```

### 2. Create a Product First

Use Postman, curl, or your frontend to create a product:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic White Tee",
    "description": "100% Cotton",
    "price": 150,
    "imageUrl": "https://example.com/tshirt.jpg",
    "availableSizes": ["S", "M", "L", "XL"],
    "availableColors": ["White", "Black", "Blue"],
    "printAreas": [{
      "area": "Front",
      "width": 12,
      "height": 14,
      "fromTop": 2,
      "fromLeft": 4
    }]
  }'
```

### 3. Test Upload (Base64)

```bash
curl -X POST http://localhost:5000/api/upload/design \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

## Price Calculation

Tiered pricing based on customization level:

- **Pre-made shirt**: GHS 150 per unit
- **Custom (Front OR Back)**: GHS 200 per unit
- **Custom (Front AND Back)**: GHS 220 per unit

Examples:
- Standard shirt × 2 = **GHS 300**
- Custom shirt (Front only) × 1 = **GHS 200**
- Custom shirt (Front + Back) × 1 = **GHS 220**
- Custom shirt (Front + Back) × 2 = **GHS 440**

The frontend sends the order, backend validates and recalculates everything.

## Frontend Design Page Recommendations

### Canvas Setup
```javascript
// Use Fabric.js or Konva.js for design canvas
import { Canvas } from 'fabric';

const canvas = new Canvas('design-canvas');

// Add user's design
canvas.add(new fabric.Image(imageElement));

// Export as base64
const base64 = canvas.toDataURL({
  format: 'png',
  quality: 0.9
});
```

### Product Display
- Show product image
- Display available sizes and colors as buttons
- Show print areas with dimensions
- Display pricing: "Standard: GHS 150 | Custom (1 area): GHS 200 | Custom (2 areas): GHS 220"

### Design Tools
- Upload image button
- Text tool
- Color picker
- Size selector
- Position controls (within print area boundaries)

## Next Steps

1. **Add Authentication**
   - Implement Better Auth session validation
   - Protect routes (orders should require login)
   - Admin-only routes for product management

2. **Add Payment Integration**
   - Stripe or PayPal
   - Update payment status after successful payment

3. **Add Order Tracking**
   - Email notifications
   - Status updates (processing → printing → shipped)

4. **Image Optimization**
   - Compress designs before upload
   - Validate dimensions match print area
   - Preview before ordering

## Environment Setup

Don't forget to set up your `.env` file:

```env
MONGODB_URL=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
BETTER_AUTH_SECRET=min-32-characters-secret-key
FRONTEND_URL=http://localhost:3000
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload/design` | Upload base64 design |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product (admin) |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/status` | Update order status |

See [README.md](README.md) for full API documentation.
