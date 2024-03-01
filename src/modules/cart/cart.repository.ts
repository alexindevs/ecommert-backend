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
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cart: {
                    userId: userId
                }
            },
            select: {
                quantity: true,
                product: {
                    select: {
                        price: true
                    }
                }
            }
        });
    
        const totalPrice = cartItems.reduce((acc, cartItem) => {
            const itemPrice = cartItem.product.price;
            const itemQuantity = cartItem.quantity;
            return acc + itemPrice * itemQuantity;
        }, 0);
        return prisma.cart.update({
            where: {
                userId: userId
            },
            data: {
                totalPrice: totalPrice,
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
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cart: {
                    userId: userId
                }
            },
            select: {
                quantity: true,
                product: {
                    select: {
                        price: true
                    }
                }
            }
        });
    
        const totalPrice = cartItems.reduce((acc, cartItem) => {
            const itemPrice = cartItem.product.price;
            const itemQuantity = cartItem.quantity;
            return acc + itemPrice * itemQuantity;
        }, 0);
    
        const productPrice = await prisma.product.findUnique({
            where: {
                id: productId
            },
            select: {
                price: true
            }
        });

        if (!productPrice) {
            return null;
        }
        const newTotalPrice = totalPrice + productPrice.price * quantity;
    
        return prisma.cart.update({
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
                totalPrice: newTotalPrice
            },
            include: {
                cartItems: true
            }
        });
    }
    
    async removeProductFromCart(userId: number, productId: number): Promise<Cart | null> {
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cart: {
                    userId: userId
                },
                NOT: {
                    productId: productId
                }
            },
            select: {
                quantity: true,
                product: {
                    select: {
                        price: true
                    }
                }
            }
        });
    
        const totalPrice = cartItems.reduce((acc, cartItem) => {
            const itemPrice = cartItem.product.price;
            const itemQuantity = cartItem.quantity;
            return acc + itemPrice * itemQuantity;
        }, 0);
    
        return prisma.cart.update({
            where: {
                userId: userId
            },
            data: {
                cartItems: {
                    deleteMany: {
                        productId: productId
                    }
                },
                totalPrice: totalPrice
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
                totalPrice: 0
            },
            include: {
                cartItems: true
            }
        });
    }
    
}