import Joi from 'joi';

export const createUsersValidationSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.base': 'Username must be a string',
        'any.required': 'Username is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
    }),
}).unknown(true);

 

export const loginUserValidationSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.base': 'Username must be a string',
        'any.required': 'Username is required'
    }),
    password: Joi.string().required().messages({ 
        'any.required': 'Password is required'
    }),
}).unknown(true);


export const getUserDetailsValidationSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID must be a number',
        'number.positive': 'ID must be a positive number',
        'any.required': 'ID is required'
    }),
}).unknown(true);