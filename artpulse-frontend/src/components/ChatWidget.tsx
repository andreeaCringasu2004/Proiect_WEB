import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
interface ChatMessage {
  id: number;
  sender: string;
  role: 'bidder' | 'expert' | 'system';
  text: string;
  time: string;
  isOwn: boolean;
}

/* ══════════════════════════════════════════════════════════
   INITIAL MESSAGES (per role — different context)
   ══════════════════════════════════════════════════════════ */
const BIDDER_INITIAL: ChatMessage[] = [
  {
    id: 1,
    sender: 'ArtPulse Expert',
    role: 'expert',
    text: 'Hello! I\'m Elena, your assigned expert evaluator for this auction. I\'m available to answer any questions about this work — provenance, condition, authentication, or market value.',
    time: '10:02',
    isOwn: false,
  },
  {
    id: 2,
    sender: 'ArtPulse Expert',
    role: 'expert',
    text: 'Feel free to ask about the artist\'s background, the technique used, or anything that might affect your bidding decision.',
    time: '10:03',
    isOwn: false,
  },
];

const EXPERT_INITIAL: ChatMessage[] = [
  {
    id: 1,
    sender: 'System',
    role: 'system',
    text: 'Expert review channel — Lumière dorée (Lot #1). You are reviewing this work. Bidders may contact you with questions.',
    time: '09:55',
    isOwn: false,
  },
  {
    id: 2,
    sender: 'Bidder ***42',
    role: 'bidder',
    text: 'Hi, I have a question about the condition report. Is the linen support showing any signs of tension loss at the corners?',
    time: '10:10',
    isOwn: false,
  },
];

/* Quick reply suggestions per role */
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

/* ══════════════════════════════════════════════════════════
   CHAT WIDGET
   ══════════════════════════════════════════════════════════ */
