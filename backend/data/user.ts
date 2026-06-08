import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import db from "./db.js";

export interface User extends RowDataPacket {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "User" | "Admin";
  createdAt: Date;
}

export const getUsers = async (): Promise<User[]> => {
  const [rows] = await db.query<User[]>(`SELECT * FROM users`);
  return rows;
};

export const getUserByUserId = async (userId: number): Promise<User | null> => {
  const [rows] = await db.query<User[]>(
    `SELECT * FROM users WHERE userId = ?`,
    [userId],
  );
  return rows[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await db.query<User[]>(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0] ?? null;
};

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: "User" | "Admin" = "User",
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, email, password, role],
  );
  return result.insertId;
};

export const updateUser = async (
  userId: number,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: "User" | "Admin" = "User",
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ? WHERE userId = ?`,
    [firstName, lastName, email, password, role, userId],
  );
  return result.affectedRows;
};

export const deleteUser = async (userId: number): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM users WHERE userId = ?`,
    [userId],
  );
  return result.affectedRows;
};
