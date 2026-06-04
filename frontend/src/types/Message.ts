export type Message = {
    threadId: number;
    messageId: number;
    senderId: number;
    receiverId: number;
    content: string;
    imageUrl: string;
    sentAt: string;
    isRead: number;
    senderName?: string;
};
