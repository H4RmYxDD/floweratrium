import db from "./db.js";

export const getUsers = async () => {
  const [rows] = await db.query(`SELECT * FROM users`);
  return rows;
};

export const getUserByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE userId = ?`,
    [userId]
  );
  return rows[0] || null;
};

export const getUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

export const createUser = async (firstName, lastName, email, password, role = "User") => {
  const [result] = await db.query(
    `INSERT INTO users (firstName, lastName, email, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, email, password, role]
  );
  return result.insertId;
};

export const updateUser = async (userId, firstName, lastName, email, password, role = "User") => {
  const [result] = await db.query(
    `UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ? WHERE userId = ?`,
    [firstName, lastName, email, password, role, userId]
  );
  return result.affectedRows;
};

export const deleteUser = async (userId) => {
  const [result] = await db.query(
    `DELETE FROM users WHERE userId = ?`,
    [userId]
  );
  return result.affectedRows;
};
