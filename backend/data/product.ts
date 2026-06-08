import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import db from "./db.js";

export interface Product extends RowDataPacket {
  productId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  helpLink?: string | null;
}

export const getProducts = async (): Promise<Product[]> => {
  const [rows] = await db.query<Product[]>(`SELECT * FROM products`);
  return rows;
};

export const getProductByProductId = async (
  productId: number,
): Promise<Product | null> => {
  const [rows] = await db.query<Product[]>(
    `SELECT * FROM products WHERE productId = ?`,
    [productId],
  );
  return rows[0] ?? null;
};

export const getProductsByCategoryName = async (
  categoryName: string,
): Promise<Product[]> => {
  const [rows] = await db.query<Product[]>(
    `SELECT p.* FROM products p
     JOIN categories c ON p.categoryId = c.categoryId
     WHERE c.name = ?`,
    [categoryName],
  );
  return rows;
};

export const getProductsByCategoryId = async (
  categoryId: number,
): Promise<Product[]> => {
  const [rows] = await db.query<Product[]>(
    `SELECT * FROM products WHERE categoryId = ?`,
    [categoryId],
  );
  return rows;
};

export const createProduct = async (
  categoryId: number,
  name: string,
  description: string,
  price: number,
  imageUrl: string,
  stock: number,
  helpLink: string | null,
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO products (categoryId, name, description, price, imageUrl, stock, helpLink)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, name, description, price, imageUrl, stock, helpLink],
  );
  return result.insertId;
};

export const updateProduct = async (
  productId: number,
  categoryId: number,
  name: string,
  description: string,
  price: number,
  imageUrl: string,
  stock: number,
  helpLink: string | null,
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE products
     SET categoryId = ?, name = ?, description = ?, price = ?, imageUrl = ?, stock = ?, helpLink = ?
     WHERE productId = ?`,
    [
      categoryId,
      name,
      description,
      price,
      imageUrl,
      stock,
      helpLink,
      productId,
    ],
  );
  return result.affectedRows;
};

export const deleteProduct = async (productId: number): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM products WHERE productId = ?`,
    [productId],
  );
  return result.affectedRows;
};
