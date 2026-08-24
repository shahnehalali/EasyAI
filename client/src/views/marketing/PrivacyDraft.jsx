import { useLangStore } from '@/store/langStore';
import { Banner } from '@/components/ui/Ui';

// Draft only. Placeholders in [brackets] need real company detail and a
// lawyer's sign off (GDPR Art. 13) before this page is treated as final.
export default function PrivacyDraft() {
  const lang = useLangStore((s) => s.lang);
  const de = lang === 'de';

  return (
    <div className="mkt-section" style={{ paddingTop: 64 }} data-testid="marketing-privacy">
      <div className="content" style={{ maxWidth: 720 }}>
        <div className="eyebrow">{de ? 'Datenschutz' : 'Privacy'}</div>
        <h1 className="mkt-h1" style={{ fontSize: 32, textAlign: 'left', marginBottom: 18 }}>
          {de ? 'Datenschutzerklaerung' : 'Privacy notice'}
        </h1>

        <Banner kind="warn">
          {de
            ? 'Entwurf. Dieser Text ist noch nicht rechtlich geprueft und ersetzt keine anwaltliche Beratung.'
            : 'Draft. This text has not been reviewed by a lawyer and is not a finished legal document.'}
        </Banner>

        <div className="stack" style={{ gap: 22, marginTop: 22, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
          <p>
            {de
              ? 'Verantwortlich fuer die Datenverarbeitung im Sinne der DSGVO ist [Firmenname], [Adresse], vertreten durch [Geschaeftsfuehrung]. Kontakt fuer Datenschutzfragen: [E-Mail-Adresse].'
              : 'The party responsible for data processing under the GDPR is [company name], [address], represented by [management]. Contact for data protection questions: [email address].'}
          </p>
          <p>
            {de
              ? 'Wir verarbeiten Kontodaten (Name, E-Mail-Adresse, Rolle), Organisationsdaten und die von Ihnen erfassten Compliance-Inhalte, um Ihnen den Dienst bereitzustellen. Rechtsgrundlage ist die Erfuellung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).'
              : 'We process account data (name, email address, role), organisation data, and the compliance content you enter, in order to provide the service to you. The legal basis is performance of the service contract (Art. 6(1)(b) GDPR).'}
          </p>
          <p>
            {de
              ? 'Sensible Inhalte werden mit einem organisationsspezifischen Schluessel verschluesselt gespeichert. Sie koennen Ihre Daten jederzeit in den Einstellungen einsehen, exportieren oder loeschen lassen (Art. 15, 17 und 20 DSGVO).'
              : 'Sensitive content is stored encrypted with a key unique to your organisation. You can view, export, or delete your data at any time from Settings (Art. 15, 17, and 20 GDPR).'}
          </p>
          <p>
            {de
              ? 'Eingesetzte Auftragsverarbeiter und deren Standorte werden hier aufgefuehrt, sobald die Liste final ist. [Auftragsverarbeiter-Liste ausstehend]'
              : 'The list of sub-processors we use and their locations will appear here once finalised. [Sub-processor list pending]'}
          </p>
          <p>
            {de
              ? 'Bei Fragen oder zur Ausuebung Ihrer Betroffenenrechte wenden Sie sich an [E-Mail-Adresse]. Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehoerde zu beschweren.'
              : 'For questions or to exercise your data subject rights, contact [email address]. You also have the right to lodge a complaint with a data protection supervisory authority.'}
          </p>
        </div>
      </div>
    </div>
  );
}
