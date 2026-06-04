import db from "./db.js";

export const getCategories = async () => {
  const [rows] = await db.query(`SELECT * FROM categories`);
  return rows;
};

export const getCategoryByCategoryId = async (categoryId) => {
  const [rows] = await db.query(
    `SELECT * FROM categories WHERE categoryId = ?`,
    [categoryId]
  );
  return rows[0] || null;
};

export const createCategory = async (name) => {
  const [result] = await db.query(
    `INSERT INTO categories (name) VALUES (?)`,
    [name]
  );
  return result.insertId;
};

export const updateCategory = async (categoryId, name) => {
  const [result] = await db.query(
    `UPDATE categories SET name = ? WHERE categoryId = ?`,
    [name, categoryId]
  );
  return result.affectedRows;
};

export const deleteCategory = async (categoryId) => {
  const [result] = await db.query(
    `DELETE FROM categories WHERE categoryId = ?`,
    [categoryId]
  );
  return result.affectedRows;
};
