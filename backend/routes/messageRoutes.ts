import express, { Request, Response } from "express";
import auth from "../middleware/auth.js";
import * as Message from "../data/message.js";

const router = express.Router();

router.get(
  "/threads",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const threads = await Message.getThreadsByUserId(userId);
      res.json(threads);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Szerver hiba." });
    }
  },
);

router.post(
  "/threads",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { receiverId } = req.body;
      const senderId = req.user!.userId;

      if (!receiverId) {
        res.status(400).json({ message: "Missing receiverId." });
        return;
      }

      const threadId = await Message.createThread(senderId, receiverId);
      res.status(201).json({ threadId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Szerver hiba." });
    }
  },
);

router.get(
  "/messages/:threadId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const threadId = parseInt(String(req.params.threadId));
      if (isNaN(threadId)) {
        res.status(400).json({ message: "Érvénytelen threadId." });
        return;
      }

      const messages = await Message.getMessagesByThreadId(threadId);
      await Message.markMessagesAsRead(threadId, req.user!.userId);
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Szerver hiba." });
    }
  },
);

router.post(
  "/messages",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { threadId, receiverId, content, imageUrl } = req.body;
      const senderId = req.user!.userId;

      if (!threadId || !receiverId || (!content && !imageUrl)) {
        res.status(400).json({ message: "Hiányzó mezők." });
        return;
      }

      const messageId = await Message.createMessage(
        threadId,
        senderId,
        receiverId,
        content ?? "",
        imageUrl,
      );

      res.status(201).json({
        messageId,
        threadId,
        senderId,
        receiverId,
        content: content ?? "",
        imageUrl: imageUrl ?? null,
        sentAt: new Date(),
        isRead: false,
        senderName: `${req.user!.firstName} ${req.user!.lastName}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Szerver hiba." });
    }
  },
);

router.put(
  "/messages/:threadId/read",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const threadId = parseInt(String(req.params.threadId));
      if (isNaN(threadId)) {
        res.status(400).json({ message: "Érvénytelen threadId." });
        return;
      }

      await Message.markMessagesAsRead(threadId, req.user!.userId);
      res.json({ message: "Üzenetek olvasottnak jelölve." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Szerver hiba." });
    }
  },
);

export default router;
