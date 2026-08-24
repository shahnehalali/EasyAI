import { useLangStore } from '@/store/langStore';
import { Banner } from '@/components/ui/Ui';

// Draft only. Placeholders in [brackets] need real company detail before this
// satisfies the mandatory Impressum requirement under DDG (Section) 5.
export default function ImprintDraft() {
  const lang = useLangStore((s) => s.lang);
  const de = lang === 'de';

  return (
    <div className="mkt-section" style={{ paddingTop: 64 }} data-testid="marketing-imprint">
      <div className="content" style={{ maxWidth: 720 }}>
        <div className="eyebrow">{de ? 'Rechtliches' : 'Legal'}</div>
        <h1 className="mkt-h1" style={{ fontSize: 32, textAlign: 'left', marginBottom: 18 }}>
          {de ? 'Impressum' : 'Imprint'}
        </h1>

        <Banner kind="warn">
          {de
            ? 'Entwurf. Diese Seite erfuellt die Anbieterkennzeichnung nach Paragraf 5 DDG erst, wenn die Platzhalter durch echte Angaben ersetzt sind.'
            : 'Draft. This page only satisfies the mandatory German provider identification (DDG Section 5) once the placeholders are replaced with real details.'}
        </Banner>

        <div className="stack" style={{ gap: 6, marginTop: 22, color: 'var(--ink-soft)', lineHeight: 1.8 }}>
          <p><strong>{de ? 'Anbieter' : 'Provider'}</strong><br />[Firmenname]<br />[Strasse und Hausnummer]<br />[PLZ und Ort]<br />{de ? 'Deutschland' : 'Germany'}</p>
          <p style={{ marginTop: 16 }}><strong>{de ? 'Vertreten durch' : 'Represented by'}</strong><br />[Name der Geschaeftsfuehrung]</p>
          <p style={{ marginTop: 16 }}><strong>{de ? 'Kontakt' : 'Contact'}</strong><br />{de ? 'E-Mail' : 'Email'}: [E-Mail-Adresse]</p>
          <p style={{ marginTop: 16 }}><strong>{de ? 'Registereintrag' : 'Register entry'}</strong><br />[Registergericht, Registernummer]</p>
          <p style={{ marginTop: 16 }}><strong>{de ? 'Umsatzsteuer-ID' : 'VAT ID'}</strong><br />[USt-IdNr. nach Paragraf 27a UStG]</p>
          <p style={{ marginTop: 16 }}>
            {de
              ? 'Verantwortlich fuer den Inhalt nach Paragraf 18 Abs. 2 MStV: [Name, Anschrift]'
              : 'Responsible for content under Section 18(2) MStV: [name, address]'}
          </p>
        </div>
      </div>
    </div>
  );
}
