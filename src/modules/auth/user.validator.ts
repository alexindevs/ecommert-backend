import Joi from 'joi';

export const userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    isAdmin: Joi.boolean(),
    isBlocked: Joi.boolean(),
    profileImage: Joi.string(),
    otp: Joi.string(),
})