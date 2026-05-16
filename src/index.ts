import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/db/connect';
import mongoose from 'mongoose';
import config from './config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { createAuth } from './utils/auth';
import productsRouter from './router/products.router';
import orderRouter from './router/order.router';

const app = express();
const PORT = config.PORT || 5000;

app.use(
  cors({
    origin: [config.FRONTEND_URL || 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', orderRouter);

// Error Handling Middleware
app.use(errorHandler);

connectDB(
  config.MONGO_URI!,
  config.DB_NAME!,
);

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.once('connected', () => {
  console.log('Connected to MongoDB');
  
  const auth = createAuth();
  app.all('/api/auth/*path', toNodeHandler(auth));
  
  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
});
