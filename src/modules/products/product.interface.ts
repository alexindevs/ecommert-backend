interface ProductInput {
    name: string;
    userId: number;
    description: string;
    price: number;
    stock: number;
    image: string;
    createdAt?: Date;
}

export default ProductInput;