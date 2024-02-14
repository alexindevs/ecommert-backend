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
                }
            },
            include: {
                cartItems: true
            }
        });
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
}