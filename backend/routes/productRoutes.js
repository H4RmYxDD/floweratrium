import express from "express";
import * as Product from "../data/product.js";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/checkAdmin.js";

const router = express.Router();

router.get("/products", async (req, res) => {
  const { categoryId, categoryName } = req.query;
  if (categoryName) {
    const products = await Product.getProductsByCategoryName(categoryName);
    return res.json(products);
  }
  if (categoryId) {
    const id = parseInt(categoryId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid categoryId" });
    const products = await Product.getProductsByCategoryId(id);
    return res.json(products);
  }
  const products = await Product.getProducts();
  res.json(products);
});

router.get("/products/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId))
    return res.status(400).json({ message: "Invalid productId" });

  const product = await Product.getProductByProductId(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
});

router.post("/products", auth, isAdmin, async (req, res) => {
  const { name, price, categoryId, description, imageUrl, stock, helpLink } =
    req.body;

  if (!name || name.trim() === "")
    return res.status(400).json({ message: "Product name is required" });
  if (price === undefined || isNaN(price) || Number(price) < 0)
    return res.status(400).json({ message: "Valid price is required" });
  if (!categoryId || isNaN(categoryId))
    return res.status(400).json({ message: "Valid categoryId is required" });

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
});

router.put("/products/:productId", auth, isAdmin, async (req, res) => {
  const productId = parseInt(req.params.productId);
  const { name, price, categoryId, description, imageUrl, stock, helpLink } =
    req.body;

  if (isNaN(productId))
    return res.status(400).json({ message: "Invalid productId" });
  if (!name || name.trim() === "")
    return res.status(400).json({ message: "Product name is required" });
  if (price === undefined || isNaN(price) || Number(price) < 0)
    return res.status(400).json({ message: "Valid price is required" });
  if (!categoryId || isNaN(categoryId))
    return res.status(400).json({ message: "Valid categoryId is required" });

  const existing = await Product.getProductByProductId(productId);
  if (!existing) return res.status(404).json({ message: "Product not found" });

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
});

router.delete("/products/:productId", auth, isAdmin, async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId))
    return res.status(400).json({ message: "Invalid productId" });

  const existing = await Product.getProductByProductId(productId);
  if (!existing) return res.status(404).json({ message: "Product not found" });

  await Product.deleteProduct(productId);
  res.json({ message: "Product deleted" });
});

export default router;
