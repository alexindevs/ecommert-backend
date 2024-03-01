import express from 'express';
import CartController from './cart.controller';

const CartRouter = express.Router();

CartRouter.post('/', CartController.createCart);
CartRouter.put('/:userId/products/:productId', CartController.updateProductQuantity);
CartRouter.get('/:userId', CartController.getCartByUserId);
CartRouter.get('/:userId/products', CartController.getCartWithProductsByUserId);
CartRouter.post('/:userId/products', CartController.addProductToCart);
CartRouter.delete('/:userId/products/:productId', CartController.removeProductFromCart);
CartRouter.delete('/:userId', CartController.clearCart);

export default CartRouter;
