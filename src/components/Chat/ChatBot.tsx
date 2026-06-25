import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { t } from '../../i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

const SYSTEM_PROMPT = `Siz O'zbekiston geografiyasi bo'yicha mutaxassis va o'quv yordamchisiz.
GeoO'yin veb-ilovasi orqali foydalanuvchilarga O'zbekiston haqida ma'lumot berasiz.

Bilimlar:
- O'zbekiston 14 ta viloyat va Qoraqalpog'iston Respublikasidan iborat
- Viloyatlar: Toshkent sh., Toshkent vil., Samarqand, Farg'ona, Namangan, Andijon, Qashqadaryo, Surxondaryo, Buxoro, Navoiy, Xorazm, Jizzax, Sirdaryo, Qoraqalpog'iston
- Maydoni: 448 978 km², Aholisi: ~36 million
- Poytaxt: Toshkent shahri
- Rasmiy til: O'zbek tili, Pul birligi: So'm
- Muhim shaharlar: Toshkent, Samarqand, Namangan, Andijon, Farg'ona, Buxoro, Qarshi, Urganch, Nukus, Termiz
- Tarixiy joylar: Samarqand (Registon, Shohizinda, Guri Mir), Buxoro (Ark qal'asi, Kalon minorasi), Xiva (Ichan Qal'a)
- Daryolar: Amudaryo, Sirdaryo, Zarafshon, Qashqadaryo, Surxondaryo
- Tog'lar: Tyan-Shan, Pomir-Oloy, Hisor, Zarafshon, Turkiston tog' tizimlari
- Iqtisodiyot: Paxta, gaz, oltin, mis, ximiya sanoati

Qisqa, aniq va foydali javoblar bering. Foydalanuvchi so'ragan tilda javob bering (o'zbek, rus yoki ingliz).`;

export function ChatBot() {
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const welcomeText = t(language, 'chatWelcome' as Parameters<typeof t>[1]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeText }]);
    }
  }, [open, messages.length, welcomeText]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !API_KEY) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: { message?: string } }).error?.message || `API error ${res.status}`);
      }

      const data = await res.json() as { choices?: { message?: { content?: string } }[] };
      const reply = data.choices?.[0]?.message?.content ?? '...';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xato yuz berdi';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!API_KEY) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Chat bot"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-indigo-600 to-violet-600
          shadow-[0_4px_24px_rgba(99,102,241,0.5)]
          flex items-center justify-center
          hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        {open
          ? <X size={22} className="text-white" strokeWidth={2.5} />
          : <MessageCircle size={22} className="text-white" strokeWidth={2} />
        }
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[340px] max-w-[calc(100vw-2rem)]
            bg-[#0e1628] border border-slate-700/60 rounded-2xl shadow-2xl
            flex flex-col overflow-hidden"
          style={{ height: '480px' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/60 bg-[#080c1c]
            flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30
              flex items-center justify-center">
              <Bot size={16} className="text-indigo-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">
                {t(language, 'chatTitle' as Parameters<typeof t>[1])}
              </p>
              <p className="text-[10px] text-emerald-400">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                    : 'bg-emerald-500/20 border border-emerald-500/30'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot size={12} className="text-indigo-400" />
                    : <User size={12} className="text-emerald-400" />
                  }
                </div>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-slate-800/80 text-slate-200 rounded-tl-none'
                    : 'bg-indigo-600/80 text-white rounded-tr-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30
                  flex items-center justify-center">
                  <Bot size={12} className="text-indigo-400" />
                </div>
                <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-3 py-2">
                  <Loader2 size={14} className="text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-700/60 bg-[#080c1c] flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t(language, 'chatPlaceholder' as Parameters<typeof t>[1])}
                rows={1}
                className="flex-1 text-sm bg-slate-800/60 border border-slate-700/50
                  rounded-xl px-3 py-2.5 text-slate-200 outline-none
                  focus:border-indigo-500/50 resize-none
                  placeholder:text-slate-600 max-h-24"
                style={{ lineHeight: '1.4' }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500
                  disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center transition-colors"
              >
                <Send size={16} className="text-white" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ChatBotMissing() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2
      bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3
      shadow-xl text-xs text-slate-400">
      <AlertCircle size={14} className="text-amber-400 flex-shrink-0" strokeWidth={2} />
      <span>VITE_OPENAI_API_KEY not set</span>
    </div>
  );
}
