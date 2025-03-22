import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.js";

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { id: string };

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      logger.error("Auth Middleware Error:", error);
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to perform this action",
      });
    }
    next();
  };
};
