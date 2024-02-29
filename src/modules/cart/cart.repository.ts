import { PrismaClient, Cart } from "@prisma/client";

const prisma = new PrismaClient();

export default class CartRepository {
    async createCart(userId: number): Promise<Cart> {
        return prisma.cart.create({
            data: {
                userId: userId
            }
        });
    }

    async updateProductQuantity(userId: number, productId: number, quantity: number): Promise<Cart | null> {
        return prisma.cart.update({
            where: {
                userId: userId
            },
            data: {
                cartItems: {
                    updateMany: {
                        where: {
                            productId: productId
                        },
                        data: {
                            quantity: quantity
                        }
                    }
                }
            },
            include: {
                cartItems: true
            }
        });
    }
    
    async getCartByUserId(userId: number): Promise<Cart | null> {
        return prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                cartItems: true
            }
        });
    }

    async getCartWithProductsByUserId(userId: number): Promise<Cart | null> {
        return prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                cartItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

async addProductToCart(userId: number, productId: number, quantity: number): Promise<Cart | null> {
    const cart = await prisma.cart.update({
        where: {
            userId: userId
        },
        data: {
            cartItems: {
                create: {
                    quantity: quantity,
                    productId: productId
                }
            },
            total: {
                increment: quantity
            }
        },
        include: {
            cartItems: true
        }
    });
    return cart;
}

    async removeProductFromCart(userId: number, productId: number): Promise<Cart | null> {
        return prisma.cart.update({
            where: {
                userId: userId
            },
            data: {
                cartItems: {
                    deleteMany: {
                        productId: productId
                    }
                }
            },
            include: {
                cartItems: true
            }
        });
    }

    async clearCart(userId: number): Promise<Cart | null> {
        return prisma.cart.update({
            where: {
                userId: userId
            },
            data: {
                cartItems: {
                    deleteMany: {}
                },
                total: 0 // Reset total to zero
            },
            include: {
                cartItems: true
            }
        });
    }    
}