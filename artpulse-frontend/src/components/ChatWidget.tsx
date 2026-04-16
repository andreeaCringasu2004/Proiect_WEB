import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './ChatWidget.css';


const BIDDER_QUICK = [
  'Can you tell me more about the condition?',
  'Is the attribution fully verified?',
  'What does the certificate cover?',
  'Has this work been exhibited publicly?',
];

const EXPERT_QUICK = [
  'The condition is excellent — no issues.',
  'Authentication has been independently verified.',
  'I have examined the work in person.',
  'I can provide a full written condition report.',
];


interface ChatWidgetProps {
  initialProductId?: number;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ initialProductId = -1 }) => {
  const { user } = useAuth();
  const { messages, addMessage, users } = useData();
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [wsStatus] = useState<'online' | 'offline'>('online');
  const [currentChannelId] = useState(initialProductId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isExpert = user?.role === 'expert';
  const quickReplies = isExpert ? EXPERT_QUICK : BIDDER_QUICK;

  const filteredMessages = messages.filter(m => m.productId === currentChannelId);


  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages.length, open, minimised]);

  useEffect(() => {
    if (!open || minimised) return;
    setUnread(0);
  }, [filteredMessages.length, open, minimised]);


  if (!user || !['bidder', 'seller', 'expert', 'admin'].includes(user.role)) return null;

  const sendMessage = (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;

    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    addMessage({
      id: Date.now(),
      productId: currentChannelId,
      fromId: user.id || 0,
      toId: 0,
      text: msgText,
      time
    });

    setInput('');
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const getUserName = (id: number) => {
    if (id === 0) return 'Expert Support';
    if (!users) return 'User';
    const u = users.find(x => x.id === id);
    return u ? u.name : `User #${id}`;
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimised(false);
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => setOpen(false);
  const handleMinimise = () => setMinimised(m => !m);

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={handleOpen} title="Open Chat">
          <span className="chat-fab__icon">{currentChannelId === -1 ? '💬' : '🖼'}</span>
          <span className="chat-fab__label">{currentChannelId === -1 ? 'Expert Q&A' : 'Work Chat'}</span>
          {unread > 0 && <span className="chat-fab__badge">{unread}</span>}
        </button>
      )}

      {open && (
        <div className={`chat-window ${minimised ? 'chat-window--minimised' : ''}`}>
          <div className="chat-header" onClick={minimised ? handleMinimise : undefined}>
            <div className="chat-header__info">
              <div className="chat-header__avatar">{currentChannelId === -1 ? '🏫' : '🖼'}</div>
              <div>
                <div className="chat-header__title">
                  {currentChannelId === -1 ? 'ArtPulse Expert Q&A' : 'Technical Discussion'}
                </div>
                <div className="chat-header__sub">
                  <span className={`chat-ws-dot chat-ws-dot--${wsStatus}`} />
                  {currentChannelId === -1 ? 'Public Channel' : `Lot #${currentChannelId}`}
                </div>
              </div>
            </div>
            <div className="chat-header__actions">
              <button className="chat-header__btn" onClick={handleMinimise}>{minimised ? '▲' : '▼'}</button>
              <button className="chat-header__btn chat-header__btn--close" onClick={handleClose}>✕</button>
            </div>
          </div>

          {!minimised && (
            <>
              <div className="chat-messages">
                {filteredMessages.map(msg => {
                  const isOwn = msg.fromId === user.id;
                  const senderName = getUserName(msg.fromId);
                  return (
                    <div key={msg.id} className={`chat-msg ${isOwn ? 'chat-msg--own' : ''}`}>
                      {!isOwn && <div className="chat-msg__avatar">👤</div>}
                      <div className="chat-msg__content">
                        {!isOwn && <span className="chat-msg__sender">{senderName}</span>}
                        <div className={`chat-msg__bubble ${isOwn ? 'chat-msg__bubble--own' : ''}`}>
                          {msg.text}
                        </div>
                        <span className="chat-msg__time">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="chat-quick">
                {quickReplies.map((q, i) => (
                  <button key={i} className="chat-quick__btn" onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>

              <div className="chat-input-row">
                <input
                  ref={inputRef}
                  className="chat-input"
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                />
                <button className="chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim()}>↑</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;