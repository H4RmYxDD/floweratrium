import { ResultSetHeader } from "mysql2";
import db from "./db.js";

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "User" | "Admin";
}
export const getUsers = async () => {
  const [rows] = await db.query(`SELECT * FROM users`);
  return rows;
};

export const getUserByUserId = async (userId: number) => {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE userId = ?`,
    [userId]
  );
  return db.query<ResultSetHeader>('SELECT * FROM users WHERE userId = ?', [userId]);
};

export const getUserByEmail = async (email: string) => {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return db.query<ResultSetHeader>('SELECT * FROM users WHERE email = ?', [email]);
};

export const createUser = async (firstName: string, lastName: string, email: string, password: string, role = "User") => {
  const [result] = await db.query(
    `INSERT INTO users (firstName, lastName, email, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, email, password, role]
  );
  return db.query<ResultSetHeader>('SELECT LAST_INSERT_ID() AS userId');
};

export const updateUser = async (userId: number, firstName: string, lastName: string, email: string, password: string, role = "User") => {
  const [result] = await db.query(
    `UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ? WHERE userId = ?`,
    [firstName, lastName, email, password, role, userId]
  );
  return db.query<ResultSetHeader>('SELECT ROW_COUNT() AS affectedRows');
};

export const deleteUser = async (userId: number) => {
  const [result] = await db.query(
    `DELETE FROM users WHERE userId = ?`,
    [userId]
  );
  return db.query<ResultSetHeader>('SELECT ROW_COUNT() AS affectedRows');
};
