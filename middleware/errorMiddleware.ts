import { ErrorRequestHandler } from "express";


export const errorHandler: ErrorRequestHandler = (err: Error, _req, res, _next) => {
    console.error('Error:', err);
    // TODO: Should build out a better error handling system
    res.status(500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
};