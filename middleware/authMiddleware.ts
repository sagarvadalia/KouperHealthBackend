import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.session.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
};
