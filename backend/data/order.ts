import { ResultSetHeader } from 'mysql2';
import db from './db.js';

export interface Order {
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
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
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
    status = 'Pending',
) => {
    const [result] = await db.query(
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
    return await db.query<ResultSetHeader>('SELECT LAST_INSERT_ID() AS orderId');
};

export const getOrders = async () => {
    const [rows] = await db.query(`SELECT * FROM orders`);
    return rows;
};

export const getOrderByOrderId = async (orderId: number) => {
    const [rows] = await db.query(`SELECT * FROM orders WHERE orderId = ?`, [orderId]);
    return db.query<ResultSetHeader>('SELECT * FROM orders WHERE orderId = ?', [orderId]);
};

export const getOrdersByUserId = async (userId: number) => {
    const [rows] = await db.query(`SELECT * FROM orders WHERE userId = ?`, [userId]);
    return rows;
};

export const updateOrderStatus = async (orderId: number, status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    const [result] = await db.query(`UPDATE orders SET status = ? WHERE orderId = ?`, [
        status,
        orderId,
    ]);
    return db.query<ResultSetHeader>('SELECT ROW_COUNT() AS affectedRows');
};

export const deleteOrder = async (orderId: number) => {
    const [result] = await db.query(`DELETE FROM orders WHERE orderId = ?`, [orderId]);
    return db.query<ResultSetHeader>('SELECT ROW_COUNT() AS affectedRows');
};
