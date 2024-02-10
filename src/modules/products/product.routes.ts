import express, { Router } from "express";
import ProductController from "./product.controller";
import { upload } from "../../utils/storage";
import { checkIfAdmin, tokenVerification } from "../../middleware/auth.middleware";

const productController = new ProductController();

const ProductRoutes = Router();
ProductRoutes.use(express.json());


ProductRoutes.post("/products", tokenVerification, checkIfAdmin, upload.array('images', 5), productController.addProduct);
ProductRoutes.delete("/products/:id",tokenVerification, checkIfAdmin,  productController.deleteProduct);
ProductRoutes.get("/products/:id", productController.getProductById);
ProductRoutes.get("/products/featured", productController.getFeaturedProducts);
ProductRoutes.patch("/products/:id", productController.updateProduct);
ProductRoutes.post("/products/:id/like", tokenVerification, productController.likeProduct);
ProductRoutes.post("/products/:id/unlike",tokenVerification, productController.unlikeProduct);
ProductRoutes.get("/products/:id/reviews", productController.fetchProductWithReviews);
ProductRoutes.post("/products/:id/reviews",tokenVerification, productController.addReview);
ProductRoutes.delete("/products/:id/reviews/:reviewId", tokenVerification, productController.deleteReview);
ProductRoutes.get("/products", productController.getAllProducts);
ProductRoutes.patch("/products/:id/reviews/:reviewId", tokenVerification, productController.updateReview);