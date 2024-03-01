import express, { Router } from "express";
import ProductController from "./product.controller";
import { upload } from "../../utils/storage";
import { checkIfAdmin, tokenVerification } from "../../middleware/auth.middleware";

const productController = new ProductController();

const ProductRoutes = Router();
ProductRoutes.use(express.json());


ProductRoutes.post("/", tokenVerification, checkIfAdmin, upload.array('images', 5), productController.addProduct);
ProductRoutes.delete("/:id",tokenVerification, checkIfAdmin,  productController.deleteProduct);
ProductRoutes.get("/:id", productController.getProductById);
ProductRoutes.get("/featured", productController.getFeaturedProducts);
ProductRoutes.put("/:id/feature", tokenVerification, checkIfAdmin, productController.makeFeatured);
ProductRoutes.put("/:id/unfeature", tokenVerification, checkIfAdmin, productController.unmakeFeatured);
ProductRoutes.patch("/:id", productController.updateProduct);
ProductRoutes.post("/:id/like", tokenVerification, productController.likeProduct);
ProductRoutes.post("/:id/unlike",tokenVerification, productController.unlikeProduct);
ProductRoutes.get("/:id/reviews", productController.fetchProductWithReviews);
ProductRoutes.post("/:id/reviews",tokenVerification, productController.addReview);
ProductRoutes.delete("/:id/reviews/:reviewId", tokenVerification, productController.deleteReview);
ProductRoutes.get("/", productController.getAllProducts);
ProductRoutes.patch("/:productId/reviews/:userId", tokenVerification, productController.updateReview);

export default ProductRoutes;