interface ChatWidgetProps {
  /** Optional: lock the widget to a specific auction title shown in header */
  auctionTitle?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ auctionTitle }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    user?.role === 'expert' ? EXPERT_INITIAL : BIDDER_INITIAL
  );
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(user?.role === 'expert' ? 1 : 0);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgId = useRef(100);

  /* Only show for bidder or expert */
  if (!user || !['bidder', 'seller', 'expert'].includes(user.role)) return null;

  const isExpert = user.role === 'expert';
  const quickReplies = isExpert ? EXPERT_QUICK : BIDDER_QUICK;

  const getTime = () =>
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  /* Scroll to bottom on new messages */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimised]);

  /* Auto-response simulation */
  const simulateResponse = (userMsg: string) => {
    setIsTyping(true);
    const delay = 1200 + Math.random() * 1000;
    setTimeout(() => {
      setIsTyping(false);
      const responses = isExpert
        ? [
            `Thank you for your question about "${userMsg.slice(0, 30)}...". I've reviewed the work extensively and can confirm it meets our authentication standards.`,
            'I examined this piece in person at the artist\'s studio. The materials and technique are entirely consistent with the artist\'s known practice.',
            'The condition is excellent — no restorations, no re-lining, no canvas deformations. The surface is stable and fully intact.',
            'I can issue a supplementary written condition report within 24 hours if that would help your decision.',
          ]
        : [
            'Thank you — that\'s very helpful information.',
            'That\'s great to know. It gives me more confidence in placing a bid.',
            'I appreciate the clarification. Could you also tell me if there have been any past exhibitions?',
            'Understood. Is a viewing appointment possible before the auction closes?',
          ];

      const resp = responses[Math.floor(Math.random() * responses.length)];
      const newMsg: ChatMessage = {
        id: ++msgId.current,
        sender: isExpert ? 'Bidder ***42' : 'ArtPulse Expert',
        role: isExpert ? 'bidder' : 'expert',
        text: resp,
        time: getTime(),
        isOwn: false,
      };
      setMessages(prev => [...prev, newMsg]);
      if (!open || minimised) setUnread(u => u + 1);
    }, delay);
  };

  const sendMessage = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const newMsg: ChatMessage = {
      id: ++msgId.current,
      sender: user.name,
      role: user.role as 'bidder' | 'expert',
      text: msg,
      time: getTime(),
      isOwn: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    simulateResponse(msg);
    inputRef.current?.focus();
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
      {/* ── Toggle Button ── */}
      {!open && (
        <button
          className="chat-fab"
          onClick={handleOpen}
          title={isExpert ? 'Open bidder messages' : 'Ask the Expert'}
          aria-label="Open chat"
        >
          <span className="chat-fab__icon">
            {isExpert ? '🎓' : '💬'}
          </span>
          <span className="chat-fab__label">
            {isExpert ? 'Bidder Q&A' : 'Ask Expert'}
          </span>
          {unread > 0 && (
            <span className="chat-fab__badge">{unread}</span>
          )}
        </button>
      )}

      {/* ── Chat Window ── */}
      {open && (
        <div className={`chat-window ${minimised ? 'chat-window--minimised' : ''}`}>

          {/* Header */}
          <div className="chat-header" onClick={minimised ? handleMinimise : undefined}>
            <div className="chat-header__info">
              <div className="chat-header__avatar">
                {isExpert ? '🎓' : '🖼'}
              </div>
              <div>
                <div className="chat-header__title">
                  {isExpert ? 'Bidder Q&A Channel' : 'Ask the Expert'}
                </div>
                <div className="chat-header__sub">
                  {auctionTitle
                    ? `Re: ${auctionTitle.slice(0, 28)}${auctionTitle.length > 28 ? '…' : ''}`
                    : isExpert
                    ? 'Lot #1 · Lumière dorée'
                    : 'Elena · Certified Evaluator'}
                </div>
              </div>
            </div>
            <div className="chat-header__actions">
              <button
                className="chat-header__btn"
                onClick={e => { e.stopPropagation(); handleMinimise(); }}
                title={minimised ? 'Expand' : 'Minimise'}
                aria-label={minimised ? 'Expand chat' : 'Minimise chat'}
              >
                {minimised ? '▲' : '▼'}
              </button>
              <button
                className="chat-header__btn chat-header__btn--close"
                onClick={e => { e.stopPropagation(); handleClose(); }}
                title="Close chat"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div className="chat-messages" role="log" aria-live="polite">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`chat-msg ${msg.isOwn ? 'chat-msg--own' : ''} ${msg.role === 'system' ? 'chat-msg--system' : ''}`}
                  >
                    {!msg.isOwn && msg.role !== 'system' && (
                      <div className={`chat-msg__avatar chat-msg__avatar--${msg.role}`}>
                        {msg.role === 'expert' ? '🎓' : '🎯'}
                      </div>
                    )}
                    <div className="chat-msg__content">
                      {!msg.isOwn && msg.role !== 'system' && (
                        <span className="chat-msg__sender">{msg.sender}</span>
                      )}
                      <div className={`chat-msg__bubble chat-msg__bubble--${msg.role}`}>
                        {msg.text}
                      </div>
                      <span className="chat-msg__time">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="chat-msg">
                    <div className={`chat-msg__avatar chat-msg__avatar--${isExpert ? 'bidder' : 'expert'}`}>
                      {isExpert ? '🎯' : '🎓'}
                    </div>
                    <div className="chat-msg__content">
                      <div className="chat-typing">
                        <span /><span /><span />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              <div className="chat-quick">
                {quickReplies.map((q, i) => (
                  <button key={i} className="chat-quick__btn" onClick={() => sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <input
                  ref={inputRef}
                  className="chat-input"
                  type="text"
                  placeholder={isExpert ? 'Reply to bidder…' : 'Ask the expert anything…'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  maxLength={400}
                  aria-label="Chat message"
                />
                <button
                  className="chat-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  title="Send (Enter)"
                >
                  ↑
                </button>
              </div>

              <div className="chat-footer-note">
                Messages are moderated · No personal data shared
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;