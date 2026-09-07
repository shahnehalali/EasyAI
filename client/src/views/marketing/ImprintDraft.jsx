import { useLangStore } from '@/store/langStore';

// Real provider identification under DDG Section 5 (formerly TMG Section 5),
// sourced from rit.services' own imprint and the AVV (Art. 28 GDPR data
// processing agreement) on file. Company name and address use the same
// ASCII-safe transliteration (ue/oe/ae/ss) as the rest of this bilingual
// content, ue for ue, oe for oe, a widely accepted German spelling
// convention, not an inaccuracy.
const LAST_REVIEWED = { en: '7 September 2026', de: '7. September 2026' };

export default function ImprintDraft() {
  const lang = useLangStore((s) => s.lang);
  const de = lang === 'de';

  return (
    <div className="mkt-section" style={{ paddingTop: 64 }} data-testid="marketing-imprint">
      <div className="content" style={{ maxWidth: 720 }}>
        <div className="eyebrow">{de ? 'Rechtliches' : 'Legal'}</div>
        <h1 className="mkt-h1" style={{ fontSize: 32, textAlign: 'left', marginBottom: 8 }}>
          {de ? 'Impressum' : 'Imprint'}
        </h1>
        <p className="muted small" style={{ marginBottom: 22 }} data-testid="imprint-last-reviewed">
          {de ? 'Stand' : 'Last reviewed'}: {LAST_REVIEWED[lang]}
        </p>

        <div className="stack" style={{ gap: 6, color: 'var(--ink-soft)', lineHeight: 1.8 }}>
          <p>
            <strong>{de ? 'Anbieter' : 'Provider'}</strong><br />
            RIT Services GmbH<br />
            Am alten Gueterbahnhof 57<br />
            50825 Koeln<br />
            {de ? 'Deutschland' : 'Germany'}
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>{de ? 'Vertreten durch' : 'Represented by'}</strong><br />
            Matthias Wessner, {de ? 'Geschaeftsfuehrer' : 'Managing Director'}
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>{de ? 'Kontakt' : 'Contact'}</strong><br />
            {de ? 'E-Mail' : 'Email'}: info@rit.services<br />
            {de ? 'Telefon' : 'Phone'}: +49 221 9759994-1
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>{de ? 'Registereintrag' : 'Register entry'}</strong><br />
            {de ? 'Amtsgericht Koeln, HRB 115067' : 'Cologne Local Court (Amtsgericht Koeln), HRB 115067'}
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>{de ? 'Umsatzsteuer-ID' : 'VAT ID'}</strong><br />
            {de ? 'Umsatzsteuer-Identifikationsnummer nach Paragraf 27a UStG' : 'VAT identification number under Section 27a of the German VAT Act'}: DE367518494
          </p>
          <p style={{ marginTop: 16 }}>
            {de
              ? 'Verantwortlich fuer den Inhalt nach Paragraf 18 Abs. 2 MStV:'
              : 'Responsible for content under Section 18(2) of the German Interstate Media Treaty (MStV):'}<br />
            Matthias Wessner<br />
            Am alten Gueterbahnhof 57, 50825 Koeln
          </p>
          <p style={{ marginTop: 16 }}>
            <strong>{de ? 'Auftragsverarbeiter' : 'Data processors'}</strong><br />
            {de
              ? 'Hetzner Online GmbH, IONOS SE und STRATO GmbH (Rechenzentren, kein Datenzugriff auf Inhalte), sowie Plus Five Five, Inc. (Resend, USA, E-Mail-Versand im Rahmen des EU-US Data Privacy Framework).'
              : 'Hetzner Online GmbH, IONOS SE and STRATO GmbH (data centres, no access to content), and Plus Five Five, Inc. (Resend, USA, email delivery under the EU-US Data Privacy Framework).'}
          </p>
        </div>
      </div>
    </div>
  );
}
