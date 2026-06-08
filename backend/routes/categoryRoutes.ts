import express, { Request, Response } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/checkAdmin.js";
import * as Category from "../data/category.js";

const router = express.Router();

router.get(
  "/categories",
  async (req: Request, res: Response): Promise<void> => {
    const categories = await Category.getCategories();
    res.json(categories);
  },
);

router.get(
  "/categories/:categoryId",
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(String(req.params.categoryId));
    if (isNaN(categoryId)) {
      res.status(400).json({ message: "Invalid categoryId" });
      return;
    }

    const category = await Category.getCategoryByCategoryId(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  },
);

router.post(
  "/categories",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const categoryId = await Category.createCategory(name);
    res.status(201).json({ categoryId, name });
  },
);

router.put(
  "/categories/:categoryId",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(String(req.params.categoryId));
    if (isNaN(categoryId)) {
      res.status(400).json({ message: "Invalid categoryId" });
      return;
    }

    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const category = await Category.getCategoryByCategoryId(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    await Category.updateCategory(categoryId, name);
    res.json({ categoryId, name });
  },
);

router.delete(
  "/categories/:categoryId",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = parseInt(String(req.params.categoryId));
    if (isNaN(categoryId)) {
      res.status(400).json({ message: "Invalid categoryId" });
      return;
    }

    const category = await Category.getCategoryByCategoryId(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    await Category.deleteCategory(categoryId);
    res.json({ message: "Category deleted successfully" });
  },
);

export default router;
