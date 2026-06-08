import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as User from "../data/user.js";

interface JwtPayload {
  userId: number;
}
// ez a declare kiegészíti a requestet hogy tudja majd h van nekünk userünk és ne problémázzon miatta
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
        role: "User" | "Admin";
        createdAt: Date;
      };
    }
  }
}

const auth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing or invalid token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "secret_key",
    ) as JwtPayload;

    const user = await User.getUserByUserId(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
