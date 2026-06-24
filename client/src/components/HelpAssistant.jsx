import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { matchTopic, HELP_FALLBACK, HELP_GREETING } from '@/data/helpContent';
import { useLangStore } from '@/store/langStore';
import { useT } from '@/hooks/useT';

let nextId = 1;
const mkId = () => `m${nextId++}`;

export default function HelpAssistant() {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: mkId(), from: 'bot', text: HELP_GREETING[lang] }]);
  const [draft, setDraft] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the latest message in view and focus the input when opened.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);
  // Switching language starts a fresh conversation in that language.
  useEffect(() => {
    setMessages([{ id: mkId(), from: 'bot', text: HELP_GREETING[lang] }]);
  }, [lang]);

  const pushUser = (text) => setMessages((m) => [...m, { id: mkId(), from: 'user', text }]);
  const pushBot = (text) => setMessages((m) => [...m, { id: mkId(), from: 'bot', text }]);

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    pushUser(text);
    setDraft('');
    const topic = matchTopic(text);
    pushBot(topic ? topic.answer[lang] : HELP_FALLBACK[lang]);
  };

  return (
    <>
      <button
        className="help-launcher"
        data-testid="help-launcher"
        aria-label={open ? t('help.close') : t('help.open')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="help-panel" data-testid="help-panel" role="dialog" aria-label={t('help.title')}>
          <div className="help-head">
            <div>
              <div className="help-title">{t('help.title')}</div>
              <div className="help-sub">{t('help.sub')}</div>
            </div>
            <button className="help-close" aria-label={t('help.close')} onClick={() => setOpen(false)}><X size={18} /></button>
          </div>

          <div className="help-body" ref={bodyRef} data-testid="help-body">
            {messages.map((m) => (
              <div key={m.id} className={`help-msg help-msg-${m.from}`} data-testid={`help-msg-${m.from}`}>
                {m.text.split('\n').map((line, i) => (line === '' ? <br key={i} /> : <div key={i}>{line}</div>))}
              </div>
            ))}
          </div>

          <div className="help-input-row">
            <input
              ref={inputRef}
              className="input"
              data-testid="help-input"
              placeholder={t('help.placeholder')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSend(); } }}
            />
            <button className="btn btn-primary btn-sm" data-testid="help-send" onClick={onSend} disabled={!draft.trim()} aria-label={t('help.send')}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
