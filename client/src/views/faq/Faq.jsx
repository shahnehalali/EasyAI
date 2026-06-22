import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_CATEGORIES } from '@/data/faqContent';
import { useT } from '@/hooks/useT';
import { useLangStore } from '@/store/langStore';

export default function Faq() {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const [open, setOpen] = useState(() => new Set());

  const toggle = (id) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div data-testid="faq">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('faq.eyebrow')}</div>
          <h1>{t('faq.title')}</h1>
          <p className="sub">{t('faq.sub')}</p>
        </div>
      </div>

      <div className="stack">
        {FAQ_CATEGORIES.map((cat) => (
          <div key={cat.id} className="card" data-testid={`faq-category-${cat.id}`}>
            <div className="card-head"><h3>{cat.title[lang]}</h3></div>
            <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {cat.items.map((item) => {
                const isOpen = open.has(item.id);
                return (
                  <div key={item.id} className="faq-item">
                    <button
                      className="faq-q"
                      data-testid={`faq-q-${item.id}`}
                      aria-expanded={isOpen}
                      onClick={() => toggle(item.id)}
                    >
                      <span>{item.q[lang]}</span>
                      <ChevronDown size={17} className="faq-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
                    </button>
                    {isOpen && <p className="faq-a" data-testid={`faq-a-${item.id}`}>{item.a[lang]}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: 11, marginTop: 16 }}>{t('faq.disclaimer')}</p>
    </div>
  );
}
