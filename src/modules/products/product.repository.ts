import { PrismaClient, Product, Review  } from "@prisma/client";
import ProductInput from "./product.interface";

const prisma = new PrismaClient();

export default class ProductRepository {

    async getProductById(id: number): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { id },
        });
    }

    async getFeaturedProducts(): Promise<Product[]> {
        return prisma.product.findMany({
            where: { isFeatured: true },
        });
    }

    async addProduct(product: ProductInput): Promise<Product> {
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

    async unlikeProduct(id: number): Promise<Product | null> {
        return prisma.product.update({
            where: { id },
            data: { likes: { decrement: 1 } },
        });
    }

    async fetchProductWithReviews(id: number): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { id },
            include: { reviews: true },
        });
    }

    async addReview(review: Review): Promise<Review> {
        return prisma.review.create({
            data: review,
        });
    }

    async deleteReview(userId: number, productId: number): Promise<Review | null> {
        return prisma.review.delete({
            where: { 
                userId_productId: {
                    userId: userId,
                    productId: productId
                }
            }
        });
    }

    async updateReview(userId: number, productId: number, review: Partial<Review>): Promise<Review | null> {
        return prisma.review.update({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId
                }
            },
            data: review,
        });
    }



    

    
}