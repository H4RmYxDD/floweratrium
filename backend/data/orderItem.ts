import { ResultSetHeader } from 'mysql2';
import db from './db.js';

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    productId: number;
    quantity: number;
    productPrice: number;
}

export const createOrderItem = async (orderId: number, productId: number, quantity: number, productPrice: number) => {
    const [result] = await db.query(
        `INSERT INTO orderItems (orderId, productId, quantity, productPrice)
     VALUES (?, ?, ?, ?)`,
        [orderId, productId, quantity, productPrice],
    );
    return db.query<ResultSetHeader>('SELECT LAST_INSERT_ID() AS orderItemId');
};

export const getOrderItemsByOrderId = async (orderId: number) => {
    const [rows] = await db.query(
        `SELECT oi.quantity, oi.productPrice, p.name, p.imageUrl, o.message
    FROM orderItems oi
    JOIN products p ON oi.productId = p.productId
    JOIN orders o ON oi.orderId = o.orderId
    WHERE oi.orderId = ?`,
        [orderId],
    );
    return rows;
};

export const getAllOrderItemsWithProduct = async () => {
    const [rows] = await db.query(`
        SELECT 
            oi.productId,
            oi.quantity,
            p.name,
            p.categoryId
        FROM orderItems oi
        JOIN products p ON oi.productId = p.productId
    `);
    return rows;
};