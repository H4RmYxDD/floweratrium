import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import db from "./db.js";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order extends RowDataPacket {
  orderId: number;
  userId: number;
  customerName: string;
  email: string;
  phoneNumber: string;
  postalCode: string;
  city: string;
  address: string;
  message: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
}

export const createOrder = async (
  userId: number,
  customerName: string,
  email: string,
  phoneNumber: string,
  postalCode: string,
  city: string,
  address: string,
  message: string,
  totalAmount: number,
  status: OrderStatus = "Pending",
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO orders (userId, customerName, email, phoneNumber, postalCode, city, address, message, totalAmount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      customerName,
      email,
      phoneNumber,
      postalCode,
      city,
      address,
      message,
      totalAmount,
      status,
    ],
  );
  return result.insertId;
};

export const getOrders = async (): Promise<Order[]> => {
  const [rows] = await db.query<Order[]>(`SELECT * FROM orders`);
  return rows;
};

export const getOrderByOrderId = async (
  orderId: number,
): Promise<Order | null> => {
  const [rows] = await db.query<Order[]>(
    `SELECT * FROM orders WHERE orderId = ?`,
    [orderId],
  );
  return rows[0] ?? null;
};

export const getOrdersByUserId = async (userId: number): Promise<Order[]> => {
  const [rows] = await db.query<Order[]>(
    `SELECT * FROM orders WHERE userId = ?`,
    [userId],
  );
  return rows;
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE orders SET status = ? WHERE orderId = ?`,
    [status, orderId],
  );
  return result.affectedRows;
};

export const deleteOrder = async (orderId: number): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM orders WHERE orderId = ?`,
    [orderId],
  );
  return result.affectedRows;
};
