import express, { Request, Response } from "express";
import * as User from "../data/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/checkAdmin.js";

const router = express.Router();

router.get("/me", auth, async (req: Request, res: Response): Promise<void> => {
  res.json(req.user);
});

router.get(
  "/users",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const users = await User.getUsers();
    res.json(users);
  },
);

router.get(
  "/users/:id",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id));
    const user = await User.getUserByUserId(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  },
);
//test commit

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existingUser = await User.getUserByEmail(email);
    if (existingUser){
         res.status(400).json({ message: "User already exists." });
         return
    }

    const password_hash = await bcrypt.hash(password, 10);
    await User.createUser(firstName, lastName, email, password_hash);

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user." });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password){
         res.status(400).json({ message: "Email and password are required." });
         return;
    }

    const user = await User.getUserByEmail(email);
    if (!user){
            res.status(401).json({ message: "Invalid credentials." });
            return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
            res.status(401).json({ message: "Invalid credentials." });
            return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT secret is not set");
      res.status(500).json({ message: "Server configuration error." });
      return;
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      secret,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error during login." });
  }
});

export default router;
