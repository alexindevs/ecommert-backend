import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().required(),
    userId: Joi.number().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().min(1).required(),
})