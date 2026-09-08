import { Building2, UserRound, Mail, Landmark, Receipt, ShieldCheck, Share2 } from 'lucide-react';
import { useLangStore } from '@/store/langStore';

// Real provider identification under DDG Section 5 (formerly TMG Section 5),
// sourced from rit.services' own imprint and the AVV (Art. 28 GDPR data
// processing agreement) on file. Company name and address use the same
// ASCII-safe transliteration (ue/oe/ae/ss) as the rest of this bilingual
// content, ue for ue, oe for oe, a widely accepted German spelling
// convention, not an inaccuracy.
const LAST_REVIEWED = { en: '7 September 2026', de: '7. September 2026' };

// One continuous document-style panel (label column + value column, a
// hairline between rows) instead of a grid of separate boxes with empty
// space between them, in the same brand teal used everywhere else.
function FactRow({ icon: Icon, label, children, wide }) {
  return (
    <div className={`mkt-fact-row${wide ? ' wide' : ''}`}>
      <div className="mkt-fact-row-label"><Icon size={15} />{label}</div>
      <div className="mkt-fact-row-value">{children}</div>
    </div>
  );
}

export default function ImprintDraft() {
  const lang = useLangStore((s) => s.lang);
  const de = lang === 'de';

  const facts = [
    {
      icon: Building2,
      label: de ? 'Anbieter' : 'Provider',
      body: (
        <>RIT Services GmbH<br />Am alten Gueterbahnhof 57<br />50825 Koeln<br />{de ? 'Deutschland' : 'Germany'}</>
      ),
    },
    {
      icon: UserRound,
      label: de ? 'Vertreten durch' : 'Represented by',
      body: <>Matthias Wessner, {de ? 'Geschaeftsfuehrer' : 'Managing Director'}</>,
    },
    {
      icon: Mail,
      label: de ? 'Kontakt' : 'Contact',
      body: (
        <>{de ? 'E-Mail' : 'Email'}: info@rit.services<br />{de ? 'Telefon' : 'Phone'}: +49 221 9759994-1</>
      ),
    },
    {
      icon: Landmark,
      label: de ? 'Registereintrag' : 'Register entry',
      body: de ? 'Amtsgericht Koeln, HRB 115067' : 'Cologne Local Court (Amtsgericht Koeln), HRB 115067',
    },
    {
      icon: Receipt,
      label: de ? 'Umsatzsteuer-ID' : 'VAT ID',
      body: (
        <>{de ? 'Umsatzsteuer-Identifikationsnummer nach Paragraf 27a UStG' : 'VAT identification number under Section 27a of the German VAT Act'}: <strong>DE367518494</strong></>
      ),
    },
    {
      icon: ShieldCheck,
      label: de ? 'Inhaltlich verantwortlich' : 'Responsible for content',
      body: (
        <>
          {de ? 'Nach Paragraf 18 Abs. 2 MStV:' : 'Under Section 18(2) of the German Interstate Media Treaty (MStV):'}<br />
          Matthias Wessner<br />
          Am alten Gueterbahnhof 57, 50825 Koeln
        </>
      ),
    },
    {
      icon: Share2,
      label: de ? 'Unterauftragsverarbeiter' : 'Sub-processors',
      wide: true,
      body: de
        ? 'Hetzner Online GmbH, IONOS SE und STRATO GmbH (Rechenzentren, kein Datenzugriff auf Inhalte), sowie Resend (Plus Five Five, Inc., USA, E-Mail-Versand im Rahmen des EU-US Data Privacy Framework).'
        : 'Hetzner Online GmbH, IONOS SE and STRATO GmbH (data centres, no access to content), and Resend (Plus Five Five, Inc., USA, email delivery under the EU-US Data Privacy Framework).',
    },
  ];

  return (
    <div data-testid="marketing-imprint">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 920 }}>
          <div className="eyebrow">{de ? 'Rechtliches' : 'Legal'}</div>
          <h1 className="mkt-h1" style={{ fontSize: 36, textAlign: 'left' }}>
            {de ? 'Impressum' : 'Imprint'}
          </h1>
          <p className="muted small" style={{ marginTop: 12 }} data-testid="imprint-last-reviewed">
            {de ? 'Stand' : 'Last reviewed'}: {LAST_REVIEWED[lang]}
          </p>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 8 }}>
        <div className="content" style={{ maxWidth: 920 }}>
          <div className="card">
            <div className="card-body mkt-facts">
              {facts.map((f) => (
                <FactRow key={f.label} icon={f.icon} label={f.label} wide={f.wide}>{f.body}</FactRow>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
