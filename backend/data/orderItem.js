import db from './db.js';

export const createOrderItem = async (orderId, productId, quantity, productPrice) => {
    const [result] = await db.query(
        `INSERT INTO orderItems (orderId, productId, quantity, productPrice)
     VALUES (?, ?, ?, ?)`,
        [orderId, productId, quantity, productPrice],
    );
    return result.insertId;
};

export const getOrderItemsByOrderId = async (orderId) => {
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