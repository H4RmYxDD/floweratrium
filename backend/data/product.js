import db from "./db.js";

export const getProducts = async () => {
  const [rows] = await db.query(`SELECT * FROM products`);
  return rows;
};

export const getProductByProductId = async (productId) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE productId = ?`,
    [productId]
  );
  return rows[0] || null;
};

export const getProductsByCategoryName = async (categoryName) => {
    const [rows] = await db.query(
        `SELECT p.* FROM products p
         JOIN categories c ON p.categoryId = c.categoryId
         WHERE c.name = ?`,
        [categoryName]
    );
    return rows;
};

export const getProductsByCategoryId = async (categoryId) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE categoryId = ?`,
    [categoryId]
  );
  return rows;
};

export const createProduct = async (
  categoryId,
  name,
  description,
  price,
  imageUrl,
  stock,
  helpLink
) => {
  const [result] = await db.query(
    `INSERT INTO products 
    (categoryId, name, description, price, imageUrl, stock, helpLink) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, name, description, price, imageUrl, stock, helpLink]
  );
  return result.insertId;
};

export const updateProduct = async (
  productId,
  categoryId,
  name,
  description,
  price,
  imageUrl,
  stock,
  helpLink
) => {
  const [result] = await db.query(
    `UPDATE products 
     SET categoryId = ?, name = ?, description = ?, price = ?, imageUrl = ?, stock = ?, helpLink = ?
     WHERE productId = ?`,
    [categoryId, name, description, price, imageUrl, stock, helpLink, productId]
  );
  return result.affectedRows;
};

export const deleteProduct = async (productId) => {
  const [result] = await db.query(
    `DELETE FROM products WHERE productId = ?`,
    [productId]
  );
  return result.affectedRows;
};
