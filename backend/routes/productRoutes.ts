import express, { Request, Response } from "express";
import * as Product from "../data/product.js";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/checkAdmin.js";

const router = express.Router();

router.get("/products", async (req: Request, res: Response): Promise<void> => {
  const { categoryId, categoryName } = req.query;
  if (categoryName) {
    const products = await Product.getProductsByCategoryName(
      String(categoryName),
    );
    res.json(products);
    return;
  }
  if (categoryId) {
    const id = parseInt(String(categoryId));
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid categoryId" });
      return;
    }
    const products = await Product.getProductsByCategoryId(id);
    res.json(products);
    return;
  }
  const products = await Product.getProducts();
  res.json(products);
});

router.get(
  "/products/:productId",
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(String(req.params.productId));
    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid productId" });
      return;
    }

    const product = await Product.getProductByProductId(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  },
);

router.post(
  "/products",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { name, price, categoryId, description, imageUrl, stock, helpLink } =
      req.body;

    if (!name || name.trim() === "") {
      res.status(400).json({ message: "Product name is required" });
      return;
    }
    if (price === undefined || isNaN(price) || Number(price) < 0) {
      res.status(400).json({ message: "Valid price is required" });
      return;
    }
    if (!categoryId || isNaN(categoryId)) {
      res.status(400).json({ message: "Valid categoryId is required" });
      return;
    }

    const productId = await Product.createProduct(
      Number(categoryId),
      name.trim(),
      description || "",
      Number(price),
      imageUrl || "",
      stock || 0,
      helpLink || "",
    );

    res.status(201).json({
      productId,
      name: name.trim(),
      price: Number(price),
      categoryId: Number(categoryId),
      description: description || "",
      imageUrl: imageUrl || "",
      stock: stock || 0,
      helpLink: helpLink || "",
    });
  },
);

router.put(
  "/products/:productId",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(String(req.params.productId));
    const { name, price, categoryId, description, imageUrl, stock, helpLink } =
      req.body;

    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid productId" });
      return;
    }
    if (!name || name.trim() === "") {
      res.status(400).json({ message: "Product name is required" });
      return;
    }
    if (price === undefined || isNaN(price) || Number(price) < 0) {
      res.status(400).json({ message: "Valid price is required" });
      return;
    }
    if (!categoryId || isNaN(categoryId)) {
      res.status(400).json({ message: "Valid categoryId is required" });
      return;
    }

    const existing = await Product.getProductByProductId(productId);
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await Product.updateProduct(
      productId,
      Number(categoryId),
      name.trim(),
      description || "",
      Number(price),
      imageUrl || "",
      stock || 0,
      helpLink || "",
    );
    res.json({ message: "Product updated" });
  },
);

router.delete(
  "/products/:productId",
  auth,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(String(req.params.productId));
    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid productId" });
      return;
    }

    const existing = await Product.getProductByProductId(productId);
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await Product.deleteProduct(productId);
    res.json({ message: "Product deleted" });
  },
);

export default router;
