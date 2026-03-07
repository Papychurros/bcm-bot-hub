import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SESSION_ID = `bcm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME = `👋 Bonjour ! Je suis l'assistant BCM Hub.

Je peux vous renseigner sur :
🤖 BOB — assistant personnel Telegram
💰 CASH — gestion financière Telegram
📧 MAG — tri automatique des emails Gmail

Quelle est votre question ?`;

const WEBHOOK_URL = 'https://n8n.srv1380611.hstgr.cloud/webhook/a6b7d18a-b8f8-460e-9d4f-aba6f7135eb4/chat';

export default function ChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendMessage', chatInput: text, sessionId: SESSION_ID }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.output || 'Désolé, je n\'ai pas pu répondre.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Erreur de connexion. Réessayez.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed top-14 right-4 z-50 w-[380px] h-[520px] rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden"
      style={{ background: '#0f0f1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <span className="font-display font-bold text-sm tracking-wide" style={{ color: '#a855f7' }}>
          Assistant BCM Hub
        </span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line",
            msg.role === 'user'
              ? "ml-auto text-white rounded-br-sm"
              : "text-white/90 rounded-bl-sm"
          )} style={{
            background: msg.role === 'user' ? '#a855f7' : '#1a1a2e'
          }}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Votre message…"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500 transition-colors"
        />
        <button onClick={send} disabled={loading || !input.trim()}
          className="p-2 rounded-lg transition-colors disabled:opacity-40"
          style={{ background: '#a855f7' }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
