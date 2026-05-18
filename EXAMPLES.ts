/**
 * Example API Usage Guide
 * 
 * This file shows how to interact with the Shirt Print API from your frontend
 */

// ========================================
// 1. UPLOAD A CUSTOM DESIGN (Base64)
// ========================================

async function uploadCustomDesign(base64Image: string) {
  const response = await fetch('http://localhost:5000/api/upload/design', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image, // or use "base64" field
    }),
  });

  const result = await response.json();
  console.log('Uploaded image:', result.data.url);
  return result.data.url;
}

// Example: Convert canvas to base64 and upload
async function uploadCanvasDesign(canvas: HTMLCanvasElement) {
  const base64 = canvas.toDataURL('image/png');
  return await uploadCustomDesign(base64);
}

// ========================================
// 2. GET ALL PRODUCTS
// ========================================

async function getAllProducts() {
  const response = await fetch('http://localhost:5000/api/products');
  const result = await response.json();
  return result.data; // Array of products
}

// ========================================
// 3. GET SINGLE PRODUCT
// ========================================

async function getProduct(productId: string) {
  const response = await fetch(`http://localhost:5000/api/products/${productId}`);
  const result = await response.json();
  return result.data;
}

// ========================================
// 4. CREATE ORDER WITH CUSTOM DESIGN
// ========================================

async function createCustomOrder(
  productId: string,
  size: string,
  color: string,
  customDesignUrl: string,
  shippingInfo: any
) {
  const orderData = {
    items: [
      {
        product: productId,
        size: size,
        color: color,
        quantity: 1,
        customPrints: [
          {
            area: 'Front', // Must match product's printAreas
            imageUrl: customDesignUrl,
          },
        ],
      },
    ],
    shippingAddress: {
      name: shippingInfo.name,
      city: shippingInfo.city,
      phoneNumber: shippingInfo.phone,
    },
  };

  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();
  console.log('Order created:', result.data.orderNumber);
  return result.data;
}

// ========================================
// 5. COMPLETE WORKFLOW: Design → Upload → Order
// ========================================

async function completeCustomOrderWorkflow() {
  try {
    // Step 1: Get available products
    const products = await getAllProducts();
    const selectedProduct = products[0]; // User selects a product
    
    // Step 2: User designs on canvas (your frontend logic)
    // const canvas = document.getElementById('design-canvas') as HTMLCanvasElement;
    // const base64Design = canvas.toDataURL('image/png');
    
    // For example, using a base64 string:
    const base64Design = 'data:image/png;base64,iVBORw0KGgo...';
    
    // Step 3: Upload the design
    const uploadedImageUrl = await uploadCustomDesign(base64Design);
    
    // Step 4: Create order with the uploaded design
    const order = await createCustomOrder(
      selectedProduct._id,
      'M',
      'White',
      uploadedImageUrl,
      {
        name: 'John Doe',
        city: 'New York',
        phone: '+1234567890',
      }
    );
    
    console.log('✅ Order completed!', order);
    return order;
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// 6. CREATE ORDER WITHOUT CUSTOM DESIGN
// ========================================

async function createStandardOrder(
  productId: string,
  size: string,
  color: string,
  quantity: number,
  shippingInfo: any
) {
  const orderData = {
    items: [
      {
        product: productId,
        size: size,
        color: color,
        quantity: quantity,
        customPrints: [], // No custom design
      },
    ],
    shippingAddress: {
      name: shippingInfo.name,
      city: shippingInfo.city,
      phoneNumber: shippingInfo.phone,
    },
  };

  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  return await response.json();
}

// ========================================
// 7. TRACK ORDER
// ========================================

async function trackOrder(orderNumber: string) {
  const response = await fetch(
    `http://localhost:5000/api/orders/number/${orderNumber}`
  );
  const result = await response.json();
  return result.data;
}

// ========================================
// FRONTEND INTEGRATION TIPS
// ========================================

/*
1. Design Canvas Integration:
   - Use HTML5 Canvas or Fabric.js for the design editor
   - Convert canvas to base64: canvas.toDataURL('image/png')
   - Send base64 to /api/upload/design

2. Product Selection:
   - Fetch products from /api/products
   - Display available sizes, colors, and print areas
   - Show price + custom print cost (GHS 200 per area)

3. Custom Print Areas:
   - Each product has printAreas array
   - Use dimensions (width, height, fromTop, fromLeft) for positioning
   - Validate design fits within print area

4. Order Flow:
   - User designs → Convert to base64 → Upload to Cloudinary
   - Get uploaded URL → Create order with URL in customPrints
   - Server validates everything and calculates final price

5. Price Display (All prices in GHS):
   - Standard shirt: GHS 150
   - Custom shirt (1 print area): GHS 200
   - Custom shirt (2 print areas): GHS 220
   - × quantity
   - Show clear pricing before checkout
*/

export {
  uploadCustomDesign,
  uploadCanvasDesign,
  getAllProducts,
  getProduct,
  createCustomOrder,
  createStandardOrder,
  trackOrder,
  completeCustomOrderWorkflow,
};
