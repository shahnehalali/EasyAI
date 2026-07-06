import { useState, useRef, useEffect } from 'react';
import { MessagesSquare, X, Send, ChevronUp } from 'lucide-react';
import { matchTopic, HELP_FALLBACK, HELP_GREETING } from '@/data/helpContent';
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
  const [fabOpen, setFabOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: mkId(), from: 'bot', text: HELP_GREETING[lang] }]);
  const [draft, setDraft] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const fabTimer = useRef(0);

  // Speed-dial: the chat launcher and the (external) screenshot-feedback button
  // form one dock in the bottom-right. Hovering either reveals the feedback
  // action popping up above the chat button; a short close delay lets the
  // pointer travel between them.
  const openFab = () => { clearTimeout(fabTimer.current); setFabOpen(true); };
  const closeFab = () => { clearTimeout(fabTimer.current); fabTimer.current = setTimeout(() => setFabOpen(false), 180); };

  useEffect(() => {
    let el = null;
    const on = () => openFab();
    const off = () => closeFab();
    const id = setTimeout(() => {
      el = document.querySelector('[data-feedback-trigger="true"]');
      if (el) { el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off); }
    }, 400);
    return () => {
      clearTimeout(id); clearTimeout(fabTimer.current);
      if (el) { el.removeEventListener('mouseenter', on); el.removeEventListener('mouseleave', off); }
    };
  }, []);

  // Reveal the feedback button only while the dock is hovered and the chat
  // panel is closed.
  useEffect(() => {
    const el = document.querySelector('[data-feedback-trigger="true"]');
    if (el) el.classList.toggle('fab-revealed', fabOpen && !open);
  }, [fabOpen, open]);

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
      {/* Chat quick-action: hidden until the dial is expanded (hover/tap). */}
      {!open && (
        <button
          className={`fab-action fab-chat${fabOpen ? ' fab-revealed' : ''}`}
          data-testid="fab-chat"
          aria-label={t('help.open')}
          aria-hidden={!fabOpen}
          tabIndex={fabOpen ? 0 : -1}
          onMouseEnter={openFab}
          onMouseLeave={closeFab}
          onClick={() => { setOpen(true); setFabOpen(false); }}
        >
          <MessagesSquare size={19} />
        </button>
      )}

      {/* Speed-dial trigger: a neutral arrow when collapsed. Hovering reveals the
          chat + feedback actions above it (the arrow flips up-side-down to signal
          the dial is open). Clicking it opens the chat panel directly; when the
          panel is open it becomes a close (X). Click opens chat rather than
          toggling the dial so it does not fight the hover handler. */}
      <button
        className={`help-launcher${!open && fabOpen ? ' is-open' : ''}`}
        data-testid="help-launcher"
        aria-label={open ? t('help.close') : t('help.open')}
        aria-expanded={open || fabOpen}
        onMouseEnter={openFab}
        onMouseLeave={closeFab}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={20} /> : <ChevronUp size={21} className="fab-arrow" />}
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
