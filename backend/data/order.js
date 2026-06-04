import db from './db.js';

export const createOrder = async (
    userId,
    customerName,
    email,
    phoneNumber,
    postalCode,
    city,
    address,
    message,
    totalAmount,
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
    return result.insertId;
};

export const getOrders = async () => {
    const [rows] = await db.query(`SELECT * FROM orders`);
    return rows;
};

export const getOrderByOrderId = async (orderId) => {
    const [rows] = await db.query(`SELECT * FROM orders WHERE orderId = ?`, [orderId]);
    return rows[0] || null;
};

export const getOrdersByUserId = async (userId) => {
    const [rows] = await db.query(`SELECT * FROM orders WHERE userId = ?`, [userId]);
    return rows;
};

export const updateOrderStatus = async (orderId, status) => {
    const [result] = await db.query(`UPDATE orders SET status = ? WHERE orderId = ?`, [
        status,
        orderId,
    ]);
    return result.affectedRows;
};

export const deleteOrder = async (orderId) => {
    const [result] = await db.query(`DELETE FROM orders WHERE orderId = ?`, [orderId]);
    return result.affectedRows;
};
