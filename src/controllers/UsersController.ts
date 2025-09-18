import { Request, Response } from "express";
import { formatResponse } from "../utils/constants";
import { createUsersValidationSchema, getUserDetailsValidationSchema, loginUserValidationSchema, } from "../validationSchema/userControllerValidationSchema";
import bcrypt from 'bcrypt';
import redis from "../config/redis";
import { io } from "../server"; 
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { Users } from "../models/Users";

const JWT_SECRET = process.env.JWT_SECRET || 'CODESFORTOMMAROW';
interface LoginPayload {
    username: string;
    password: string;
}

interface JwtPayload {
    id: number;
    username: string,
    email: string,
    last_login: string,
}

export class UsersController {
    /** Create User */
    createUser = async (req: Request, res: Response) => {
        try {
            const {
                username,
                email,
                password,
            } = req.body;

            /** Validation */
            const validate = createUsersValidationSchema.validate(req.body, {
                abortEarly: false,
            });

            if (validate.error) {
                res.json(formatResponse(400, false, 'Validation failed', validate.error.details.map((d: any) => d.message)));
                return
            }

            /** Check if user already exists */
            const existingUser = await Users.findOne({
                where: { username },
            });

            if (existingUser) {
                res.json(formatResponse(409, false, 'User already registered'));
                return
            }
            /** Create user */
            const hashedPassword = await bcrypt.hash(password, 14);
            const userPayload = {
                username,
                email,
                password: hashedPassword,
                is_online: 0
            };
            const newUser: any = await Users.create(userPayload);

            if (newUser) {
                const respData = {
                    id: newUser.id,
                    username,
                    email,
                }
                res.json(formatResponse(200, true, 'User Created successfully', respData));
            } else {
                res.json(formatResponse(500, false, 'Somthing else please try again...'));
            }
        } catch (error) {
            res.json(formatResponse(500, false, 'Internal server error'));
        }
    };


    login = async (req: Request, res: Response) => {
        try {
            const { username, password }: LoginPayload = req.body;
            /** Validation */
            const validate = loginUserValidationSchema.validate(req.body, {
                abortEarly: false,
            });

            if (validate.error) {
                res.json(formatResponse(400, false, 'Validation failed', validate.error.details.map((d: any) => d.message)));
                return
            }
            /**Find user by username */
            const user: any = await Users.findOne({ where: { username: username } });
            if (!user) {
                res.status(401).json(formatResponse(401, false, 'Invalid credentials'));
                return
            }

            /**Compare password */
            let passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                res.status(401).json(formatResponse(401, false, 'Invalid credentials'));
                return
            }

            user.last_login = moment().format('YYYY-MM-DD HH:mm:ss');
            user.is_online = 1;
            user.save();

            /** Check for existing session & Delete old session through of redis */
            const existingToken = await redis.get(`user:${user.id}:session`);
            if (existingToken) {
                await redis.del(`user:${user.id}:session`);
            }

            const payload: JwtPayload = {
                id: user.id,
                username: user.username,
                email: user.email,
                last_login: user.last_login,
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });


            /** Save session in Redis */
            await redis.set(`user:${user.id}:session`, token, "EX", 3600);
            const existingToken2 = await redis.get(`user:${user.id}:session`);
            console.log('--- existingToken---2--- ', existingToken2)

            /** Save token inside HTTP-only Cookie */
            res.cookie('auth_token', token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',  
                sameSite: 'strict',
                maxAge: 5 * 60 * 60 * 1000,
            });

            res.json(formatResponse(200, true, 'User login successfully!..', payload));

        } catch (error) {
            res.status(500).json(formatResponse(500, false, 'Internal server error'));
        }
    };


    getUserDetails = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            /** Validation */
            const validate = getUserDetailsValidationSchema.validate(req.params, {
                abortEarly: false,
            });

            if (validate.error) {
                res.json(
                    formatResponse(
                        400,
                        false,
                        "Validation failed",
                        validate.error.details.map((d: any) => d.message)
                    )
                );
                return;
            }

            const cacheKey = `user:${id}`;

            /**  Check Redis Cache First */
            const cachedUser = await redis.get(cacheKey);
            if (cachedUser) {
                console.log("Redis Cache HIT");
                return res.json(
                    formatResponse(
                        200,
                        true,
                        "User Details fetched successfully (from cache)",
                        JSON.parse(cachedUser)
                    )
                );
            }

            /**   If Not in Cache, Fetch from Moel (DB) */
            const user = await Users.findOne({
                attributes: ["id", "username", "email", "is_online", "last_login"],
                where: { id },
            });

            if (!user) {
                return res.json(formatResponse(404, false, "User not found", null));
            }

            /**  Save in Cache  60 sec */
            await redis.set(cacheKey, JSON.stringify(user), "EX", 60);

            res.json(formatResponse(200, true, "User Details fetched successfully", user));
        } catch (error) {
            res.json(formatResponse(500, false, "Internal server error", error));
        }
    };


    updateStatus = async (req: Request, res: Response) => {
        try {
            const { id, is_online } = req.body;

            const user: any = await Users.findOne({ where: { id } });
            if (!user) {
                res.status(401).json(formatResponse(401, false, 'User Not Found'));
                return
            }

            user.is_online = is_online;
            user.save();
            const userName = user.username;
            var statusValue = '';
            if (user.is_online == 1) {
                statusValue = 'Online'
            } else {
                statusValue = "Offline"
            }
            /** Send notification socket */
            io.emit("userStatusUpdated", { userName, statusValue });

            return res.json({ success: true, message: "User status updated" });
        } catch (error) {
            return res.status(500).json({ success: false, error });
        }
    }



    logout = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(400).json(formatResponse(400, false, 'User not found in request'));
            }
            const user: any = await Users.findOne({ where: { id: userId } });

            user.is_online = 0;
            user.save();
            const userName = user.username;
            const status = "Offline";
            /** Send notification socket */
            io.emit("userStatusUpdated", { userName, status });

            /** Delete session from Redis */
            await redis.del(`user:${userId}:session`);

            /** Clear auth cookie */
            res.clearCookie('auth_token');

            res.json(formatResponse(200, true, 'Logged out successfully'));
        } catch (err) {
            // console.error('Logout error:', err);
            res.status(500).json(formatResponse(500, false, 'Logout failed'));
        }
    }
}
