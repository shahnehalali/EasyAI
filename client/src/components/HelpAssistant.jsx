import { useState, useRef, useEffect } from 'react';
import { MessagesSquare, X, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { answerFor, HELP_GREETING } from '@/data/helpContent';
import { lawApi } from '@/apis/lawApi';
import { tLaw } from '@/i18n/lawExplorer';
import { useLangStore } from '@/store/langStore';
import { useT } from '@/hooks/useT';
import TextMorph from '@/components/ui/TextMorph';

let nextId = 1;
const mkId = () => `m${nextId++}`;

// A single line of assistant text that morphs in (Motion Primitives Text Morph):
// it mounts empty, then the characters morph into the final text on the next
// frame, giving the assistant a "writing" effect.
function MorphLine({ text }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(text));
    return () => cancelAnimationFrame(id);
  }, [text]);
  return <TextMorph as="div">{shown}</TextMorph>;
}

// Render a (possibly multi-line) assistant message, morphing each line in.
function MorphMessage({ text }) {
  return text.split('\n').map((line, i) => (line === '' ? <br key={i} /> : <MorphLine key={i} text={line} />));
}

export default function HelpAssistant() {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: mkId(), from: 'bot', text: HELP_GREETING[lang] }]);
  const [draft, setDraft] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // The law catalog answers "what is the EU AI Act?" straight from the Law
  // Explorer's content, so there is one source of truth. Fetched only once the
  // panel opens, sharing the Law Explorer's ['laws'] cache.
  const { data: laws } = useQuery({
    queryKey: ['laws'], queryFn: lawApi.explorer, enabled: open, staleTime: 5 * 60 * 1000,
  });

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
    // How-to topic, glossary term, or a law from the catalog.
    pushBot(answerFor(text, lang, laws?.frameworks || [], tLaw));
  };

  return (
    <>
      {/* Floating chat launcher: the chat icon; opens/closes the help panel. */}
      <button
        className="help-launcher"
        data-testid="help-launcher"
        data-feedback-hide-during-capture
        aria-label={open ? t('help.close') : t('help.open')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={22} /> : <MessagesSquare size={22} />}
      </button>

      {open && (
        <div className="help-panel" data-testid="help-panel" role="dialog" aria-label={t('help.title')}>
          <div className="help-head">
            <div className="help-head-id">
              <span className="help-avatar" aria-hidden="true"><MessagesSquare size={17} strokeWidth={2} /></span>
              <div>
                <div className="help-title">{t('help.title')}</div>
                <div className="help-sub">{t('help.sub')}</div>
              </div>
            </div>
            <button className="help-close" aria-label={t('help.close')} onClick={() => setOpen(false)}><X size={18} /></button>
          </div>

          <div className="help-body" ref={bodyRef} data-testid="help-body">
            {messages.map((m) => (
              <div key={m.id} className={`help-msg help-msg-${m.from}`} data-testid={`help-msg-${m.from}`}>
                {m.from === 'bot'
                  ? <MorphMessage text={m.text} />
                  : m.text.split('\n').map((line, i) => (line === '' ? <br key={i} /> : <div key={i}>{line}</div>))}
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
            <button className="help-send" data-testid="help-send" onClick={onSend} disabled={!draft.trim()} aria-label={t('help.send')}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
