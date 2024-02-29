import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors'
import {v2 as cloudinary} from 'cloudinary'
import { setConfig } from 'cloudinary-build-url'

const corsOptions = {
  origin: '*', // Add other allowed origins as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Set the appropriate success status for preflight requests
};

import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

// import swaggerUi from 'swagger-ui-express';
// import * as swaggerDocument from './config/swagger.json';  // Adjust the path accordingly
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (process.env.NODE_ENV === 'production') {
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

// Middleware to parse JSON requests
app.use(express.json());
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

setConfig({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
})

import authRouter from './modules/auth/auth.routes';
import ProductRouter from './modules/products/product.routes';
import CartRouter from './modules/cart/cart.routes';

app.use('/auth', authRouter);
app.use('/products', ProductRouter)
app.use('/carts', CartRouter)

app.get('/', (req, res) => {
  res.redirect('/api-docs');
})

// Start the Express server
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});