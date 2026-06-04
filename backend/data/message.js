import db from './db.js';

export async function getThreadsByUserId(userId) {
    const [rows] = await db.query(
        `SELECT 
            m.threadId,
            CASE 
                WHEN m.senderId = ? THEN m.receiverId 
                ELSE m.senderId 
            END AS otherUserId,
            CONCAT(u.firstName, ' ', u.lastName) AS otherUserName,
            m.content AS lastMessage,
            m.sentAt AS lastMessageTime
        FROM messages m
        JOIN users u 
            ON u.userId = CASE 
                WHEN m.senderId = ? THEN m.receiverId 
                ELSE m.senderId 
            END
        WHERE (m.senderId = ? OR m.receiverId = ?)
        AND m.messageId = (
            SELECT MAX(messageId)
            FROM messages
            WHERE threadId = m.threadId
        )
        ORDER BY m.messageId DESC`,
        [userId, userId, userId, userId],
    );

    return rows;
}

export async function getMessagesByThreadId(threadId) {
    const [rows] = await db.query(
        `SELECT 
            m.*,
            CONCAT(u.firstName, ' ', u.lastName) AS senderName
        FROM messages m
        JOIN users u ON m.senderId = u.userId
        WHERE m.threadId = ?
        ORDER BY m.sentAt ASC`,
        [threadId]
    );

    return rows;
}

export async function createThread(senderId, receiverId) {
    const [result] = await db.query(
        'INSERT INTO messages (senderId, receiverId, content, sentAt) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, '', new Date()],
    );
    const newMessageId = result.insertId;
    await db.query('UPDATE messages SET threadId = ? WHERE messageId = ?', [
        newMessageId,
        newMessageId,
    ]);
    return newMessageId;
}

export async function createMessage(threadId, senderId, receiverId, content, imageUrl) {
    const [result] = await db.query(
        'INSERT INTO messages (threadId, senderId, receiverId, content, imageUrl, sentAt) VALUES (?, ?, ?, ?, ?, ?)',
        [threadId, senderId, receiverId, content, imageUrl ?? null, new Date()],
    );
    return result.insertId;
}

export async function markMessagesAsRead(threadId, userId) {
    await db.query('UPDATE messages SET isRead = TRUE WHERE threadId = ? AND receiverId = ?', [
        threadId,
        userId,
    ]);
}
