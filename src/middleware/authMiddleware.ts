import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { formatResponse } from '../utils/constants';
import redis from "../config/redis";

const JWT_SECRET =  process.env.JWT_SECRET || 'CODESFORTOMMAROW';

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies?.auth_token;
        // console.log('Token Value Login:', token);

        if (!token) {
            res.status(403).json(formatResponse(403, false, 'Token missing'));
            return;
        }

        /** decodw token */
        const decoded: any = jwt.verify(token, JWT_SECRET);


        /** Check token in Redis */
        const currentToken = await redis.get(`user:${decoded.id}:session`);
        console.log('----- currentToken', decoded)
        if (!currentToken || currentToken !== token) {
            res.status(401).json(formatResponse(401, false, 'Session expired or logged in elsewhere'));
            return;
        }

        (req as any).user = decoded;
        next();

    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(403).json(formatResponse(403, false, 'Invalid token or auth error'));
    }
};
