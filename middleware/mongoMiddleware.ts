import { RequestHandler } from "express";
import { getClient } from "../db";

      // MongoDB connection middleware
export const mongoMiddleware: RequestHandler = (req, _res, next) => {
    try {
        req.db = getClient();
        next();
    } catch (error) {
        next(new Error('Database connection not available'));
    }
};