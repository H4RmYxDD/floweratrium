import express from 'express';
import auth from '../middleware/auth.js';
import * as Message from '../data/message.js';

const router = express.Router();

router.get('/threads', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const threads = await Message.getThreadsByUserId(userId);
        return res.json(threads);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Szerver hiba.' });
    }
});

router.post('/threads', auth, async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.userId;

        if (!receiverId) {
            return res.status(400).json({ message: 'Missing receiverId.' });
        }

        const threadId = await Message.createThread(senderId, receiverId);
        return res.status(201).json({ threadId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Szerver hiba.' });
    }
});

router.get('/messages/:threadId', auth, async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId);
        if (isNaN(threadId)) {
            return res.status(400).json({ message: 'Érvénytelen threadId.' });
        }

        const messages = await Message.getMessagesByThreadId(threadId);

        await Message.markMessagesAsRead(threadId, req.user.userId);

        return res.json(messages);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Szerver hiba.' });
    }
});

router.post('/messages', auth, async (req, res) => {
    try {
        const { threadId, receiverId, content, imageUrl } = req.body;
        const senderId = req.user.userId;

        if (!threadId || !receiverId || (!content && !imageUrl)) {
            return res.status(400).json({ message: 'Hiányzó mezők.' });
        }

        const messageId = await Message.createMessage(
            threadId,
            senderId,
            receiverId,
            content ?? '',
            imageUrl,
        );

        return res.status(201).json({
            messageId,
            threadId,
            senderId,
            receiverId,
            content: content ?? '',
            imageUrl: imageUrl ?? null,
            sentAt: new Date(),
            isRead: false,
            senderName: `${req.user.firstName} ${req.user.lastName}`, // 👈 ADD THIS
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Szerver hiba.' });
    }
});

router.put('/messages/:threadId/read', auth, async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId);
        if (isNaN(threadId)) {
            return res.status(400).json({ message: 'Érvénytelen threadId.' });
        }
        await Message.markMessagesAsRead(threadId, req.user.userId);
        return res.json({ message: 'Üzenetek olvasottnak jelölve.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Szerver hiba.' });
    }
});

export default router;
