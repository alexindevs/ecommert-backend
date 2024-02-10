import logger from "../../utils/logger";
import ProductInput from "./product.interface";
import ProductRepository from "./product.repository";
import { Product, Review } from "@prisma/client";

export default class ProductService {
    private productRepo: ProductRepository;

    constructor() {
        this.productRepo = new ProductRepository();
    }

    async getProductById(id: number): Promise<Product | null> {
        try {
            const product = await this.productRepo.getProductById(id);
            return product;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        try {
            const products = await this.productRepo.getAllProducts();
            return products;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async addProduct(product: ProductInput): Promise<Product> {
        try {
            const productAndDate = { createdAt: new Date(), ...product };
            const newProduct = await this.productRepo.addProduct(productAndDate);
            return newProduct;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async deleteProduct(id: number): Promise<Product | null> {
        try {
            const deletedProduct = await this.productRepo.deleteProduct(id);
            return deletedProduct;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async updateProduct(id: number, product: Product): Promise<Product | null> {
        try {
            const updatedProduct = await this.productRepo.updateProduct(id, product);
            return updatedProduct;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async likeProduct(id: number): Promise<Product | null> {
        try {
            const likedProduct = await this.productRepo.likeProduct(id);
            return likedProduct;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async unlikeProduct(id: number): Promise<Product | null> {
        try {
            const unlikedProduct = await this.productRepo.unlikeProduct(id);
            return unlikedProduct;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async fetchProductWithReviews(id: number): Promise<Product | null> {
        try {
            const fetchedProduct = await this.productRepo.fetchProductWithReviews(id);
            return fetchedProduct;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async addReview(review: Review): Promise<Review> {
        try {
            const newReview = await this.productRepo.addReview(review);
            return newReview;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async fetchFeaturedProducts(): Promise<Product[]> {
        try {
            const featuredProducts = await this.productRepo.getFeaturedProducts();
            return featuredProducts;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async deleteReview(userId: number, productId: number): Promise<Review | null> {
        try {
            const deletedReview = await this.productRepo.deleteReview(userId, productId);
            return deletedReview;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async updateReview(userId: number, productId: number, review: Partial<Review>): Promise<Review | null> {
        try {
            const updatedReview = await this.productRepo.updateReview(userId, productId, review);
            return updatedReview;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

}