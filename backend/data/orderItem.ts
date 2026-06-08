import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import db from "./db.js";

// JOIN-os query-k, tehát nem tisztán OrderItem mezőket adnak vissza. 
// Külön interface-ek kellenek

export interface OrderItem extends RowDataPacket {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  productPrice: number;
}

export interface OrderItemWithProduct extends RowDataPacket {
  quantity: number;
  productPrice: number;
  name: string;
  imageUrl: string;
  message: string;
}

export interface OrderItemWithCategory extends RowDataPacket {
  productId: number;
  quantity: number;
  name: string;
  categoryId: number;
}

export const createOrderItem = async (
  orderId: number,
  productId: number,
  quantity: number,
  productPrice: number,
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO orderItems (orderId, productId, quantity, productPrice)
     VALUES (?, ?, ?, ?)`,
    [orderId, productId, quantity, productPrice],
  );
  return result.insertId;
};

export const getOrderItemsByOrderId = async (
  orderId: number,
): Promise<OrderItemWithProduct[]> => {
  const [rows] = await db.query<OrderItemWithProduct[]>(
    `SELECT oi.quantity, oi.productPrice, p.name, p.imageUrl, o.message
     FROM orderItems oi
     JOIN products p ON oi.productId = p.productId
     JOIN orders o ON oi.orderId = o.orderId
     WHERE oi.orderId = ?`,
    [orderId],
  );
  return rows;
};

export const getAllOrderItemsWithProduct = async (): Promise<
  OrderItemWithCategory[]
> => {
  const [rows] = await db.query<OrderItemWithCategory[]>(
    `SELECT oi.productId, oi.quantity, p.name, p.categoryId
     FROM orderItems oi
     JOIN products p ON oi.productId = p.productId`,
  );
  return rows;
};
