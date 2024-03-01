import { v2 as cloudinary } from 'cloudinary';
import { extractPublicId } from 'cloudinary-build-url'
import { Request, Response } from 'express';
import ProductService from './product.service';
import fs from 'fs';
import { productSchema } from './product.validator';
import logger from '../../utils/logger';

const productService = new ProductService();
const cloudinaryFolder = process.env.CLD_FOLDER || "ecommert";

const extractFilenameFromCloudinaryUrl = (imageUrl: string) => {
    const parts = imageUrl.split('/');
    console.log("Filename from Cloudinary URL:",parts[parts.length - 1])
    return parts[parts.length - 1];
};

const deleteItemFromLocalStorage = (publicID: string) => {
    // Extract the file extension from the public ID
    const parts = publicID.split('.');
    const fileExtension = parts[parts.length - 1];

    // Check if it's a jpg and replace it with jpeg
    if (fileExtension === "jpg") {
        const correctedPublicID = `${publicID.substring(0, publicID.lastIndexOf('.'))}.jpeg`;
        const fileName = `${correctedPublicID}`;
        const filePath = `./uploads/${fileName}`;

        // Check if a file with the "jpeg" extension exists
        if (fs.existsSync(filePath)) {
            const originalFilePath = `./uploads/${publicID}`;
            try {
                fs.unlinkSync(originalFilePath);
                console.log(`Local file ${fileName} deleted successfully.`);
            } catch (err : any) {
                console.error(`Error deleting local file ${fileName}: ${err.message}`);
            }
        } else {
            try {
                // If no file with the "jpeg" extension exists, delete the original, aka switch back to jpg

            } catch (err : any) {
                console.error(`Error deleting local file ${fileName}: ${err.message}`);
            }
        }
    } else {
        // For other file extensions, use the original public ID
        const fileName = `${publicID}.${fileExtension}`;
        const filePath = `./uploads/${fileName}`;

        try {
            fs.unlinkSync(filePath);
            console.log(`Local file ${fileName} deleted successfully.`);
        } catch (err: any) {
            console.error(`Error deleting local file ${fileName}: ${err.message}`);
        }
    }
};

const deleteUploadedImages = async (imageUrls: string[]) => {
    for (const imageUrl of imageUrls) {
      try {
        // Extract the filename from the Cloudinary URL

        const filename = extractFilenameFromCloudinaryUrl(imageUrl);
  
        // Delete the item image from local storage
        deleteItemFromLocalStorage(filename);

        // Extract the public ID from the Cloudinary URL
        const publicID = extractPublicId(imageUrl);
  
        // Attempt to delete the image from Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.destroy(publicID);

      if (cloudinaryResponse.result === 'ok') {
        console.log("Image deleted:", imageUrl);
      } else {
        console.error('Error deleting uploaded image from Cloudinary:', cloudinaryResponse.result);
      }
      } catch (error) {
        console.error('Error deleting uploaded image from Cloudinary:', error);
  
        return; // Exit the loop on error
      }  
    }
};

export default class ProductController {

    async addProduct(req: Request, res: Response) {
        try {
            const validate  = productSchema.validate(req.body);
            if(validate.error) {
                return res.status(400).json(validate.error);
            }
            const { name, description, price, userId, stock } = req.body;
            const imageFiles: Express.Multer.File[] = req.files as Express.Multer.File[] || [];
            if (!imageFiles) {
                return res.status(400).json({ success: false, message: 'No image files were uploaded' });
              }
          
              if (imageFiles.length > 5) {
                return res.status(400).json({ success: false, message: 'Cannot upload more than 5 images' });
              }
          
              const uploadedImages: string[] = [];
          
              for (const imageFile of imageFiles) {
                try {
                  console.log("About to upload to cloudinary.")
                  const result = await cloudinary.uploader.upload(imageFile.path, {
                    folder: cloudinaryFolder,
                    use_filename: true,
                    unique_filename: false,
                    resource_type: 'auto',
                  });
                  uploadedImages.push(result.secure_url);
                  console.log("File uploaded:", result.secure_url);
                } catch (error) {
                  console.error('Error in Cloudinary:', error);
                  await deleteUploadedImages(uploadedImages);
                  return res.status(500).json({ success: false, message: 'Error uploading image' });
                }
              }
              const imageUrls: string = uploadedImages.join(',');

            const product = await productService.addProduct({
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                userId: parseInt(userId),
                image: imageUrls
            });

            if (product) {
                return res.status(201).json(product);
              } else {
                // Rollback: Delete the uploaded images
                await deleteUploadedImages(uploadedImages);
                return res.status(500).json({ success: false, message: 'Failed to create item' });
              }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.deleteProduct(parseInt(id));
            if (product) {
                return res.status(200).json({ success: true, message: 'Item deleted successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async makeFeatured(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.setFeatured(parseInt(id));
            if (product) {
                return res.status(200).json({ success: true, message: 'Item featured successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async unmakeFeatured(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.unsetFeatured(parseInt(id));
            if (product) {
                return res.status(200).json({ success: true, message: 'Item unfeatured successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(parseInt(id));
            if (product) {
                return res.status(200).json(product);
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getFeaturedProducts(req: Request, res: Response) {
        try {
            const products = await productService.fetchFeaturedProducts();
            return res.status(200).json(products);
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.updateProduct(parseInt(id), req.body);
            if (product) {
                return res.status(200).json({ success: true, message: 'Item updated successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async likeProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.likeProduct(parseInt(id));
            if (product) {
                return res.status(200).json({ success: true, message: 'Item liked successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async unlikeProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.unlikeProduct(parseInt(id));
            if (product) {
                return res.status(200).json({ success: true, message: 'Item unliked successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async fetchProductWithReviews(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.fetchProductWithReviews(parseInt(id));
            if (product) {
                return res.status(200).json({ success: true, product });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async addReview(req: Request, res: Response) {
        try {
            const review = await productService.addReview(req.body);
            if (review) {
                return res.status(201).json({ success: true, message: 'Review created successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteReview(req: Request, res: Response) {
        try {
            const { userId, productId } = req.params;
            const review = await productService.deleteReview(parseInt(userId), parseInt(productId));
            if (review) {
                return res.status(200).json({ success: true, message: 'Review deleted successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const products = await productService.getAllProducts();
            return res.status(200).json({ success: true, products });
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateReview(req: Request, res: Response) {
        try {
            const { userId, productId } = req.params;
            const review = await productService.updateReview(parseInt(userId), parseInt(productId), req.body);
            if (review) {
                return res.status(200).json({ success: true, message: 'Review updated successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
        } catch (error: any) {
            logger.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}