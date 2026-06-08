import { Request, Response, NextFunction } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (req.user.role !== "Admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
};

export default isAdmin;
