import { Request, Response } from 'express';
import CartService from './cart.service';

const cartService = new CartService();

class CartController {
    async createCart(req: Request, res: Response) {
        const { userId } = req.body;
        try {
            const cart = await cartService.createCart(userId);
            res.status(201).json(cart);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateProductQuantity(req: Request, res: Response) {
        const { userId, productId } = req.params;
        const { quantity } = req.body;
        try {
            const cart = await cartService.updateProductQuantity(Number(userId), Number(productId), quantity);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCartByUserId(req: Request, res: Response) {
        const { userId } = req.params;
        try {
            const cart = await cartService.getCartByUserId(Number(userId));
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCartWithProductsByUserId(req: Request, res: Response) {
        const { userId } = req.params;
        try {
            const cartWithProducts = await cartService.getCartWithProductsByUserId(Number(userId));
            res.status(200).json(cartWithProducts);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async addProductToCart(req: Request, res: Response) {
        const { userId } = req.params;
        const { productId, quantity } = req.body;
        try {
            const cart = await cartService.addProductToCart(Number(userId), productId, quantity);
            res.status(201).json(cart);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async removeProductFromCart(req: Request, res: Response) {
        const { userId, productId } = req.params;
        try {
            const cart = await cartService.removeProductFromCart(Number(userId), Number(productId));
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async clearCart(req: Request, res: Response) {
        const { userId } = req.params;
        try {
            const cart = await cartService.clearCart(Number(userId));
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new CartController();
