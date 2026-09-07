import { useLangStore } from '@/store/langStore';
import { Banner } from '@/components/ui/Ui';

// Draft. Controller identity and the sub-processor list are the real,
// current facts (sourced from rit.services' own imprint and its Art. 28
// GDPR data processing agreements), not placeholders. The rest of this page
// (legal basis per processing activity, full data subject rights procedure,
// retention detail) is still a stub and needs a lawyer's sign off before it
// is treated as a finished GDPR Art. 13 notice.
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
              ? 'Verantwortlich fuer die Datenverarbeitung im Sinne der DSGVO ist die RIT Services GmbH, Am alten Gueterbahnhof 57, 50825 Koeln, vertreten durch Matthias Wessner. Kontakt fuer Datenschutzfragen: info@rit.services.'
              : 'The party responsible for data processing under the GDPR is RIT Services GmbH, Am alten Gueterbahnhof 57, 50825 Koeln, Germany, represented by Matthias Wessner. Contact for data protection questions: info@rit.services.'}
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
              ? 'Eingesetzte Unterauftragsverarbeiter: Hetzner Online GmbH, IONOS SE und STRATO GmbH fuer das Hosting (Rechenzentren in Deutschland und Finnland, kein Zugriff auf Inhalte), sowie Resend (Plus Five Five, Inc., USA) fuer den Versand transaktionaler E-Mails, im Rahmen des EU-US Data Privacy Framework.'
              : 'Sub-processors in use: Hetzner Online GmbH, IONOS SE and STRATO GmbH for hosting (data centres in Germany and Finland, no access to content), and Resend (Plus Five Five, Inc., USA) for transactional email delivery, under the EU-US Data Privacy Framework.'}
          </p>
          <p>
            {de
              ? 'Bei Fragen oder zur Ausuebung Ihrer Betroffenenrechte wenden Sie sich an info@rit.services. Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehoerde zu beschweren.'
              : 'For questions or to exercise your data subject rights, contact info@rit.services. You also have the right to lodge a complaint with a data protection supervisory authority.'}
          </p>
        </div>
      </div>
    </div>
  );
}
