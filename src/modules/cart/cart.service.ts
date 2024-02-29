import CartRepository from './cart.repository';

class CartService {
    private cartRepository: CartRepository;

    constructor() {
        this.cartRepository = new CartRepository();
    }

    async createCart(userId: number) {
        try {
            return await this.cartRepository.createCart(userId);
        } catch (error: any) {
            throw new Error(`Failed to create cart: ${error.message}`);
        }
    }

    async updateProductQuantity(userId: number, productId: number, quantity: number) {
        try {
            return await this.cartRepository.updateProductQuantity(userId, productId, quantity);
        } catch (error: any) {
            throw new Error(`Failed to update product quantity in cart: ${error.message}`);
        }
    }

    async getCartByUserId(userId: number) {
        try {
            return await this.cartRepository.getCartByUserId(userId);
        } catch (error: any) {
            throw new Error(`Failed to get cart by user ID: ${error.message}`);
        }
    }

    async getCartWithProductsByUserId(userId: number) {
        try {
            return await this.cartRepository.getCartWithProductsByUserId(userId);
        } catch (error: any) {
            throw new Error(`Failed to get cart with products by user ID: ${error.message}`);
        }
    }

    async addProductToCart(userId: number, productId: number, quantity: number) {
        try {
            return await this.cartRepository.addProductToCart(userId, productId, quantity);
        } catch (error: any) {
            throw new Error(`Failed to add product to cart: ${error.message}`);
        }
    }

    async removeProductFromCart(userId: number, productId: number) {
        try {
            return await this.cartRepository.removeProductFromCart(userId, productId);
        } catch (error: any) {
            throw new Error(`Failed to remove product from cart: ${error.message}`);
        }
    }

    async clearCart(userId: number) {
        try {
            return await this.cartRepository.clearCart(userId);
        } catch (error: any) {
            throw new Error(`Failed to clear cart: ${error.message}`);
        }
    }
}

export default CartService;
