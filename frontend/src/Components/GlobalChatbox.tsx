import { Button } from 'react-bootstrap';
import { IoIosClose, IoIosSend, IoMdReorder, IoMdResize } from 'react-icons/io';
import '../styles/GlobalChatboxStyle.css';
import { useState, useRef, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { AiOutlinePlus } from 'react-icons/ai';
import useAuth from '../store/authStore';

type Message = {
    messageId?: number;
    senderId: number;
    receiverId: number;
    threadId: number;
    content?: string;
    imageUrl?: string;
    sentAt?: string;
    senderName?: string;
};

type Thread = {
    threadId: number;
    otherUserName?: string;
    lastMessage?: string;
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalChatbox = ({ isOpen, onClose }: Props) => {
    const userId = Number(useAuth((state) => state.userId));
    const [isResized, setIsResized] = useState(false);
    const [size, setSize] = useState({ width: 340, height: 420 });

    const resizingRef = useRef(false);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    const startSizeRef = useRef<{ width: number; height: number } | null>(null);

    const [threads, setThreads] = useState<Thread[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [threadId, setThreadId] = useState<number>(0);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const activeThread = threads.find((t) => t.threadId === threadId);

    const [message, setMessage] = useState({
        senderId: userId,
        receiverId: 8,
        content: '',
    });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!threadId) return;

        apiClient
            .get<Message[]>(`/messages/${threadId}`)
            .then((res) => setMessages(res.data))
            .catch(() => toast.error('Hiba történt az üzenetek betöltése közben.'));
    }, [threadId]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const sendMessage = () => {
        if (!message.content.trim()) return;

        if (!threadId) {
            toast.warning('Először hozz létre egy beszélgetést!');
            return;
        }

        apiClient
            .post<Message>('/messages', {
                ...message,
                threadId,
            })
            .then((res) => {
                setMessages((prev) => [...prev, res.data]);
                setMessage((prev) => ({ ...prev, content: '' }));
            })
            .catch(() => toast.error('Hiba történt az üzenet elküldése közben.'));
    };

    const openHistoryPanel = () => {
        apiClient
            .get<Thread[]>('/threads')
            .then((res) => {
                setThreads(res.data);
                setIsHistoryOpen((prev) => !prev);
            })
            .catch(() => toast.error('Hiba történt a beszélgetési előzmények betöltése közben.'));
    };

    const selectThread = (id: number) => {
        setThreadId(id);
        setIsHistoryOpen(false);
    };

    const createThread = () => {
        apiClient
            .post<{ threadId: number }>('/threads', { receiverId: 1 })
            .then((res) => {
                setThreadId(res.data.threadId);
                setMessages([]);
                return apiClient.get<Thread[]>('/threads');
            })
            .then((res) => setThreads(res.data))
            .catch(() => toast.error('Hiba történt az új beszélgetés létrehozása közben.'));
    };

    const togglePresetSize = () => {
        if (isResized) {
            setSize({ width: 340, height: 420 });
        } else {
            setSize({ width: 640, height: 620 });
        }
        setIsResized((prev) => !prev);
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        resizingRef.current = true;
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startSizeRef.current = { ...size };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!resizingRef.current || !startPosRef.current || !startSizeRef.current) return;

            const dx = moveEvent.clientX - startPosRef.current.x;
            const dy = moveEvent.clientY - startPosRef.current.y;

            setSize({
                width: Math.max(280, Math.min(900, startSizeRef.current.width + dx)),
                height: Math.max(200, Math.min(900, startSizeRef.current.height + dy)),
            });

            setIsResized(true);
        };

        const handleMouseUp = () => {
            resizingRef.current = false;
            startPosRef.current = null;
            startSizeRef.current = null;

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    if (!isOpen) return null;

    return (
        <div
            className={`global-chatbox ${isResized ? 'resized' : ''}`}
            style={{ width: `${size.width}px`, height: `${size.height}px` }}
        >
            {isHistoryOpen && (
                <div className="history-panel">
                    <div className="history-panel-header">
                        <span>Előzmények</span>
                        <Button
                            variant="link"
                            className="exit-button"
                            onClick={() => setIsHistoryOpen(false)}
                        >
                            <IoIosClose size={22} />
                        </Button>
                    </div>

                    <div className="history-list">
                        {threads.length === 0 ? (
                            <p className="history-empty">Nincs korábbi beszélgetés.</p>
                        ) : (
                            threads.map((t) => (
                                <div
                                    key={t.threadId}
                                    className={`history-item ${
                                        t.threadId === threadId ? 'active' : ''
                                    }`}
                                    onClick={() => selectThread(t.threadId)}
                                >
                                    <span className="history-item-title">
                                        {t.otherUserName ?? `Beszélgetés #${t.threadId}`}
                                    </span>
                                    <span className="history-item-preview">
                                        {t.lastMessage || 'Nincs üzenet'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="chatbox-header">
                <Button className="history-button" variant="link" onClick={openHistoryPanel}>
                    <IoMdReorder size={24} />
                </Button>

                <span style={{ fontWeight: 500 }}>
                    {activeThread?.otherUserName || 'Nincs kiválasztva'}
                </span>

                <Button
                    className="resize-button"
                    variant="link"
                    onClick={togglePresetSize}
                    onMouseDown={handleResizeMouseDown}
                    title="Click to toggle size / drag to resize"
                    style={{ cursor: 'nwse-resize' }}
                >
                    <IoMdResize size={16} />
                </Button>

                <Button className="exit-button" variant="link" onClick={onClose}>
                    <IoIosClose size={30} />
                </Button>
            </div>

            <div className="messages-area">
                <Button className="new-thread-button" variant="link" onClick={createThread}>
                    <AiOutlinePlus />
                </Button>

                {messages.map((msg, i) => (
                    <div
                        key={msg.messageId ?? i}
                        className={`message-bubble ${msg.senderId === userId ? 'mine' : 'theirs'}`}
                    >
                        <span className="message-sender">
                            {msg.senderId === userId ? 'Te' : msg.senderName || 'Másik fél'}
                        </span>

                        {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="attachment" className="message-image" />
                        )}

                        {msg.content && <span className="message-content">{msg.content}</span>}

                        {msg.sentAt && (
                            <span className="message-time">
                                {new Date(msg.sentAt).toLocaleTimeString('hu-HU', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        )}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div className="bottom-bar">
                <input
                    type="text"
                    placeholder="Írj üzenetet..."
                    value={message.content}
                    onChange={(e) =>
                        setMessage((prev) => ({
                            ...prev,
                            content: e.target.value,
                        }))
                    }
                    onKeyDown={handleKeyDown}
                />

                <Button className="send-button" onClick={sendMessage}>
                    <IoIosSend size={28} />
                </Button>
            </div>
        </div>
    );
};

export default GlobalChatbox;
