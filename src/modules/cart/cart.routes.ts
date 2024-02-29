import express from 'express';
import CartController from './cart.controller';

const CartRouter = express.Router();

CartRouter.post('/carts', CartController.createCart);
CartRouter.put('/carts/:userId/products/:productId', CartController.updateProductQuantity);
CartRouter.get('/carts/:userId', CartController.getCartByUserId);
CartRouter.get('/carts/:userId/products', CartController.getCartWithProductsByUserId);
CartRouter.post('/carts/:userId/products', CartController.addProductToCart);
CartRouter.delete('/carts/:userId/products/:productId', CartController.removeProductFromCart);
CartRouter.delete('/carts/:userId', CartController.clearCart);

export default CartRouter;
