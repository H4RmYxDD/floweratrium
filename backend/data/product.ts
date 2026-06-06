import { ResultSetHeader } from "mysql2/promise";
import db from "./db.js";

export interface Product {
  productId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  helpLink?: string | null;
}

export const getProducts = async () => {
  const [rows] = await db.query(`SELECT * FROM products`);
  return rows;
};

export const getProductByProductId = async (productId: number) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE productId = ?`,
    [productId]
  );
  return db.query<ResultSetHeader>('SELECT * FROM products WHERE productId = ?', [productId]);
};

export const getProductsByCategoryName = async (categoryName: string) => {
    const [rows] = await db.query(
        `SELECT p.* FROM products p
         JOIN categories c ON p.categoryId = c.categoryId
         WHERE c.name = ?`,
        [categoryName]
    );
    return rows;
};

export const getProductsByCategoryId = async (categoryId: number) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE categoryId = ?`,
    [categoryId]
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
  helpLink: string | null
) => {
  const [result] = await db.query(
    `INSERT INTO products 
    (categoryId, name, description, price, imageUrl, stock, helpLink) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, name, description, price, imageUrl, stock, helpLink]
  );
  return db.query<ResultSetHeader>('SELECT LAST_INSERT_ID() AS productId');
};

export const updateProduct = async (
  productId: number,
  categoryId: number,
  name: string,
  description: string,
  price: number,
  imageUrl: string,
  stock: number,
  helpLink: string | null
) => {
  const [result] = await db.query(
    `UPDATE products 
     SET categoryId = ?, name = ?, description = ?, price = ?, imageUrl = ?, stock = ?, helpLink = ?` +
      ` 
     WHERE productId = ?`,
    [categoryId, name, description, price, imageUrl, stock, helpLink, productId]
  );
  return db.query<ResultSetHeader>('SELECT ROW_COUNT() AS affectedRows');
};

export const deleteProduct = async (productId: number) => {
  const [result] = await db.query(
    `DELETE FROM products WHERE productId = ?`,
    [productId]
  );
  return db.query<ResultSetHeader>('SELECT ROW_COUNT() AS affectedRows');
};
