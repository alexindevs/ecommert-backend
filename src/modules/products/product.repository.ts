import { PrismaClient, Product } from "@prisma/client";

const prisma = new PrismaClient();

export default class ProductRepository {

    async getProductById(id: number): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { id },
        });
    }

    async addProduct(product: Product): Promise<Product> {
        return prisma.product.create({
            data: product,
        });
    }

    async deleteProduct(id: number): Promise<Product | null> {
        return prisma.product.delete({
            where: { id },
        });
    }

    async updateProduct(id: number, product: Product): Promise<Product | null> {
        return prisma.product.update({
            where: { id },
            data: product,
        });
    }

    async getAllProducts(): Promise<Product[]> {
        return prisma.product.findMany();
    }

    async likeProduct(id: number): Promise<Product | null> {
        return prisma.product.update({
            where: { id },
            data: { likes: { increment: 1 } },
        });
    }
}