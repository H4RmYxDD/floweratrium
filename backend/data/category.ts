import db from "./db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface Category extends RowDataPacket {
  categoryId: number;
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const [rows] = await db.query<Category[]>("SELECT * FROM categories");
  return rows;
};

export const getCategoryByCategoryId = async (
  categoryId: number,
): Promise<Category | null> => {
  const [rows] = await db.query<Category[]>(
    "SELECT * FROM categories WHERE categoryId = ?",
    [categoryId],
  );
  return rows[0] ?? null;
};

export const createCategory = async (name: string): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO categories (name) VALUES (?)",
    [name],
  );
  return result.insertId;
};

export const updateCategory = async (
  categoryId: number,
  name: string,
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    "UPDATE categories SET name = ? WHERE categoryId = ?",
    [name, categoryId],
  );
  return result.affectedRows;
};

export const deleteCategory = async (categoryId: number): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM categories WHERE categoryId = ?",
    [categoryId],
  );
  return result.affectedRows;
};
